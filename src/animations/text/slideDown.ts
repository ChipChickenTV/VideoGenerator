import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin } from '../types';

export const slideDown: AnimationPlugin = ({ duration = 30, delay = 0 }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [delay, delay + duration],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  const translateY = interpolate(
    frame,
    [delay, delay + duration],
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