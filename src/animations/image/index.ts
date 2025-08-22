import { AnimationPlugin, AnimationMetadata } from '../types';
import { zoomIn } from './zoomIn';
import { panRight } from './panRight';
import { zoomOut } from './zoomOut';

export const imageAnimations: Record<string, AnimationPlugin> = {
  'none': () => ({ style: {} }),
  'zoom-in': zoomIn,
  'pan-right': panRight,
  'zoom-out': zoomOut,
};

// 다이나믹 임포트를 위한 헬퍼 함수
export const getImageAnimation = (effect: string): AnimationPlugin & { metadata?: AnimationMetadata } => {
  return imageAnimations[effect];
};