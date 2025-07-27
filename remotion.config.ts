/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';
import path from 'path';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((currentConfiguration) => {
  // Tailwind 설정 적용
  const withTailwind = enableTailwind(currentConfiguration);
  
  // TypeScript 경로 매핑 추가
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...withTailwind.resolve?.alias,
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
  };
});
