import { 
  MediaItem, 
  Theme,
  imageAnimationEffects, 
  imageAnimationFilters, 
  scriptAnimationInTypes, 
  scriptAnimationOutTypes, 
  scriptAnimationHighlightTypes, 
  transitionEffects 
} from './inputData';

// Test assets from the GitHub repository
const TEST_IMAGE_URL = 'https://github.com/bbtarzan12/TestAsset/raw/main/image.png';
const TEST_AUDIO_URL = 'https://github.com/bbtarzan12/TestAsset/raw/main/5-seconds-of-silence.mp3';

// Generate test data for all animation combinations
export const generateTestData = (): MediaItem[] => {
  const testData: MediaItem[] = [];
  
  // Generate slides for each image effect
  imageAnimationEffects.forEach((effect) => {
    testData.push({
      image: {
        url: TEST_IMAGE_URL,
        animation: { effect }
      },
      script: {
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`Image Effect: ${effect}`)}`,
        animation: { in: 'fadeIn' }
      },
      voice: TEST_AUDIO_URL
    });
  });

  // Generate slides for each image filter
  imageAnimationFilters.forEach((filter) => {
    testData.push({
      image: {
        url: TEST_IMAGE_URL,
        animation: { filter }
      },
      script: {
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`Image Filter: ${filter}`)}`,
        animation: { in: 'fadeIn' }
      },
      voice: TEST_AUDIO_URL
    });
  });

  // Generate slides for each script in animation
  scriptAnimationInTypes.forEach((inType) => {
    testData.push({
      image: {
        url: TEST_IMAGE_URL,
        animation: { effect: 'static' }
      },
      script: {
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`Script In Animation: ${inType}`)}`,
        animation: { in: inType }
      },
      voice: TEST_AUDIO_URL
    });
  });

  // Generate slides for each script out animation
  scriptAnimationOutTypes.forEach((outType) => {
    testData.push({
      image: {
        url: TEST_IMAGE_URL,
        animation: { effect: 'static' }
      },
      script: {
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`Script Out Animation: ${outType}`)}`,
        animation: { out: outType }
      },
      voice: TEST_AUDIO_URL
    });
  });

  // Generate slides for each script highlight animation
  scriptAnimationHighlightTypes.forEach((highlightType) => {
    testData.push({
      image: {
        url: TEST_IMAGE_URL,
        animation: { effect: 'static' }
      },
      script: {
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`Script Highlight: <h>${highlightType}</h>`)}`,
        animation: { highlight: highlightType }
      },
      voice: TEST_AUDIO_URL
    });
  });

  // Generate slides for each transition effect
  transitionEffects.forEach((transitionEffect, index) => {
    testData.push({
      image: {
        url: TEST_IMAGE_URL,
        animation: { effect: 'static' }
      },
      script: {
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`Transition Effect: ${transitionEffect}`)}`,
        animation: { in: 'fadeIn' }
      },
      voice: TEST_AUDIO_URL,
      transition: {
        effect: transitionEffect,
        duration: 30
      }
    });
  });

  return testData;
};

// Test theme configuration
export const getTestTheme = (): Theme => ({
  fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
  textColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  layout: 'text-bottom'
});

// Test title
export const getTestTitle = (): string => 'Animation Test Video'; 