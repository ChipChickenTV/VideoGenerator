import { MediaItem } from './inputData';
import { getAudioDurations } from './AudioDuration';

// Calculate total duration based on audio lengths - shared function
const fps = 30;

export const createCalculateMetadata = () => {
  return async ({ props }: { props: any }) => {
    const audioUrls = props.media.map((item: MediaItem) => item.voice);
    const durations = await getAudioDurations(audioUrls);
    const totalDurationSeconds = durations.reduce((sum: number, duration: number) => sum + duration, 0);
    const totalDurationFrames = Math.ceil(totalDurationSeconds * fps);
    
    return {
      durationInFrames: totalDurationFrames,
      props: {
        ...props,
        audioDurations: durations,
      },
    };
  };
};

export { fps }; 