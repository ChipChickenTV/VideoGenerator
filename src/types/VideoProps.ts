import { z } from 'zod';

export const SceneSchema = z.object({
    id: z.string().optional(),
    image: z.object({
      url: z.string().min(1, "Image URL or path is required"),
      animation: z.object({
        effect: z.enum(['none', 'zoom-in', 'pan-right', 'zoom-out']).default('none'),
        filter: z.enum(['none', 'grayscale', 'sepia', 'blur']).default('none'),
      }),
    }).optional(),
    script: z.object({
      text: z.string().optional(),
      url: z.string().url().optional(),
      animation: z.object({
        in: z.enum(['none', 'fadeIn', 'typing', 'slideUp', 'word-by-word-fade']).default('none'),
        out: z.enum(['none', 'fadeOut', 'slideDown']).default('none'),
        highlight: z.enum([
          'none',
          'yellow-box',
          'red-box',
          'blue-box',
          'green-box',
          'underline',
          'bold',
          'italic',
          'glow',
          'strike',
          'outline'
        ]).default('yellow-box'),
      }),
    }).refine(data => data.text || data.url, {
      message: "script object must have either 'text' or 'url'",
    }),
    voice: z.string().min(1).optional(),
    audioDuration: z.number().optional(), // 음성 파일 길이 (초 단위)
    transition: z.object({
      effect: z.enum(['none', 'slide-left', 'slide-right', 'fade', 'wipe-up']).default('none'),
    }).optional(),
  });

// 테마 프리셋 열거형
export const ThemePresetSchema = z.enum([
  'original',
  'dark',
  'minimal', 
  'retro',
  'neon',
  'nature',
  'newspaper',
  'comics',
  'tech',
  'romantic',
  'simple-black',
  'custom'
]).default('original');

// 그라디언트 스키마
export const GradientSchema = z.object({
  type: z.enum(['linear', 'radial']).default('linear'),
  direction: z.string().default('135deg'), // linear의 경우
  position: z.string().default('center'), // radial의 경우
  colors: z.array(z.object({
    color: z.string(),
    stop: z.string(), // '0%', '50%', '100%' 등
  })).default([
    { color: '#ffffff', stop: '0%' },
    { color: '#f0f0f0', stop: '100%' }
  ]),
});

// 텍스트 효과 스키마
export const TextEffectSchema = z.object({
  shadow: z.object({
    enabled: z.boolean().default(false),
    x: z.number().default(2),
    y: z.number().default(2),
    blur: z.number().default(4),
    color: z.string().default('rgba(0,0,0,0.3)'),
  }).optional(),
  glow: z.object({
    enabled: z.boolean().default(false),
    color: z.string().default('#ff00ff'),
    size: z.number().default(8),
  }).optional(),
  outline: z.object({
    enabled: z.boolean().default(false),
    width: z.number().default(1),
    color: z.string().default('#000000'),
  }).optional(),
});

// 애니메이션 효과 스키마
export const AnimationEffectSchema = z.object({
  bounce: z.object({
    enabled: z.boolean().default(false),
    duration: z.string().default('2s'),
    timing: z.string().default('infinite'),
  }).optional(),
  flicker: z.object({
    enabled: z.boolean().default(false),
    duration: z.string().default('3s'),
    timing: z.string().default('infinite alternate'),
  }).optional(),
  pulse: z.object({
    enabled: z.boolean().default(false),
    duration: z.string().default('1.5s'),
    timing: z.string().default('infinite'),
  }).optional(),
});

// 데코레이션 스키마 (이모지, 아이콘 등)
export const DecorationSchema = z.object({
  before: z.string().optional(), // 앞에 오는 장식 (이모지, 텍스트 등)
  after: z.string().optional(),  // 뒤에 오는 장식
  position: z.enum(['header', 'title', 'text']).default('header'),
});

// 확장된 TemplateStyleSchema
export const TemplateStyleSchema = z.object({
  // 기본 설정
  themePreset: ThemePresetSchema,
  
  // 폰트 관련
  fontFamily: z.string().default('Pretendard, sans-serif'),
  fontSize: z.object({
    title: z.string().default('16px'),
    text: z.string().default('16px'),
    meta: z.string().default('12px'),
  }).optional(),
  fontWeight: z.object({
    title: z.number().default(700),
    text: z.number().default(600),
    meta: z.number().default(400),
  }).optional(),
  fontStyle: z.object({
    title: z.enum(['normal', 'italic']).default('normal'),
    text: z.enum(['normal', 'italic']).default('normal'),
  }).optional(),
  letterSpacing: z.string().default('normal'),
  lineHeight: z.string().default('1.4'),
  
  // 색상
  textColor: z.string().default('#1a1a1a'),
  titleColor: z.string().optional(),
  metaColor: z.string().optional(),
  backgroundColor: z.string().default('#ffffff'),
  headerColor: z.string().default('#a5d8f3'),
  
  // 배경 그라디언트
  backgroundGradient: GradientSchema.optional(),
  headerGradient: GradientSchema.optional(),
  
  // 레이아웃
  layout: z.enum(['text-middle', 'text-top', 'text-bottom']).default('text-middle'),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  textIndent: z.string().default('0'),
  
  // 텍스트 효과
  textEffect: TextEffectSchema.optional(),
  titleEffect: TextEffectSchema.optional(),
  
  // 테두리 및 스타일
  border: z.object({
    enabled: z.boolean().default(false),
    width: z.string().default('2px'),
    style: z.enum(['solid', 'dashed', 'dotted', 'double']).default('solid'),
    color: z.string().default('#000000'),
    radius: z.string().default('0px'),
  }).optional(),
  
  // 박스 시아도우
  boxShadow: z.object({
    enabled: z.boolean().default(false),
    x: z.number().default(0),
    y: z.number().default(20),
    blur: z.number().default(60),
    spread: z.number().default(0),
    color: z.string().default('rgba(0,0,0,0.3)'),
    inset: z.boolean().default(false),
  }).optional(),
  
  // 하이라이트 스타일
  highlight: z.object({
    backgroundColor: z.string().default('#ffd700'),
    textColor: z.string().default('#000000'),
    padding: z.string().default('0.1em 0.3em'),
    borderRadius: z.string().default('4px'),
    border: z.string().optional(),
    boxShadow: z.string().optional(),
  }).optional(),
  
  // 애니메이션 효과
  animations: AnimationEffectSchema.optional(),
  
  // 데코레이션 (이모지, 아이콘 등)
  decorations: z.array(DecorationSchema).optional(),
  
  // 헤더 스타일
  headerStyle: z.object({
    textAlign: z.enum(['left', 'center', 'right']).default('left'),
    borderBottom: z.object({
      enabled: z.boolean().default(true),
      width: z.string().default('1px'),
      style: z.enum(['solid', 'dashed', 'dotted', 'double']).default('solid'),
      color: z.string().default('#e8e8e8'),
    }).optional(),
  }).optional(),
  
  // 포스트 헤더 스타일
  postHeaderStyle: z.object({
    borderBottom: z.object({
      enabled: z.boolean().default(true),
      width: z.string().default('2px'),
      style: z.enum(['solid', 'dashed', 'dotted', 'double']).default('solid'),
      color: z.string().default('#e8e8e8'),
    }).optional(),
  }).optional(),
  
  // 텍스트 영역 스타일
  textAreaStyle: z.object({
    backgroundColor: z.string().optional(),
    padding: z.string().default('15px 10px'),
    borderRadius: z.string().default('0px'),
    border: z.string().optional(),
  }).optional(),
});

export const VideoPropsSchema = z.object({
  templateStyle: TemplateStyleSchema.optional(),
  title: z.string().optional(),
  postMeta: z.object({
    author: z.string().default('익명'),
    time: z.string().default('14:25'),
    viewCount: z.string().default('3,463,126'),
  }).optional(),
  media: z.array(SceneSchema),
});

export type VideoProps = z.infer<typeof VideoPropsSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type TemplateStyle = z.infer<typeof TemplateStyleSchema>;
export type ThemePreset = z.infer<typeof ThemePresetSchema>;
export type Gradient = z.infer<typeof GradientSchema>;
export type TextEffect = z.infer<typeof TextEffectSchema>;
export type AnimationEffect = z.infer<typeof AnimationEffectSchema>;
export type Decoration = z.infer<typeof DecorationSchema>;