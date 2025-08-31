import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPluginOptions, SceneLengthAnimation } from '../types';

export const panRight: SceneLengthAnimation = Object.assign(
  ({ duration = 90 }: AnimationPluginOptions = {}) => {
    const frame = useCurrentFrame();
    
    const translateX = interpolate(
      frame,
      [0, duration],
      [0, -20],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
    
    return {
      style: {
        transform: `translateX(${translateX}px) scale(1.1)`,
        transformOrigin: 'center center',
      },
    };
  },
  {
    metadata: {
      description: "이미지를 오른쪽으로 팬하며 확대",
      params: {}
    }
  }
); 