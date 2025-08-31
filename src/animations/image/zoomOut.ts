import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPluginOptions, SceneLengthAnimation } from '../types';

export const zoomOut: SceneLengthAnimation = Object.assign(
  ({ duration = 90 }: AnimationPluginOptions = {}) => {
    const frame = useCurrentFrame();
    const scale = interpolate(
      frame,
      [0, duration],
      [1.15, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
    return {
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      },
    };
  },
  {
    metadata: {
      description: "이미지를 점진적으로 축소",
      params: {}
    }
  }
);