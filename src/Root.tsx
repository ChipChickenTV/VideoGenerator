import { Composition } from 'remotion';
import { VideoSequence } from './VideoSequence';
import { inputData } from './inputData';
import { generateTestData, getTestTheme, getTestTitle } from './TestDataGenerator';
import { videoSequenceSchema } from './VideoSequenceSchema';
import { createCalculateMetadata, fps } from './CompositionHelpers';

export const RemotionRoot: React.FC = () => {
  // Generate test data for animation testing
  const testData = generateTestData();
  const testTheme = getTestTheme();
  const testTitle = getTestTitle();

  // Create shared calculateMetadata function
  const calculateMetadata = createCalculateMetadata();

  return (
    <>
      <Composition
        id="YouTubeShorts"
        component={VideoSequence}
        durationInFrames={1} // This will be dynamically calculated
        fps={fps}
        width={1080}
        height={1920}
        schema={videoSequenceSchema}
        defaultProps={{
          title: inputData.title,
          media: inputData.media,
          theme: inputData.theme,
        }}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="AnimationTest"
        component={VideoSequence}
        durationInFrames={1} // This will be dynamically calculated
        fps={fps}
        width={1080}
        height={1920}
        schema={videoSequenceSchema}
        defaultProps={{
          title: testTitle,
          media: testData,
          theme: testTheme,
        }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};