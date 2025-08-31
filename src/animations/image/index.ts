import { SceneLengthAnimation } from '../types';
import { zoomIn } from './zoomIn';
import { panRight } from './panRight';
import { zoomOut } from './zoomOut';

const noneAnimation: SceneLengthAnimation = Object.assign(
  () => ({ style: {} }),
  {
    metadata: {
      description: "애니메이션 없음",
      params: {}
    }
  }
);

export const imageAnimations: Record<string, SceneLengthAnimation> = {
  'none': noneAnimation,
  'zoom-in': zoomIn,
  'pan-right': panRight,
  'zoom-out': zoomOut,
};

// 다이나믹 임포트를 위한 헬퍼 함수
export const getImageAnimation = (effect: string): SceneLengthAnimation => {
  return imageAnimations[effect];
};