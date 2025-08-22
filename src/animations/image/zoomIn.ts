import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPluginOptions, TypedAnimationFunction } from '../types';

export const zoomIn: TypedAnimationFunction = Object.assign(
  ({ duration }: AnimationPluginOptions = {}) => {
    const frame = useCurrentFrame();
    const animationDuration = duration || zoomIn.metadata.defaultDuration;
    
    const scale = interpolate(
      frame,
      [0, animationDuration],
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
      defaultDuration: 90,
      params: {
        duration: {
          type: 'number',
          default: 90,
          required: false,
          description: '줌인 애니메이션 지속 시간 (프레임)'
        }
      }
    }
  }
); 