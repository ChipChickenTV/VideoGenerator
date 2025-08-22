import { renderMedia, renderStill as remotionRenderStill } from '@remotion/renderer';
import type { VideoConfig } from 'remotion/no-react';
import { VideoProps } from '@/types/VideoProps';
import { RenderOptions, RenderResult } from './types';
import { validateAndEnrichProps, validateRenderRequirements } from './validation';
import { prepareBundleAndComposition } from './bundler';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * 비디오 렌더링 핵심 실행 함수
 */
async function executeVideoRender(
  bundleLocation: string,
  composition: VideoConfig,
  enrichedProps: VideoProps,
  options: RenderOptions
): Promise<void> {
  const { outputPath, codec = 'h264', concurrency = null, overwrite = true } = options;
  
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    inputProps: enrichedProps,
    codec,
    outputLocation: outputPath!,
    concurrency,
    overwrite,
  });
}

/**
 * 스틸 이미지 렌더링 핵심 실행 함수
 */
async function executeStillRender(
  bundleLocation: string,
  composition: VideoConfig,
  enrichedProps: VideoProps,
  options: RenderOptions & { frame?: number }
): Promise<void> {
  const { outputPath, frame = 0, jpegQuality = 80, overwrite = true } = options;
  
  await remotionRenderStill({
    composition,
    serveUrl: bundleLocation,
    inputProps: enrichedProps,
    output: outputPath!,
    frame,
    jpegQuality,
    overwrite,
  });
}

/**
 * 공통 렌더링 실행 래퍼
 */
async function executeRender(
  renderType: 'video' | 'still',
  props: VideoProps,
  options: RenderOptions & { frame?: number }
): Promise<RenderResult> {
  const startTime = Date.now();
  const { outputPath, verbose = false } = options;
  
  if (!outputPath) {
    throw new Error('Output path is required.');
  }

  try {
    if (verbose) console.log(`🎬 VideoWeb3 ${renderType} 렌더링 시작...`);

    // 1. 데이터 검증 및 보강
    const enrichedProps = await validateAndEnrichProps(props, verbose);
    validateRenderRequirements(enrichedProps);

    // 2. 출력 디렉토리 생성
    const outputDir = path.dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // 3. 번들링 및 컴포지션 준비
    const { bundleLocation, composition } = await prepareBundleAndComposition(enrichedProps, verbose);

    // 4. 렌더링 실행
    if (renderType === 'video') {
      await executeVideoRender(bundleLocation, composition, enrichedProps, options);
    } else {
      await executeStillRender(bundleLocation, composition, enrichedProps, options);
    }

    const duration = (Date.now() - startTime) / 1000;
    if (verbose) console.log(`✅ ${renderType} 렌더링 완료! (${duration.toFixed(2)}초)`);

    return { success: true, outputPath, duration };
  } catch (error: any) {
    if (verbose) console.error(`❌ 렌더링 실패: ${error.message}`);
    return { success: false, outputPath, error: error.message };
  }
}

/**
 * 비디오 렌더링 메인 함수
 */
export async function renderVideo(props: VideoProps, options: RenderOptions): Promise<RenderResult> {
  return executeRender('video', props, options);
}

/**
 * 스틸 이미지 렌더링 메인 함수
 */
export async function renderStill(
  props: VideoProps, 
  options: RenderOptions & { frame?: number }
): Promise<RenderResult> {
  return executeRender('still', props, options);
}