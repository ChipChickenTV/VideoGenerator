import { bundle } from '@remotion/bundler';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { selectComposition } from '@remotion/renderer';
import { VideoProps } from '@/types/VideoProps';
import path from 'path';

/**
 * Remotion 프로젝트 번들링 및 컴포지션 준비
 */
export async function prepareBundleAndComposition(props: VideoProps, verbose: boolean) {
  if (verbose) console.log('📦 Remotion 프로젝트 번들링...');
  
  const bundleLocation = await bundle({
    entryPoint: path.resolve('./src/index.ts'),
    webpackOverride: (config) => {
      config.resolve = {
        ...config.resolve,
        plugins: [
          ...(config.resolve?.plugins ?? []),
          new TsconfigPathsPlugin()
        ]
      };
      return config;
    },
  });

  if (verbose) console.log('📋 사용 가능한 컴포지션 조회...');

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'ThumbStory',
    inputProps: props,
  });

  if (verbose) {
    console.log(`🎬 선택된 컴포지션: ${composition.id}`);
    console.log(`📐 해상도: ${composition.width}x${composition.height}`);
    console.log(`🎞️ 프레임 수: ${composition.durationInFrames} (${composition.fps}fps)`);
  }

  return { bundleLocation, composition };
}