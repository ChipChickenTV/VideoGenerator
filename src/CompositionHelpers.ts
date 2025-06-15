import { MediaItem } from './inputData';
import { getAudioDurations } from './AudioDuration';

// Calculate total duration based on audio lengths - shared function
const fps = 30;

export const createCalculateMetadata = () => {
  return async ({ props }: { props: any }) => {
    // props.media가 없으면 기본값으로 처리
    if (!props || !props.media || !Array.isArray(props.media) || props.media.length === 0) {
      return {
        durationInFrames: 3 * fps, // 기본 3초
        props: {
          ...props,
          audioDurations: [3], // 기본 3초
        },
      };
    }

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