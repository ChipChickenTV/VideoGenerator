// Animation effect arrays for testing
export const imageAnimationEffects = ['static', 'zoom-in', 'zoom-out', 'pan-right', 'pan-left', 'pan-down', 'pan-up', 'ken-burns', 'subtle-wobble'] as const;
export const imageAnimationFilters = ['grayscale', 'sepia', 'blur'] as const;
export const scriptAnimationInTypes = ['fadeIn', 'slideUp', 'reveal', 'typing', 'word-by-word-fade', 'pop-in'] as const;
export const scriptAnimationOutTypes = ['fadeOut', 'slideDown', 'blur-out'] as const;
export const scriptAnimationHighlightTypes = ['none', 'yellow-box', 'underline', 'color-change', 'bounce', 'glow'] as const;
export const transitionEffects = ['slide-left', 'wipe-up', 'circle-open'] as const;

// Type definitions based on const arrays
export type ImageAnimationEffect = typeof imageAnimationEffects[number];
export type ImageAnimationFilter = typeof imageAnimationFilters[number];
export type ScriptAnimationInType = typeof scriptAnimationInTypes[number];
export type ScriptAnimationOutType = typeof scriptAnimationOutTypes[number];
export type ScriptAnimationHighlightType = typeof scriptAnimationHighlightTypes[number];
export type TransitionEffect = typeof transitionEffects[number];

// Defines the animation properties for an image
export interface ImageAnimation {
  effect?: ImageAnimationEffect;
  filter?: ImageAnimationFilter;
}

// Defines the animation properties for a script/text
export interface ScriptAnimation {
  in?: ScriptAnimationInType;
  out?: ScriptAnimationOutType;
  highlight?: ScriptAnimationHighlightType;
}

// Represents an image with its URL and animation settings
export interface ThemedImage {
  url: string;
  animation?: ImageAnimation;
}

// Represents a script with its URL and animation settings
export interface ThemedScript {
  url: string;
  animation?: ScriptAnimation;
}

// Represents a single slide in the video
export interface MediaItem {
  image: ThemedImage;
  script: ThemedScript;
  voice: string;
  transition?: {
    effect: TransitionEffect;
    duration: number;
  };
}

// Defines the overall theme for the video
export interface Theme {
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  layout?: 'text-top' | 'text-middle' | 'text-bottom';
}

// Represents the entire structure of the input.json file
export interface VideoData {
  theme: Theme;
  title: string;
  media: MediaItem[];
}

// Conditionally import the JSON file based on the environment.
let inputData: VideoData;

// When rendering the video with `remotion render`, the environment is 'production'.
// In that case, we don't want to bundle the local `input.json` file,
// because the data will be passed via the `--propsFile` flag.
// We create a mock object that satisfies the `VideoData` type to avoid errors.
if (process.env.NODE_ENV === 'production') {
  inputData = {
    theme: {},
    title: 'Placeholder Title',
    media: [],
  };
} else {
  // In any other environment (like Remotion Studio), we load the local JSON for preview.
  // We use `require` for conditional loading, as `import` must be at the top level.
  inputData = require('../input.json');
}

// The input data is now a single VideoData object.
export { inputData };