import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPluginOptions, TypedAnimationFunction } from '../types';

export const panRight: TypedAnimationFunction = Object.assign(
  ({ duration }: AnimationPluginOptions = {}) => {
    const frame = useCurrentFrame();
    const animationDuration = duration || panRight.metadata.defaultDuration;
    
    const translateX = interpolate(
      frame,
      [0, animationDuration],
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
      defaultDuration: 90,
      params: {
        duration: {
          type: 'number',
          default: 90,
          required: false,
          description: '팬 애니메이션 지속 시간 (프레임)'
        }
      }
    }
  }
); 