import { TemplateStyle, ThemePreset } from '../../types/VideoProps';

// JSON 테마 파일들을 동적으로 import
import originalTheme from './original.json';
import darkTheme from './dark.json';
import minimalTheme from './minimal.json';
import retroTheme from './retro.json';
import neonTheme from './neon.json';
import natureTheme from './nature.json';
import newspaperTheme from './newspaper.json';
import comicsTheme from './comics.json';
import techTheme from './tech.json';
import romanticTheme from './romantic.json';
import simpleBlackTheme from './simple-black.json';

// 타입 단언을 통해 JSON을 TemplateStyle로 변환
const THEME_PRESETS: Record<ThemePreset, TemplateStyle> = {
  original: originalTheme as TemplateStyle,
  dark: darkTheme as TemplateStyle,
  minimal: minimalTheme as TemplateStyle,
  retro: retroTheme as TemplateStyle,
  neon: neonTheme as TemplateStyle,
  nature: natureTheme as TemplateStyle,
  newspaper: newspaperTheme as TemplateStyle,
  comics: comicsTheme as TemplateStyle,
  tech: techTheme as TemplateStyle,
  romantic: romanticTheme as TemplateStyle,
  'simple-black': simpleBlackTheme as TemplateStyle,
};

// 테마 정보 (이름, 설명, 이모지)
export const THEME_INFO: Record<ThemePreset, { name: string; description: string; emoji: string }> = {
  original: { 
    name: '오리지널', 
    description: '기본 VideoWeb3 스타일', 
    emoji: '📱' 
  },
  dark: { 
    name: '다크 모드', 
    description: '어두운 테마로 눈의 피로를 줄여줍니다', 
    emoji: '🌙' 
  },
  minimal: { 
    name: '미니멀', 
    description: '깔끔하고 단순한 디자인', 
    emoji: '✨' 
  },
  retro: { 
    name: '레트로', 
    description: '향수를 불러일으키는 복고풍 스타일', 
    emoji: '🎵' 
  },
  neon: { 
    name: '네온', 
    description: '사이버펑크 느낌의 네온 스타일', 
    emoji: '🌟' 
  },
  nature: { 
    name: '자연', 
    description: '자연친화적인 초록색 테마', 
    emoji: '🌿' 
  },
  newspaper: { 
    name: '신문', 
    description: '신문지 같은 클래식한 스타일', 
    emoji: '📰' 
  },
  comics: { 
    name: '코믹스', 
    description: '만화책 같은 역동적인 스타일', 
    emoji: '💥' 
  },
  tech: { 
    name: '기술', 
    description: '개발자를 위한 코드 스타일', 
    emoji: '💻' 
  },
  romantic: { 
    name: '로맨틱', 
    description: '사랑스러운 핑크색 테마', 
    emoji: '💕' 
  },
  'simple-black': { 
    name: '심플 블랙', 
    description: '미니멀한 검은색 테마', 
    emoji: '⚫' 
  },
};

export { THEME_PRESETS };
export default THEME_PRESETS; 