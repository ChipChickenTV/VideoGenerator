import { interpolate, useCurrentFrame } from 'remotion';
import { AnimationPlugin, AnimationWithDescription } from '../types';

export const zoomOut: AnimationPlugin = ({ duration } = {}) => {
  const frame = useCurrentFrame();
  const animationDuration = duration || (zoomOut as any).defaultDuration;
  const scale = interpolate(
    frame,
    [0, animationDuration],
    [1.15, 1],
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

(zoomOut as AnimationWithDescription).description = "Image gradually zooms out";
(zoomOut as any).defaultDuration = 90;