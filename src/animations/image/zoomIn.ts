import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPluginOptions, SceneLengthAnimation } from '../types';

export const zoomIn: SceneLengthAnimation = Object.assign(
  ({ duration = 90 }: AnimationPluginOptions = {}) => {
    const frame = useCurrentFrame();
    
    const scale = interpolate(
      frame,
      [0, duration],
      [1, 1.15],
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
      description: "이미지를 점진적으로 확대",
      params: {}
    }
  }
); 