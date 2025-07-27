import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin } from '../types';

export const slideUp: AnimationPlugin = ({ duration = 30, delay = 0 }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [delay, delay + duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  const translateY = interpolate(
    frame,
    [delay, delay + duration],
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