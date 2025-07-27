// 애니메이션별 동적 duration 계산 함수

type DurationsMap = Record<string, number>;

export const getAnimationDuration = (
  type: 'image' | 'text' | 'transition' | 'filter' | 'highlight',
  animationName: string,
  fps: number = 30
): number => {
  
  // 기본 duration 설정 (프레임 단위)
  const DEFAULT_DURATIONS: Record<string, DurationsMap> = {
    // 이미지 애니메이션 - 실제 구현 기반
    image: {
      'static': fps * 2, // 정적이므로 2초
      'zoom-in': 90,     // 구현된 기본값
      'zoom-out': 90,    // 구현된 기본값  
      'pan-right': 90,   // 구현된 기본값
    },
    
    // 텍스트 애니메이션 - 실제 구현 기반
    text: {
      'fadeIn': 30,      // 구현된 기본값
      'fadeOut': 30,     // 구현된 기본값
      'typing': 90,      // 구현된 기본값 (텍스트 길이에 따라 달라질 수 있음)
      'slideUp': 30,     // 구현된 기본값
      'slideDown': 30,   // 구현된 기본값
    },
    
    // 전환 효과 - 두 씬이 필요하므로 더 긴 duration
    transition: {
      'fade': 90,        // 첫 씬 + 전환 + 두번째 씬
      'slide-left': 90,
      'slide-right': 90,
      'wipe-up': 90,
    },
    
    // 필터 효과 - 정적이므로 충분한 시간
    filter: {
      'none': fps * 1.5,     // 1.5초
      'grayscale': fps * 1.5,
      'sepia': fps * 1.5, 
      'blur': fps * 1.5,
    },
    
    // 하이라이트 효과 - 정적이므로 충분한 시간
    highlight: {
      'none': fps * 1.5,       // 1.5초
      'yellow-box': fps * 1.5,
      'underline': fps * 1.5,
    },
  };

  // 해당 타입과 애니메이션 이름으로 duration 조회
  const typeDurations = DEFAULT_DURATIONS[type];
  if (typeDurations && typeDurations[animationName] !== undefined) {
    return typeDurations[animationName];
  }

  // 기본값 반환 (타입별)
  switch (type) {
    case 'image':
      return 90; // 대부분의 이미지 애니메이션은 90 프레임
    case 'text':
      return 60; // 텍스트는 중간값
    case 'transition':
      return 90; // 전환은 두 씬이 필요
    case 'filter':
    case 'highlight':
      return fps * 1.5; // 정적 효과는 1.5초
    default:
      return fps * 2; // 알 수 없는 경우 2초
  }
};

// 타이핑 애니메이션의 경우 텍스트 길이 기반 duration 계산
export const getTypingDuration = (text: string, fps: number = 30): number => {
  const TYPING_SPEED = 3; // 글자당 프레임 수
  const minDuration = 60; // 최소 2초
  const textBasedDuration = text.length * TYPING_SPEED;
  return Math.max(minDuration, textBasedDuration + 30); // 여유 30프레임 추가
};

// 전환 효과의 경우 더 정확한 duration 계산
export const getTransitionDuration = (
  transitionName: string, 
  transitionDuration: number = 30,
  fps: number = 30
): number => {
  // 첫 씬 시간 + 전환 시간 + 두번째 씬 시간
  const sceneTime = fps * 1; // 각 씬 1초
  return sceneTime + transitionDuration + sceneTime + 15; // 여유 15프레임
}; 