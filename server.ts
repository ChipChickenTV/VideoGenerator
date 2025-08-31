import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { VideoProps, VideoPropsSchema } from './src/types/VideoProps';
import { renderVideo } from './src/renderer';
import { uploadToSupabase } from './src/lib/supabase';
import { getAllAnimations, getTextAnimation, getImageAnimation, getTransitionAnimation } from './src/animations';
import { TypedAnimationFunction } from './src/animations/types';
import { analyze1DepthSchema, analyzeFieldSchema } from './src/utils/schemaAnalyzer';

// .env 파일 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
    let bucket: string;
    let supabaseVideoPath: string;
    
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
      
      // inputUrl에서 버킷과 경로 추출
      // 예: http://.../storage/v1/object/public/ssul/FinalResult/thziiv32gs_new.json
      const urlParts = new URL(inputUrl);
      const pathParts = urlParts.pathname.split('/');
      
      // "/storage/v1/object/public/".length = 5
      bucket = pathParts[5];
      const supabasePathPrefix = pathParts.slice(6, -1).join('/'); // 'FinalResult'
      const jsonFilename = path.basename(urlParts.pathname, '.json');
      supabaseVideoPath = `${supabasePathPrefix}/${jsonFilename}.mp4`;
      
    } else {
      // 신규 방식: videoData 직접 사용
      console.log('📄 직접 JSON 데이터 사용');
      props = videoData as VideoProps;
      
      // outputConfig에서 설정 추출
      const filename = outputConfig?.filename || `video_${Date.now()}`;
      bucket = outputConfig?.bucket || 'ssul';
      const pathPrefix = outputConfig?.path || 'videos';
      supabaseVideoPath = `${pathPrefix}/${filename}.mp4`;
    }
    
    // 렌더링 실행
    const outputPath = `out/video_${Date.now()}.mp4`;
    console.log('🎬 비디오 렌더링 시작 (renderer 모듈 호출)...');
    
    const result = await renderVideo(props, {
      outputPath,
      codec: 'h264',
      verbose: true,
    });
    
    const totalDuration = Date.now() - startTime;
    
    if (result.success) {
      console.log(`✅ 렌더링 성공! (${result.duration}ms)`);

      // Supabase에 업로드
      const publicUrl = await uploadToSupabase(result.outputPath, bucket, supabaseVideoPath);

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
        videoUrl: publicUrl,
        duration: totalDuration,
        uploadPath: supabaseVideoPath
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