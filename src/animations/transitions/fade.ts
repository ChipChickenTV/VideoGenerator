import { interpolate } from 'remotion';
import { TypedAnimationFunction, AnimationPluginOptions } from '../types';

export const fade: TypedAnimationFunction = Object.assign(
  ({ duration, delay = 0, frame }: AnimationPluginOptions = {}) => {
    const animationDuration = duration || fade.metadata.defaultDuration;
    const opacity = interpolate(
      frame || 0,
      [delay, delay + animationDuration],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    return {
      style: {
        opacity,
      },
    };
  },
  {
    metadata: {
      description: "페이드 인/아웃 전환 효과",
      defaultDuration: 15,
      params: {
        duration: {
          type: 'number',
          default: 15,
          required: false,
          description: '페이드 애니메이션 지속 시간 (프레임)'
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