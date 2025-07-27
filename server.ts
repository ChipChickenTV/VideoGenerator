import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { VideoProps } from './src/types/VideoProps';
import { renderVideo } from './src/renderer';
import { uploadToSupabase } from './src/lib/supabase';

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

// 비디오 렌더링 엔드포인트 (inputUrl 방식)
app.post('/render', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { inputUrl } = req.body;
    
    if (!inputUrl) {
      return res.status(400).json({
        success: false,
        error: 'inputUrl is required'
      });
    }
    
    console.log('🚀 입력 URL에서 JSON 다운로드:', inputUrl);
    
    // inputUrl에서 JSON 다운로드
    const response = await fetch(inputUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON from ${inputUrl}: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    console.log('📄 JSON 다운로드 완료');
    
    // Props 검증 및 변환은 renderer 모듈로 위임합니다.
    const props = rawData as VideoProps;
    
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
      
      // inputUrl에서 버킷과 경로 추출
      // 예: http://.../storage/v1/object/public/ssul/FinalResult/thziiv32gs_new.json
      const urlParts = new URL(inputUrl);
      const pathParts = urlParts.pathname.split('/');
      
      // "/storage/v1/object/public/".length = 5
      const bucket = pathParts[5];
      const supabasePathPrefix = pathParts.slice(6, -1).join('/'); // 'FinalResult'
      const jsonFilename = path.basename(urlParts.pathname, '.json');
      const supabaseVideoPath = `${supabasePathPrefix}/${jsonFilename}.mp4`;

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
  console.log('  POST /render - inputUrl로 비디오 렌더링');
  console.log('  GET /output/* - 렌더링 결과 다운로드');
  console.log('');
  console.log('💡 사용법:');
  console.log(`  curl -X POST http://localhost:${PORT}/render \\`);
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d \'{"inputUrl": "http://your-url/input.json"}\'');
});

export default app; 