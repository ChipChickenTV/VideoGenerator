import { interpolate } from 'remotion';
import { TypedAnimationFunction, AnimationPluginOptions } from '../types';

export const slideLeft: TypedAnimationFunction = Object.assign(
  ({ duration, delay = 0, frame }: AnimationPluginOptions = {}) => {
    const animationDuration = duration || slideLeft.metadata.defaultDuration;
    const translateX = interpolate(
      frame || 0,
      [delay, delay + animationDuration],
      [100, 0], // Enter from right, settle at center
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return {
      style: {
        transform: `translateX(${translateX}%)`,
      },
    };
  },
  {
    metadata: {
      description: "왼쪽 슬라이드 전환 효과",
      defaultDuration: 15,
      params: {
        duration: {
          type: 'number',
          default: 15,
          required: false,
          description: '슬라이드 애니메이션 지속 시간 (프레임)'
        },
        delay: {
          type: 'number',
          default: 0,
          required: false,
          description: '애니메이션 시작 지연 시간 (프레임)'
        },
        frame: {
          type: 'number',
          default: 0,
          required: false,
          description: '현재 프레임'
        }
      }
    }
  }
);