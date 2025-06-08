import { Composition } from 'remotion';
import { VideoSequence } from './VideoSequence';
import { inputData } from './inputData';
import { useDataLoader } from './DataLoader';

// Calculate total duration based on audio lengths
const fps = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YouTubeShorts"
        component={VideoSequence}
        durationInFrames={1} // This will be dynamically calculated
        fps={fps}
        width={1080}
        height={1920}
        defaultProps={{
          title: inputData[0].title,
          media: inputData[0].media,
        }}
        calculateMetadata={async ({ props }) => {
          // Use the same loading logic as DataLoader
          const audioPromises = props.media.map((item: any) => {
            return new Promise<number>((resolve) => {
              const audio = new Audio();
              
              const handleLoadedMetadata = () => {
                resolve(audio.duration);
              };

              const handleError = () => {
                console.error('Error loading audio:', item.voice);
                resolve(3); // fallback to 3 seconds
              };

              audio.addEventListener('loadedmetadata', handleLoadedMetadata);
              audio.addEventListener('error', handleError);
              
              audio.src = item.voice;
              audio.load();
            });
          });

          const durations = await Promise.all(audioPromises);
          const totalDurationSeconds = durations.reduce((sum, duration) => sum + duration, 0);
          const totalDurationFrames = Math.ceil(totalDurationSeconds * fps);
          
          return {
            durationInFrames: totalDurationFrames,
            props: {
              ...props,
              audioDurations: durations,
            },
          };
        }}
      />
    </>
  );
}; 