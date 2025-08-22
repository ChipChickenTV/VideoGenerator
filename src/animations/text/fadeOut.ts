import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin, AnimationWithDescription } from '../types';

export const fadeOut: AnimationPlugin = ({ duration, delay = 0, frame } = {}) => {
  const currentFrame = frame !== undefined ? frame : useCurrentFrame();
  const animationDuration = duration || (fadeOut as any).defaultDuration;
  
  const opacity = interpolate(
    currentFrame,
    [delay, delay + animationDuration],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  return {
    style: {
      opacity,
    },
  };
};

(fadeOut as AnimationWithDescription).description = "Text fades out gradually";
(fadeOut as any).defaultDuration = 30; 