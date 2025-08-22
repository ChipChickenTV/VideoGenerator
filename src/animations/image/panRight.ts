import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin, AnimationWithDescription } from '../types';

export const panRight: AnimationPlugin = ({ duration } = {}) => {
  const frame = useCurrentFrame();
  const animationDuration = duration || (panRight as any).defaultDuration;
  
  const translateX = interpolate(
    frame,
    [0, animationDuration],
    [0, -20],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  return {
    style: {
      transform: `translateX(${translateX}px) scale(1.1)`,
      transformOrigin: 'center center',
    },
  };
};

(panRight as AnimationWithDescription).description = "Image pans to the right";
(panRight as any).defaultDuration = 90; 