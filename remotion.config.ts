import { Config } from '@remotion/cli/config';

// Optimized settings for smooth text rendering
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
Config.setOutputLocation('out/video.mp4');

// Improve text rendering quality
Config.setChromiumOpenGlRenderer('angle');
Config.setChromiumHeadlessMode(true);

// Optional: Enable more stable rendering
// Config.setFrameRange([0, 30]); // For testing first 1 second 