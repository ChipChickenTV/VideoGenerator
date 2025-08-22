import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin, AnimationWithDescription } from '../types';

export const slideUp: AnimationPlugin = ({ duration, delay = 0, frame } = {}) => {
  const currentFrame = frame !== undefined ? frame : useCurrentFrame();
  const animationDuration = duration || (slideUp as any).defaultDuration;
  
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
};

(slideUp as AnimationWithDescription).description = "Text slides up from bottom while fading in";
(slideUp as any).defaultDuration = 30;