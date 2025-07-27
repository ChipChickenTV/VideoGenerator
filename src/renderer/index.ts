import { renderMedia, selectComposition, renderStill as remotionRenderStill } from '@remotion/renderer';
import { getCompositions } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { VideoProps, VideoPropsSchema } from '@/types/VideoProps';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { parseFile, parseBuffer } from 'music-metadata';
import fetch from 'node-fetch';

export interface RenderOptions {
  outputPath?: string;
  codec?: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores';
  jpegQuality?: number;
  concurrency?: number | null;
  overwrite?: boolean;
  verbose?: boolean;
}

export interface RenderResult {
  success: boolean;
  outputPath: string;
  error?: string;
  duration?: number;
  assetsInfo?: any;
}

// Helper function to automatically add audio duration to props
async function enrichPropsWithAudioDuration(props: VideoProps, verbose: boolean): Promise<VideoProps> {
    const enrichedMedia = await Promise.all(
        (props.media || []).map(async (scene) => {
            if (scene.voice && (scene.audioDuration === undefined || scene.audioDuration === null)) {
                try {
                    if (verbose) console.log(`🎤 Analyzing audio duration for: ${scene.voice}`);
                    let duration: number | undefined;

                    if (scene.voice.startsWith('http')) {
                        const response = await fetch(scene.voice);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${scene.voice}: ${response.statusText}`);
                        }
                        const buffer = await response.buffer();
                        const metadata = await parseBuffer(buffer);
                        duration = metadata.format.duration;
                    } else {
                        const filePath = path.join(process.cwd(), 'public', scene.voice);
                        if (existsSync(filePath)) {
                            const metadata = await parseFile(filePath);
                            duration = metadata.format.duration;
                        } else {
                            if (verbose) console.warn(`⚠️ Local audio file not found: ${filePath}.`);
                        }
                    }

                    if (duration) {
                        if (verbose) console.log(`🎵 Audio duration found: ${duration.toFixed(2)}s`);
                        return { ...scene, audioDuration: duration };
                    }
                } catch (error: any) {
                    if (verbose) console.error(`❌ Error analyzing audio duration for "${scene.voice}": ${error.message}`);
                }
            }
            return scene;
        })
    );
    return { ...props, media: enrichedMedia };
}

// Helper function to load script from URL
async function enrichPropsWithRemoteScript(props: VideoProps, verbose: boolean): Promise<VideoProps> {
    const enrichedMedia = await Promise.all(
        (props.media || []).map(async (scene) => {
            if (scene.script.url && !scene.script.text) {
                try {
                    if (verbose) console.log(`📜 Loading script from: ${scene.script.url}`);
                    const response = await fetch(scene.script.url);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${scene.script.url}: ${response.statusText}`);
                    }
                    const text = await response.text();
                    if (verbose) console.log(`✍️ Script loaded successfully.`);
                    return { ...scene, script: { ...scene.script, text } };
                } catch (error: any) {
                    if (verbose) console.error(`❌ Error loading script from "${scene.script.url}": ${error.message}`);
                }
            }
            return scene;
        })
    );
    return { ...props, media: enrichedMedia };
}


// Helper function for preparing render (bundling, selecting composition)
async function prepareRenderSetup(props: VideoProps, verbose: boolean) {
  if (verbose) console.log('📦 Remotion 프로젝트 번들링...');
  const bundleLocation = await bundle({
    entryPoint: path.resolve('./src/index.ts'),
    webpackOverride: (config) => {
      config.resolve = {
        ...config.resolve,
        plugins: [
          ...(config.resolve?.plugins || []),
          new TsconfigPathsPlugin(),
        ],
      };
      return config;
    },
  });

  if (verbose) console.log('🔍 컴포지션 정보 조회...');
  const comps = await getCompositions(bundleLocation, {
    inputProps: props,
  });
  
  const compositionInfo = comps.find(c => c.id === 'ThumbStory') || comps[0];
  if (!compositionInfo) {
    throw new Error('렌더링할 컴포지션을 찾을 수 없습니다.');
  }

  if (verbose) {
    console.log(`🎯 렌더링할 컴포지션: ${compositionInfo.id} (FPS: ${compositionInfo.fps})`);
    console.log(`📊 비디오 총 길이 계산 완료: ${compositionInfo.durationInFrames} 프레임`);
  }

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionInfo.id,
    inputProps: props,
  });

  return { bundleLocation, composition, enrichedProps: props };
}


// Helper function to normalize input data (e.g., map legacy animation names)
function normalizeInputData(props: VideoProps, verbose: boolean): VideoProps {
  const normalizedMedia = (props.media || []).map(scene => {
    const newScene = { ...scene };

    // Normalize image animation effects
    if (newScene.image?.animation?.effect) {
      const effectMap: { [key: string]: string } = { 'ken-burns': 'zoom-in' };
      const originalEffect = newScene.image.animation.effect;
      if (effectMap[originalEffect]) {
        if (verbose) console.log(`🔄 이미지 효과 변환: ${originalEffect} -> ${effectMap[originalEffect]}`);
        newScene.image.animation.effect = effectMap[originalEffect] as any;
      }
    }

    // Normalize script animation effects
    if (newScene.script?.animation?.in) {
      const effectMap: { [key: string]: string } = { 'pop-in': 'fadeIn' };
      const originalEffect = newScene.script.animation.in;
      if (effectMap[originalEffect]) {
        if (verbose) console.log(`🔄 텍스트 애니메이션 변환: ${originalEffect} -> ${effectMap[originalEffect]}`);
        newScene.script.animation.in = effectMap[originalEffect] as any;
      }
    }

    return newScene;
  });

  return { ...props, media: normalizedMedia };
}


// Common render execution wrapper
async function executeRender(
  renderType: 'video' | 'still',
  props: VideoProps,
  options: RenderOptions & { frame?: number },
  renderFn: (bundleLocation: string, composition: any, enrichedProps: VideoProps, outputPath: string) => Promise<void>
): Promise<RenderResult> {
  const startTime = Date.now();
  const { outputPath, verbose = false } = options;
  
  if (!outputPath) {
    throw new Error('Output path is required.');
  }

  try {
    if (verbose) console.log(`🎬 VideoWeb3 ${renderType} 렌더링 시작...`);

    // 1. Normalize input data to handle legacy values
    const normalizedProps = normalizeInputData(props, verbose);
    
    // 2. Enrich props with dynamic data
    let enrichedProps = await enrichPropsWithAudioDuration(normalizedProps, verbose);
    enrichedProps = await enrichPropsWithRemoteScript(enrichedProps, verbose);

    // 3. Validate the final props object
    const validatedProps = VideoPropsSchema.parse(enrichedProps);
    if (verbose) console.log('✅ Props 검증 완료');

    const outputDir = path.dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const { bundleLocation, composition } = await prepareRenderSetup(validatedProps, verbose);

    await renderFn(bundleLocation, composition, validatedProps, path.resolve(outputPath));

    const duration = Date.now() - startTime;
    if (verbose) console.log(`\n✅ ${renderType} 렌더링 완료! (${duration}ms)`);

    return {
      success: true,
      outputPath: path.resolve(outputPath),
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${renderType} 렌더링 실패:`, error.message);
    return {
      success: false,
      outputPath: path.resolve(outputPath),
      error: error.message,
      duration,
    };
  }
}

export async function renderVideo(
  props: VideoProps,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const {
    outputPath = 'out/video.mp4',
    codec = 'h264',
    jpegQuality = 80,
    concurrency = null,
    overwrite = true,
    verbose = false,
  } = options;

  return executeRender('video', props, { ...options, outputPath }, async (bundleLocation, composition, validatedProps, finalOutputPath) => {
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec,
      outputLocation: finalOutputPath,
      inputProps: validatedProps,
      overwrite,
      concurrency,
      imageFormat: 'jpeg',
      jpegQuality,
      onProgress: ({ progress }) => {
        if (verbose) {
          const percentage = Math.round(progress * 100);
          process.stdout.write(`📈 렌더링 진행률: ${percentage}%\r`);
        }
      },
    });
  });
}

export async function renderStill(
  props: VideoProps,
  frame: number = 0,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const {
    outputPath = `out/still-${frame}.png`,
    jpegQuality = 90,
  } = options;

  return executeRender('still', props, { ...options, outputPath, frame }, async (bundleLocation, composition, validatedProps, finalOutputPath) => {
    await remotionRenderStill({
      composition,
      serveUrl: bundleLocation,
      output: finalOutputPath,
      inputProps: validatedProps,
      frame,
      imageFormat: finalOutputPath.endsWith('.png') ? 'png' : 'jpeg',
      jpegQuality,
    });
  });
}