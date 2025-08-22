import { interpolate } from 'remotion';
import { TypedAnimationFunction, AnimationPluginOptions } from '../types';

export const wipeUp: TypedAnimationFunction = Object.assign(
  ({ duration, delay = 0, frame }: AnimationPluginOptions = {}) => {
    const animationDuration = duration || wipeUp.metadata.defaultDuration;
    const inset = interpolate(
      frame || 0,
      [delay, delay + animationDuration],
      [100, 0], // Wipe in from bottom
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return {
      style: {
        clipPath: `inset(${inset}% 0 0 0)`,
      },
    };
  },
  {
    metadata: {
      description: "위로 와이프 전환 효과",
      defaultDuration: 15,
      params: {
        duration: {
          type: 'number',
          default: 15,
          required: false,
          description: '와이프 애니메이션 지속 시간 (프레임)'
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