import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPluginOptions, TypedAnimationFunction } from '../types';

export const slideUp: TypedAnimationFunction = Object.assign(
  ({ duration, delay = 0, frame }: AnimationPluginOptions = {}) => {
    const currentFrame = frame !== undefined ? frame : useCurrentFrame();
    const animationDuration = duration || slideUp.metadata.defaultDuration;
    
    const opacity = interpolate(
      currentFrame,
      [delay, delay + animationDuration],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
    
    const translateY = interpolate(
      currentFrame,
      [delay, delay + animationDuration],
      [30, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
    
    return {
      style: {
        opacity,
        transform: `translateY(${translateY}px)`,
      },
    };
  },
  {
    metadata: {
      description: "Text slides up from bottom while fading in",
      defaultDuration: 30,
      params: {
        duration: {
          type: 'number',
          default: 30,
          required: false,
          description: '슬라이드업 애니메이션 지속 시간 (프레임)'
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
          description: '현재 프레임 (자동 감지됨)'
        }
      }
    }
  }
);