import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin } from '../types';

export const zoomIn: AnimationPlugin = ({ duration = 90 }) => {
  const frame = useCurrentFrame();
  
  const scale = interpolate(
    frame,
    [0, duration],
    [1, 1.15],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  return {
    style: {
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
    },
  };
}; 