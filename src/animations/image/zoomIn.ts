import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin, AnimationWithDescription } from '../types';

export const zoomIn: AnimationPlugin = ({ duration } = {}) => {
  const frame = useCurrentFrame();
  const animationDuration = duration || (zoomIn as any).defaultDuration;
  
  const scale = interpolate(
    frame,
    [0, animationDuration],
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

(zoomIn as AnimationWithDescription).description = "Image gradually zooms in";
(zoomIn as any).defaultDuration = 90; 