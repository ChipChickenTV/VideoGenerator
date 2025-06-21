import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { MediaItem } from './inputData';

const fps = 30;
const defaultDurationInSeconds = 3;

export const createCalculateMetadata = () => {
  return async ({ props }: { props: any }) => {
    // props.media가 없으면 기본값으로 처리
    if (!props || !props.media || !Array.isArray(props.media) || props.media.length === 0) {
      return {
        durationInFrames: defaultDurationInSeconds * fps,
        props: {
          ...props,
          audioDurations: [defaultDurationInSeconds],
        },
      };
    }

    const durations = await Promise.all(
      props.media.map(async (item: MediaItem) => {
        if (item.voice) {
          try {
            // Calculate duration from audio file
            return await getAudioDurationInSeconds(item.voice);
          } catch (e) {
            console.error('Could not get audio duration for', item.voice, e);
            return defaultDurationInSeconds;
          }
        }
        // Use default duration if no voice is provided
        return defaultDurationInSeconds;
      })
    );

    const totalDurationSeconds = durations.reduce(
      (sum: number, duration: number) => sum + duration,
      0
    );
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