import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin } from '../types';

import { AnimationWithDescription } from '../types';

export const fadeIn: AnimationPlugin = ({ duration, delay = 0, frame } = {}) => {
  const currentFrame = frame !== undefined ? frame : useCurrentFrame();
  const animationDuration = duration || (fadeIn as any).defaultDuration;
  
  const opacity = interpolate(
    currentFrame,
    [delay, delay + animationDuration],
    [0, 1],
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

(fadeIn as AnimationWithDescription).description = "Text fades in gradually";
(fadeIn as any).defaultDuration = 30; 