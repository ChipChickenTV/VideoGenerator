export const THEME_CONSTANTS = {
  FONTS: {
    PRIMARY: "'Pretendard', sans-serif",
    FALLBACK: "sans-serif",
  },
  COLORS: {
    BACKGROUND: '#000000', // 검은색 배경
    PHONE_BACKGROUND: '#ffffff',
    HEADER_BACKGROUND: '#a5d8f3',
    TEXT_PRIMARY: '#1a1a1a',
    TEXT_SECONDARY: '#333',
    TEXT_META: '#888',
    PROFILE_BACKGROUND: '#3498db',
    BORDER: '#e0e0e0',
    IMAGE_PLACEHOLDER: '#e0e0e0',
  },
  DIMENSIONS: {
    // 1080x1920 풀스크린 기준
    PHONE_WIDTH: 1080,
    PHONE_HEIGHT: 1920,
    PHONE_BORDER_RADIUS: 48, // 1080p에 맞게 둥근 모서리 복원
    HEADER_PADDING: 40,
    CONTENT_PADDING: 60,
    IMAGE_BORDER_RADIUS: 24,
    PROFILE_SIZE: 80,
  },
  TYPOGRAPHY: {
    // 1080p 해상도에 맞게 폰트 크기 확대
    HEADER_TITLE_SIZE: 48,
    POST_TITLE_SIZE: 42,
    SCRIPT_TEXT_SIZE: 38,
    META_TEXT_SIZE: 28,
    LINE_HEIGHT: 1.4,
    LETTER_SPACING: '-0.01em',
  },
} as const;

export const ANIMATION_CONSTANTS = {
  DURATIONS: {
    DEFAULT_TRANSITION: 30,
    FAST_TRANSITION: 15,
    SLOW_TRANSITION: 60,
    TYPING_SPEED: 3, // frames per character
  },
  EASING: {
    EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASE_IN: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    EASE_IN_OUT: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
} as const; 