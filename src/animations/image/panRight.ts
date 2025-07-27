import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin } from '../types';

export const panRight: AnimationPlugin = ({ duration = 90 }) => {
  const frame = useCurrentFrame();
  
  const translateX = interpolate(
    frame,
    [0, duration],
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