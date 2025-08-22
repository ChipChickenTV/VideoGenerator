import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPluginOptions, TypedAnimationFunction } from '../types';

export const slideDown: TypedAnimationFunction = Object.assign(
  ({ duration, delay = 0, frame }: AnimationPluginOptions = {}) => {
    const currentFrame = frame !== undefined ? frame : useCurrentFrame();
    const animationDuration = duration || slideDown.metadata.defaultDuration;
    
    const opacity = interpolate(
      currentFrame,
      [delay, delay + animationDuration],
      [1, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
    
    const translateY = interpolate(
      currentFrame,
      [delay, delay + animationDuration],
      [0, 30],
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
      description: "Text slides down while fading out",
      defaultDuration: 30,
      params: {
        duration: {
          type: 'number',
          default: 30,
          required: false,
          description: '슬라이드다운 애니메이션 지속 시간 (프레임)'
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