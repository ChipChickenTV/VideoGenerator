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
    TEXT_SECONDARY: '#333333',
    TEXT_META: '#888888',
    PROFILE_BACKGROUND: '#3498db',
    BORDER: '#e0e0e0',
    IMAGE_PLACEHOLDER: '#e0e0e0',
  },
  DIMENSIONS: {
    // template-examples.html 기준 3배 적용 (360x640 → 1080x1920)
    PHONE_WIDTH: 1080,
    PHONE_HEIGHT: 1920,
    PHONE_BORDER_RADIUS: 72, // 24px * 3
    HEADER_PADDING: 54, // 18px * 3
    CONTENT_PADDING: 60, // 20px * 3
    CONTENT_VERTICAL_PADDING: 45, // 15px * 3
    IMAGE_BORDER_RADIUS: 36, // 12px * 3
    PROFILE_SIZE: 96, // 32px * 3
    POST_HEADER_HEIGHT: 240, // 80px * 3
    TEXT_AREA_HEIGHT: 300, // 100px * 3
    IMAGE_SIZE: 960, // 320px * 3
  },
  TYPOGRAPHY: {
    // template-examples.html 기준 3배 적용
    HEADER_TITLE_SIZE: 54, // 18px * 3
    POST_TITLE_SIZE: 48, // 16px * 3
    SCRIPT_TEXT_SIZE: 48, // 16px * 3
    META_TEXT_SIZE: 36, // 12px * 3
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