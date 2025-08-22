import { imageAnimations } from './image';
import { textAnimations, highlightStyles } from './text';
import { transitionAnimations } from './transitions';
import { imageFilters } from './image/filters';
import { AnimationInfo, TypedAnimationFunction } from './types';

// 타입 안전한 애니메이션 메타데이터 접근 함수
const getAnimationMetadata = (animation: unknown): { description: string } | null => {
  if (animation && typeof animation === 'object' && 'metadata' in animation) {
    const typedAnimation = animation as TypedAnimationFunction;
    return typedAnimation.metadata || null;
  }
  return null;
};

// 모든 애니메이션을 동적으로 수집
export const getAllAnimations = (): AnimationInfo[] => {
  const animations: AnimationInfo[] = [];

  // 이미지 애니메이션
  Object.keys(imageAnimations).forEach(name => {
    const animation = imageAnimations[name];
    const metadata = getAnimationMetadata(animation);
    animations.push({
      type: 'image',
      name,
      description: metadata?.description || `Image ${name} animation`,
    });
  });

  // 텍스트 애니메이션
  Object.keys(textAnimations).forEach(name => {
    const animation = textAnimations[name];
    const metadata = getAnimationMetadata(animation);
    animations.push({
      type: 'text',
      name,
      description: metadata?.description || `Text ${name} animation`,
    });
  });

  // 전환 효과
  Object.keys(transitionAnimations).forEach(name => {
    const animation = transitionAnimations[name];
    const metadata = getAnimationMetadata(animation);
    animations.push({
      type: 'transition',
      name,
      description: metadata?.description || `Transition ${name} effect`,
    });
  });

  // 필터 효과
  Object.keys(imageFilters).forEach(name => {
    animations.push({
      type: 'filter',
      name,
      description: `Filter ${name} effect`,
    });
  });

  // 하이라이트 효과
  Object.keys(highlightStyles).forEach(name => {
    animations.push({
      type: 'highlight',
      name,
      description: `Highlight ${name} style`,
    });
  });

  return animations;
};

// 각 애니메이션 타입별 수집 함수들
export { imageAnimations, textAnimations, transitionAnimations as transitions };

// 각 애니메이션 타입별 개별 가져오기 함수들
export { getTextAnimation } from './text';
export { getImageAnimation } from './image';  
export { getTransitionAnimation } from './transitions';