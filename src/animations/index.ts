import { imageAnimations } from './image';
import { textAnimations, highlightStyles } from './text';
import { transitionAnimations } from './transitions';
import { imageFilters } from './image/filters';

export interface AnimationInfo {
  type: 'image' | 'text' | 'transition' | 'filter' | 'highlight';
  name: string;
  description: string;
  demoContent?: string;
}

// 모든 애니메이션을 동적으로 수집
export const getAllAnimations = (): AnimationInfo[] => {
  const animations: AnimationInfo[] = [];

  // 이미지 애니메이션
  Object.keys(imageAnimations).forEach(name => {
    animations.push({
      type: 'image',
      name,
      description: getAnimationDescription('image', name),
    });
  });

  // 텍스트 애니메이션
  Object.keys(textAnimations).forEach(name => {
    animations.push({
      type: 'text',
      name,
      description: getAnimationDescription('text', name),
    });
  });

  // 전환 효과
  Object.keys(transitionAnimations).forEach(name => {
    animations.push({
      type: 'transition',
      name,
      description: getAnimationDescription('transition', name),
    });
  });

  // 필터 효과
  Object.keys(imageFilters).forEach(name => {
    animations.push({
      type: 'filter',
      name,
      description: getAnimationDescription('filter', name),
    });
  });

  // 하이라이트 효과
  Object.keys(highlightStyles).forEach(name => {
    animations.push({
      type: 'highlight',
      name,
      description: getAnimationDescription('highlight', name),
    });
  });

  return animations;
};

// 애니메이션 설명 생성
const getAnimationDescription = (type: string, name: string): string => {
  const descriptions: Record<string, Record<string, string>> = {
    image: {
      'none': '정적 이미지 - 애니메이션 없음',
      'zoom-in': '이미지가 서서히 확대되는 효과',
      'zoom-out': '이미지가 서서히 축소되는 효과',
      'pan-right': '이미지가 오른쪽으로 팬하는 효과',
    },
    text: {
      'none': '애니메이션 없음',
      'fadeIn': '텍스트가 서서히 나타나는 효과',
      'fadeOut': '텍스트가 서서히 사라지는 효과',
      'typing': '텍스트가 타이핑되어 나타나는 효과',
      'word-by-word-fade': '단어 청크별 페이드 효과',
      'slideUp': '텍스트가 아래에서 위로 슬라이드하며 나타나는 효과',
      'slideDown': '텍스트가 위에서 아래로 슬라이드하며 사라지는 효과',
    },
    transition: {
      'none': '애니메이션 없는 즉시 전환',
      'fade': '페이드 인/아웃 전환 효과',
      'slide-left': '왼쪽으로 슬라이드 전환 효과',
      'slide-right': '오른쪽으로 슬라이드 전환 효과',
      'wipe-up': '위로 와이프하는 전환 효과',
    },
    filter: {
      'none': '필터 없음',
      'grayscale': '흑백 필터',
      'sepia': '세피아 필터',
      'blur': '블러 필터',
    },
    highlight: {
      'none': '하이라이트 없음',
      'yellow-box': '노란색 박스',
      'red-box': '빨간색 박스',
      'blue-box': '파란색 박스',
      'green-box': '초록색 박스',
      'underline': '밑줄',
      'bold': '굵게',
      'italic': '기울임',
      'glow': '발광 효과',
      'strike': '취소선',
      'outline': '외곽선',
    }
  };

  return descriptions[type]?.[name] || `${type} ${name} 애니메이션`;
};

// 각 애니메이션 타입별 수집 함수들
export { imageAnimations, textAnimations, transitionAnimations as transitions };