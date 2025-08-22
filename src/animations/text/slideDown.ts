import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin, AnimationWithDescription } from '../types';

export const slideDown: AnimationPlugin = ({ duration, delay = 0, frame } = {}) => {
  const currentFrame = frame !== undefined ? frame : useCurrentFrame();
  const animationDuration = duration || (slideDown as any).defaultDuration;
  
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
};

(slideDown as AnimationWithDescription).description = "Text slides down while fading out";
(slideDown as any).defaultDuration = 30;