#!/usr/bin/env ts-node

import { renderVideo, renderStill, RenderOptions } from './src/renderer';
import { VideoPropsSchema, VideoProps } from './src/types/VideoProps';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// CLI 인자 파싱
interface CLIArgs {
  command: 'video' | 'still';
  propsFile?: string;
  props?: string;
  outputPath?: string;
  codec?: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores';
  frame?: number;
  jpegQuality?: number;
  concurrency?: number;
  verbose?: boolean;
  help?: boolean;
}

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const result: CLIArgs = { command: 'video' };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    switch (arg) {
      case 'video':
        result.command = 'video';
        break;
      case 'still':
        result.command = 'still';
        break;
      case '--props-file':
        result.propsFile = nextArg;
        i++;
        break;
      case '--props':
        result.props = nextArg;
        i++;
        break;
      case '--output':
        result.outputPath = nextArg;
        i++;
        break;
      case '--codec':
        result.codec = nextArg as any;
        i++;
        break;
      case '--frame':
        result.frame = parseInt(nextArg);
        i++;
        break;
      case '--jpeg-quality':
        result.jpegQuality = parseInt(nextArg);
        i++;
        break;
      case '--concurrency':
        result.concurrency = parseInt(nextArg);
        i++;
        break;
      case '--verbose':
        result.verbose = true;
        break;
      case '--help':
      case '-h':
        result.help = true;
        break;
    }
  }
  
  return result;
}

function showHelp() {
  console.log(`
🎬 VideoWeb3 CLI 렌더링 도구

사용법:
  npx ts-node render.ts <command> [options]

명령어:
  video        비디오 렌더링 (기본값)
  still        스틸 이미지 렌더링

옵션:
  --props-file <path>     Props JSON 파일 경로
  --props <json>          Props JSON 문자열
  --output <path>         출력 파일 경로
  --codec <codec>         비디오 코덱 (h264, h265, vp8, vp9, prores)
  --frame <number>        스틸 이미지 프레임 번호 (기본: 0)
  --jpeg-quality <1-100>  JPEG 품질 (기본: 80)
  --concurrency <number>  동시 처리 수 (기본: auto)
  --verbose               상세 로그 출력
  --help, -h              도움말 표시

예시:
  # input.json 파일로 비디오 렌더링
  npx ts-node render.ts video --props-file input.json --output out/video.mp4

  # JSON 문자열로 비디오 렌더링
  npx ts-node render.ts video --props '{"title":"테스트","media":[...]}' --verbose

  # 스틸 이미지 렌더링 (30번째 프레임)
  npx ts-node render.ts still --props-file input.json --frame 30 --output out/still.png

  # 고품질 H265 렌더링
  npx ts-node render.ts video --props-file input.json --codec h265 --jpeg-quality 95
`);
}

function loadProps(args: CLIArgs): VideoProps {
  let propsData: any;
  
  if (args.propsFile) {
    // 파일에서 props 로드
    const filePath = path.resolve(args.propsFile);
    
    if (!existsSync(filePath)) {
      console.error(`❌ Props 파일을 찾을 수 없습니다: ${filePath}`);
      process.exit(1);
    }
    
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      propsData = JSON.parse(fileContent);
      console.log(`📄 Props 파일 로드: ${filePath}`);
    } catch (error) {
      console.error(`❌ Props 파일 파싱 실패: ${error}`);
      process.exit(1);
    }
  } else if (args.props) {
    // 문자열에서 props 파싱
    try {
      propsData = JSON.parse(args.props);
      console.log('📋 Props 문자열 파싱 완료');
    } catch (error) {
      console.error(`❌ Props 문자열 파싱 실패: ${error}`);
      process.exit(1);
    }
  } else {
    console.error('❌ Props를 제공해야 합니다. --props-file 또는 --props 옵션을 사용하세요.');
    console.log('💡 도움말: npx ts-node render.ts --help');
    process.exit(1);
  }
  
  // Zod 스키마로 검증
  try {
    return VideoPropsSchema.parse(propsData);
  } catch (error: any) {
    console.error('❌ Props 검증 실패:');
    if (error.errors) {
      error.errors.forEach((err: any) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs();
  
  if (args.help) {
    showHelp();
    return;
  }
  
  console.log('🎬 VideoWeb3 CLI 렌더링 시작!');
  console.log(`📋 명령어: ${args.command}`);
  
  // Props 로드 및 검증
  const props = loadProps(args);
  
  // 렌더링 옵션 설정
  const options: RenderOptions = {
    outputPath: args.outputPath,
    codec: args.codec,
    jpegQuality: args.jpegQuality,
    concurrency: args.concurrency,
    verbose: args.verbose || false,
  };
  
  try {
    let result;
    
    if (args.command === 'video') {
      // 비디오 렌더링
      if (!options.outputPath) {
        options.outputPath = `out/video_${Date.now()}.mp4`;
      }
      
      console.log(`🎥 비디오 렌더링 시작...`);
      result = await renderVideo(props, options);
      
    } else if (args.command === 'still') {
      // 스틸 이미지 렌더링
      if (!options.outputPath) {
        options.outputPath = `out/still_${Date.now()}.png`;
      }
      
      const frame = args.frame || 0;
      console.log(`📸 스틸 이미지 렌더링 시작 (프레임: ${frame})...`);
      result = await renderStill(props, frame, options);
    }
    
    // 결과 출력
    if (result?.success) {
      console.log('');
      console.log('🎉 렌더링 완료!');
      console.log(`📁 출력 파일: ${result.outputPath}`);
      console.log(`⏱️ 소요 시간: ${result.duration}ms`);
      
      if (result.assetsInfo) {
        console.log('📊 에셋 정보:', result.assetsInfo);
      }
    } else {
      console.log('');
      console.error('❌ 렌더링 실패!');
      console.error(`🚨 오류: ${result?.error}`);
      console.log(`⏱️ 소요 시간: ${result?.duration}ms`);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.log('');
    console.error('💥 CLI 렌더링 중 예외 발생:', error.message);
    process.exit(1);
  }
}

// CLI 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 CLI 실행 중 예외 발생:', error);
    process.exit(1);
  });
}

export { main as renderCLI }; 