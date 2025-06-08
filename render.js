const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');

// Command line arguments
const args = process.argv.slice(2);
const outputName = args[0] || `youtube-shorts-${Date.now()}`;
const quality = args[1] || 'normal'; // normal, high, fast

// Quality presets
const qualityPresets = {
  fast: { crf: 25, concurrency: 4 },
  normal: { crf: 18, concurrency: 2 },
  high: { crf: 12, concurrency: 1 },
};

const start = async () => {
  console.log('🎬 Starting headless render...');
  console.log(`📁 Output: out/${outputName}.mp4`);
  console.log(`⚙️  Quality: ${quality}`);
  
  // Ensure output directory exists
  if (!fs.existsSync('out')) {
    fs.mkdirSync('out');
  }

  const bundleLocation = await bundle(path.resolve('./src/index.ts'), () => undefined, {
    webpackOverride: (config) => config,
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'YouTubeShorts',
  });

  const preset = qualityPresets[quality] || qualityPresets.normal;

  console.log('🎥 Rendering video...');
  const renderStart = Date.now();
  
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    crf: preset.crf,
    outputLocation: `out/${outputName}.mp4`,
    inputProps: {},
    concurrency: preset.concurrency,
    // Improved rendering options for smoother text
    chromiumOptions: {
      headless: true,
      gl: 'angle',
    },
    // Add motion blur and frame interpolation for smoother playback
    imageFormat: 'jpeg',
    jpegQuality: 90,
    // Disable hardware acceleration that might cause jitter
    enforceAudioTrack: false,
    onProgress: ({ renderedFrames, totalFrames }) => {
      const progress = ((renderedFrames / totalFrames) * 100).toFixed(1);
      process.stdout.write(`\r📊 Progress: ${progress}% (${renderedFrames}/${totalFrames} frames)`);
    },
  });
  
  const renderTime = ((Date.now() - renderStart) / 1000).toFixed(1);
  console.log(`\n✅ Render completed in ${renderTime}s!`);
  console.log(`📽️  Output: out/${outputName}.mp4`);
};

start().catch((err) => {
  console.error('❌ Render failed:', err);
  process.exit(1);
}); 