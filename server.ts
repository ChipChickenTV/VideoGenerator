import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { VideoProps, VideoPropsSchema } from './src/types/VideoProps';
import { renderVideo } from './src/renderer';
import {
  uploadToGoogleDrive,
  ensureDrivePath,
  extractDriveFileIdFromUrl,
  extractDriveFolderIdFromUrl,
  downloadDriveFile,
  getDriveFileMetadata,
  getFolderPath,
} from './src/lib/drive';
import { getAllAnimations, getTextAnimation, getImageAnimation, getTransitionAnimation } from './src/animations';
import { TypedAnimationFunction } from './src/animations/types';
import { analyze1DepthSchema, analyzeFieldSchema } from './src/utils/schemaAnalyzer';

// .env 파일 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

function getProxyBaseUrl(req: express.Request): string {
  const forwardedProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  return `${protocol}://${host}`.replace(/\/$/, '');
}

function toProxyUrl(baseUrl: string, fileId: string): string {
  return `${baseUrl.replace(/\/$/, '')}/drive/file/${fileId}`;
}

function rewritePropsWithDriveProxy(props: VideoProps, proxyBaseUrl: string): VideoProps {
  const originalMedia = props.media || [];
  const transformUrl = (original?: string): string | undefined => {
    if (!original) {
      return original;
    }
    const fileId = extractDriveFileIdFromUrl(original);
    return fileId ? toProxyUrl(proxyBaseUrl, fileId) : original;
  };

  const media = originalMedia.map((scene) => {
    let mutated = false;
    const nextScene = { ...scene };

    if (scene.voice) {
      const transformedVoice = transformUrl(scene.voice);
      if (transformedVoice && transformedVoice !== scene.voice) {
        nextScene.voice = transformedVoice;
        mutated = true;
      }
    }

    if (scene.image?.url) {
      const transformedImageUrl = transformUrl(scene.image.url);
      if (transformedImageUrl && transformedImageUrl !== scene.image.url) {
        nextScene.image = { ...scene.image, url: transformedImageUrl };
        mutated = true;
      }
    }

    if (scene.script?.url) {
      const transformedScriptUrl = transformUrl(scene.script.url);
      if (transformedScriptUrl && transformedScriptUrl !== scene.script.url) {
        nextScene.script = { ...scene.script, url: transformedScriptUrl };
        mutated = true;
      }
    }

    return mutated ? nextScene : scene;
  });

  const hasMutation = media.some((scene, index) => scene !== originalMedia[index]);
  return hasMutation ? { ...props, media } : props;
}

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 정적 파일 서빙 (렌더링 결과 다운로드용)
app.use('/output', express.static('out'));

// 정적 파일 서빙 (웹 UI용)
app.use(express.static('public'));

// Health check 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development'
  });
});

// JSON 스키마 1depth 구조 엔드포인트 (동적 분석)
app.get('/api/schema', (req, res) => {
  try {
    const analysis = analyze1DepthSchema(VideoPropsSchema);
    
    res.json({
      success: true,
      ...analysis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to analyze schema',
      message: error.message
    });
  }
});

// 특정 필드 상세 스키마 엔드포인트 (동적 분석)
app.get('/api/schema/:field', (req, res) => {
  try {
    const { field } = req.params;
    const analysis = analyzeFieldSchema(VideoPropsSchema, field);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Field not found or not analyzable',
        message: `Field '${field}' does not exist or is not an object type`
      });
    }
    
    res.json({
      success: true,
      field: field,
      ...analysis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to analyze field schema',
      message: error.message
    });
  }
});

// 애니메이션 리스트 엔드포인트 (완전 동적)
app.get('/api/animations', (req, res) => {
  try {
    const animations = getAllAnimations();
    res.json({
      success: true,
      animations: animations,
      count: animations.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get animations',
      message: error.message
    });
  }
});

// 특정 애니메이션 파라미터 가이드 엔드포인트 (메타데이터 기반)
app.get('/api/animations/:type/:name', (req, res) => {
  try {
    const { type, name } = req.params;
    
    let animation;
    if (type === 'text') {
      animation = getTextAnimation(name);
    } else if (type === 'image') {
      animation = getImageAnimation(name);
    } else if (type === 'transition') {
      animation = getTransitionAnimation(name);
    }
    
    if (!animation) {
      return res.status(404).json({
        success: false,
        error: 'Animation not found',
        message: `Animation ${type}/${name} does not exist`
      });
    }

    // TypedAnimationFunction인지 체크
    const hasMetadata = 'metadata' in animation && animation.metadata;
    
    if (!hasMetadata) {
      return res.status(404).json({
        success: false,
        error: 'Animation metadata not found',
        message: `Animation ${type}/${name} does not have metadata`
      });
    }
    
    // hasMetadata 검증 후 안전한 타입 캐스팅
    const typedAnimation = animation as TypedAnimationFunction;
    
    res.json({
      success: true,
      description: typedAnimation.metadata.description,
      fields: typedAnimation.metadata.params || {},
      defaultDuration: typedAnimation.metadata.defaultDuration
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get animation parameters',
      message: error.message
    });
  }
});

// Google Drive 파일 프록시 엔드포인트
app.get('/drive/file/:fileId', async (req, res) => {
  const { fileId } = req.params;

  if (!fileId) {
    return res.status(400).json({
      success: false,
      error: 'File ID is required',
    });
  }

  try {
    const rangeHeader = typeof req.headers.range === 'string' ? req.headers.range : undefined;
    const { stream, metadata, headers, status } = await downloadDriveFile(fileId, { rangeHeader });

    res.status(status || 200);

    const forwardedHeaders = ['content-range', 'content-length', 'accept-ranges'];
    forwardedHeaders.forEach((key) => {
      const headerValue = headers[key];
      if (headerValue && !res.getHeader(key)) {
        res.setHeader(key, headerValue as string);
      }
    });

    res.setHeader('Cache-Control', 'public, max-age=3600');
    if (!res.getHeader('Accept-Ranges')) {
      res.setHeader('Accept-Ranges', 'bytes');
    }

    if (metadata?.mimeType && !res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', metadata.mimeType);
    } else if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    if (metadata?.name && !res.getHeader('Content-Disposition')) {
      const encoded = encodeURIComponent(metadata.name);
      res.setHeader('Content-Disposition', `inline; filename="${encoded}"; filename*=UTF-8''${encoded}`);
    }

    if (metadata?.size && !rangeHeader && !res.getHeader('Content-Length')) {
      const numericSize = Number(metadata.size);
      if (!Number.isNaN(numericSize)) {
        res.setHeader('Content-Length', numericSize);
      }
    }

    stream.on('error', (streamError) => {
      console.error(`⚠️ Google Drive 스트림 오류 (fileId=${fileId})`, streamError);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to stream file from Google Drive',
        });
      } else {
        res.destroy(streamError);
      }
    });

    stream.pipe(res);
  } catch (error: any) {
    console.error(`❌ Google Drive 파일 프록시 실패 (fileId=${fileId})`, error?.message || error);

    const statusCode = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.error?.message ||
      error?.message ||
      'Failed to fetch file from Google Drive';

    if (!res.headersSent) {
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    } else {
      res.destroy(error);
    }
  }
});





// 비디오 렌더링 엔드포인트 (inputUrl 또는 videoData 방식)
app.post('/render', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { inputUrl, videoData, outputConfig } = req.body;
    
    // inputUrl과 videoData 중 하나는 필수
    if (!inputUrl && !videoData) {
      return res.status(400).json({
        success: false,
        error: 'Either inputUrl or videoData is required'
      });
    }

    // 둘 다 있으면 에러
    if (inputUrl && videoData) {
      return res.status(400).json({
        success: false,
        error: 'Cannot specify both inputUrl and videoData. Choose one.'
      });
    }
    
    let props: VideoProps;
    const driveRootFolderId = process.env.DRIVE_FOLDER_ID;

    if (!driveRootFolderId) {
      throw new Error('DRIVE_FOLDER_ID 환경 변수가 설정되어 있지 않습니다.');
    }

    let targetFolderId: string | undefined;
    let targetFolderPathNames: string[] = [];
    let outputFileName: string | undefined;
    
    if (inputUrl) {
      // 기존 방식: inputUrl에서 JSON 다운로드
      console.log('🚀 입력 URL에서 JSON 다운로드:', inputUrl);
      
      const response = await fetch(inputUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON from ${inputUrl}: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log('📄 JSON 다운로드 완료');
      props = rawData as VideoProps;
      
      const driveFileId = extractDriveFileIdFromUrl(inputUrl);
      if (driveFileId) {
        const metadata = await getDriveFileMetadata(driveFileId);

        if (metadata?.parents?.length) {
          targetFolderId = metadata.parents[0];
          try {
            targetFolderPathNames = await getFolderPath(targetFolderId, driveRootFolderId);
          } catch (e) {
            console.warn('⚠️ 드라이브 폴더 경로 조회 실패, 기본 경로로 대체합니다.', e);
            targetFolderPathNames = [];
          }
        }

        if (metadata?.name) {
          const parsedName = path.parse(metadata.name);
          outputFileName = `${parsedName.name}.mp4`;
        }
      }

      if (!targetFolderId) {
        const { id, segments } = await ensureDrivePath(driveRootFolderId, ['ChipChickenScience_Final']);
        targetFolderId = id;
        targetFolderPathNames = segments.map((segment) => segment.name);
      }

      if (!outputFileName) {
        const urlParts = new URL(inputUrl);
        const guessedName = path.parse(urlParts.pathname).name || `video_${Date.now()}`;
        outputFileName = `${guessedName}.mp4`;
      }
      
    } else {
      // 신규 방식: videoData 직접 사용
      console.log('📄 직접 JSON 데이터 사용');
      props = videoData as VideoProps;
      
      // outputConfig에서 설정 추출
      const filename = outputConfig?.filename || `video_${Date.now()}`;
      const rawPathValue = (outputConfig?.path ?? '').trim();
      const rawBucketValue = (outputConfig?.bucket ?? '').trim();

      const isLikelyDriveId = (value: string) => /^[a-zA-Z0-9_-]{10,}$/.test(value) && !value.includes('/');

      let explicitFolderId: string | undefined;

      if (rawPathValue) {
        const fromUrl = extractDriveFolderIdFromUrl(rawPathValue);
        if (fromUrl) {
          explicitFolderId = fromUrl;
        } else if (isLikelyDriveId(rawPathValue)) {
          explicitFolderId = rawPathValue;
        }
      }

      if (!explicitFolderId && rawBucketValue && isLikelyDriveId(rawBucketValue)) {
        explicitFolderId = rawBucketValue;
      }

      if (explicitFolderId) {
        targetFolderId = explicitFolderId;
        try {
          targetFolderPathNames = await getFolderPath(explicitFolderId, driveRootFolderId);
        } catch (e) {
          console.warn('⚠️ 지정된 드라이브 폴더 경로를 조회하지 못했습니다. (bucket/path)', e);
          targetFolderPathNames = [];
        }
      } else {
        const defaultBucket = rawBucketValue || 'ChipChickenScience_Final';
        const rawSegments = rawPathValue.split('/').map((segment: string) => segment.trim()).filter(Boolean);
        const folderSegments = [...rawSegments];

        if (!folderSegments.length || folderSegments[0] !== defaultBucket) {
          folderSegments.unshift(defaultBucket);
        }

        const ensured = await ensureDrivePath(driveRootFolderId, folderSegments);
        targetFolderId = ensured.id;
        targetFolderPathNames = ensured.segments.map((segment) => segment.name);
      }

      outputFileName = `${filename}.mp4`;
    }

    if (!targetFolderId) {
      throw new Error('Google Drive 업로드 대상 폴더를 결정하지 못했습니다.');
    }

    if (!outputFileName) {
      outputFileName = `video_${Date.now()}.mp4`;
    }
    
    const proxyBaseUrl = getProxyBaseUrl(req);
    const proxiedProps = rewritePropsWithDriveProxy(props, proxyBaseUrl);

    // 렌더링 실행
    const outputPath = `out/video_${Date.now()}.mp4`;
    console.log('🎬 비디오 렌더링 시작 (renderer 모듈 호출)...');
    
    const result = await renderVideo(proxiedProps, {
      outputPath,
      codec: 'h264',
      verbose: true,
    });
    
    const totalDuration = Date.now() - startTime;
    
    if (result.success) {
      console.log(`✅ 렌더링 성공! (${result.duration}ms)`);

      console.log(`📤 Google Drive 업로드 준비: ${targetFolderPathNames.join(' / ')} / ${outputFileName}`);

      const uploadResult = await uploadToGoogleDrive(result.outputPath, {
        targetFolderId,
        fileName: outputFileName,
        mimeType: 'video/mp4',
      });

      let resolvedFolderPath = targetFolderPathNames;
      if (uploadResult.parents?.[0]) {
        try {
          resolvedFolderPath = await getFolderPath(uploadResult.parents[0], driveRootFolderId);
        } catch (e) {
          console.warn('⚠️ 업로드된 파일의 폴더 경로 조회에 실패했습니다.', e);
        }
      }

      const uploadPath = [...resolvedFolderPath, uploadResult.name].join('/');

      // 로컬 파일 삭제
      try {
        await fs.unlink(result.outputPath);
        console.log(`🗑️ 로컬 임시 파일 삭제: ${result.outputPath}`);
      } catch (e) {
        console.error(`⚠️ 로컬 임시 파일 삭제 실패: ${e}`);
      }
      
      const totalDuration = Date.now() - startTime;

      res.json({
        success: true,
        message: 'Video rendering and upload completed successfully',
        videoUrl: uploadResult.publicUrl,
        duration: totalDuration,
        uploadPath,
        driveFileId: uploadResult.fileId,
        driveWebViewUrl: uploadResult.webViewUrl
      });
    } else {
      console.error(`❌ 렌더링 실패: ${result.error}`);
      
      res.status(500).json({
        success: false,
        error: result.error,
        duration: totalDuration
      });
    }
    
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error('💥 렌더링 중 예외 발생:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      duration: totalDuration
    });
  }
});

// 에러 핸들러
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 서버 에러:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('🎬 VideoWeb3 Simple API Server 시작!');
  console.log(`🌐 포트: ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('🔗 엔드포인트:');
  console.log('  GET /health - 서버 상태 확인');
  console.log('  GET /api/schema - JSON 스키마 1depth 구조');
  console.log('  GET /api/schema/:field - 특정 필드 상세 스키마');
  console.log('  GET /api/animations - 사용 가능한 애니메이션 목록');
  console.log('  GET /api/animations/:type/:name - 특정 애니메이션 사용법');
  console.log('  POST /render - inputUrl 또는 videoData로 비디오 렌더링');
  console.log('  GET /output/* - 렌더링 결과 다운로드');
  console.log('');
  console.log('💡 사용법:');
  console.log('  # 방법 1: URL에서 JSON 가져오기');
  console.log(`  curl -X POST http://localhost:${PORT}/render \\`);
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d \'{"inputUrl": "http://your-url/input.json"}\'');
  console.log('');
  console.log('  # 방법 2: JSON 직접 전달');
  console.log(`  curl -X POST http://localhost:${PORT}/render \\`);
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d \'{"videoData": {...}, "outputConfig": {"filename": "my_video", "bucket": "ssul", "path": "videos"}}\'');
});

export default app; 
