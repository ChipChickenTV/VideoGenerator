import { z } from 'zod';

export const SceneSchema = z.object({
    image: z.object({
      url: z.string().min(1).describe('이미지 URL'),
      animation: z.object({
        effect: z.enum(['none', 'zoom-in', 'pan-right', 'zoom-out']).default('none').describe('이미지 애니메이션 효과'),
        filter: z.enum(['none', 'grayscale', 'sepia', 'blur']).default('none').describe('이미지 필터 효과'),
      }).describe('이미지 애니메이션 설정'),
    }).optional().describe('씬에 표시할 이미지 정보'),
    script: z.object({
      text: z.string().optional().describe('표시할 텍스트'),
      url: z.string().url().optional().describe('텍스트를 가져올 URL'),
      animation: z.object({
        in: z.enum(['none', 'fadeIn', 'typing', 'slideUp', 'word-by-word-fade']).default('none').describe('텍스트 등장 애니메이션'),
        out: z.enum(['none', 'fadeOut', 'slideDown']).default('none').describe('텍스트 퇴장 애니메이션'),
        highlight: z.enum(['none', 'yellow-box', 'red-box', 'blue-box', 'green-box', 'underline', 'bold', 'italic', 'glow', 'strike', 'outline']).default('yellow-box').describe('텍스트 하이라이트 효과'),
      }).describe('텍스트 애니메이션 설정'),
    }).refine(data => data.text || data.url, { message: "script object must have either 'text' or 'url'" }).describe('씬의 텍스트 스크립트 정보'),
    voice: z.string().optional().describe('음성 파일 경로'),
    transition: z.object({
      effect: z.enum(['none', 'slide-left', 'slide-right', 'fade', 'wipe-up']).default('none').describe('전환 효과'),
      duration: z.number().optional().describe('전환 지속시간 (프레임)'),
    }).optional().describe('다음 씬으로의 전환 설정'),
}).describe('비디오의 개별 씬(장면) 정의');


export const TemplateStyleSchema = z.object({
  fontFamily: z.object({
    header: z.string().optional().default('Pretendard, sans-serif'),
    title: z.string().optional().default('Pretendard, sans-serif'),
    text: z.string().optional().default('Pretendard, sans-serif'),
    meta: z.string().optional().default('Pretendard, sans-serif'),
  }).optional().describe('각 요소별 폰트 패밀리 설정'),
  fontSize: z.object({
    header: z.string().default('54px'),
    title: z.string().default('48px'),
    text: z.string().default('48px'),
    meta: z.string().default('36px'),
  }).optional().describe('각 요소별 폰트 크기 설정'),
  fontWeight: z.object({
    header: z.number().default(700),
    title: z.number().default(700),
    text: z.number().default(600),
    meta: z.number().default(400),
  }).optional().describe('각 요소별 폰트 굵기 설정'),
  fontStyle: z.object({
    header: z.enum(['normal', 'italic']).default('normal'),
    title: z.enum(['normal', 'italic']).default('normal'),
    text: z.enum(['normal', 'italic']).default('normal'),
    meta: z.enum(['normal', 'italic']).default('normal'),
  }).optional().describe('각 요소별 폰트 스타일 설정'),
  textColor: z.string().default('#1a1a1a').describe('기본 텍스트 색상'),
  headerTextColor: z.string().optional().describe('헤더 텍스트 색상 (선택사항)'),
  titleColor: z.string().optional().describe('제목 텍스트 색상 (선택사항)'),
  metaColor: z.string().optional().describe('메타정보 텍스트 색상 (선택사항)'),
  backgroundColor: z.string().default('#ffffff').describe('배경 색상'),
  headerColor: z.string().default('#a5d8f3').describe('헤더 배경 색상'),
  layout: z.enum(['text-middle', 'text-top', 'text-bottom']).default('text-middle').describe('텍스트 레이아웃 배치'),
  textAlign: z.object({
    header: z.enum(['left', 'center', 'right']).optional().default('center'),
    title: z.enum(['left', 'center', 'right']).optional().default('left'),
    text: z.enum(['left', 'center', 'right']).optional().default('center'),
    meta: z.enum(['left', 'center', 'right']).optional().default('left'),
  }).optional().describe('각 요소별 텍스트 정렬 설정'),
  lineHeight: z.string().default('1.4').describe('줄 간격'),
  letterSpacing: z.string().default('normal').describe('글자 간격'),
  border: z.object({
    enabled: z.boolean().default(false),
    width: z.string().default('2px'),
    style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
    color: z.string().default('#000000'),
    radius: z.string().default('8px'),
  }).optional().describe('테두리 설정'),
  boxShadow: z.object({
    enabled: z.boolean().default(false),
    x: z.number().default(0),
    y: z.number().default(4),
    blur: z.number().default(8),
    color: z.string().default('rgba(0,0,0,0.1)'),
  }).optional().describe('그림자 효과 설정'),
  highlight: z.object({
    backgroundColor: z.string().default('#ffd700'),
    textColor: z.string().default('#000000'),
    padding: z.string().default('0.1em 0.3em'),
    borderRadius: z.string().default('4px'),
  }).optional().describe('텍스트 하이라이트 스타일 설정'),
  headerEffect: z.object({
    shadow: z.object({
      enabled: z.boolean().default(false),
      x: z.number().default(2),
      y: z.number().default(2),
      blur: z.number().default(4),
      color: z.string().default('rgba(0,0,0,0.5)'),
    }).optional(),
    glow: z.object({
      enabled: z.boolean().default(false),
      color: z.string().default('#ffffff'),
      size: z.number().default(10),
    }).optional(),
  }).optional().describe('헤더 텍스트 효과 설정 (그림자, 글로우)'),
  titleEffect: z.object({
    shadow: z.object({
      enabled: z.boolean().default(false),
      x: z.number().default(2),
      y: z.number().default(2),
      blur: z.number().default(4),
      color: z.string().default('rgba(0,0,0,0.5)'),
    }).optional(),
    glow: z.object({
      enabled: z.boolean().default(false),
      color: z.string().default('#ffffff'),
      size: z.number().default(10),
    }).optional(),
  }).optional().describe('제목 텍스트 효과 설정 (그림자, 글로우)'),
  textEffect: z.object({
    shadow: z.object({
      enabled: z.boolean().default(false),
      x: z.number().default(2),
      y: z.number().default(2),
      blur: z.number().default(4),
      color: z.string().default('rgba(0,0,0,0.5)'),
    }).optional(),
    glow: z.object({
      enabled: z.boolean().default(false),
      color: z.string().default('#ffffff'),
      size: z.number().default(10),
    }).optional(),
  }).optional().describe('본문 텍스트 효과 설정 (그림자, 글로우)'),
});

// Scene 타입: API 스키마 + 시스템 내부 필드
export type Scene = z.infer<typeof SceneSchema> & {
  audioDuration?: number; // 시스템이 자동으로 계산하는 오디오 지속시간 (초)
};

export const VideoPropsSchema = z.object({
  templateStyle: TemplateStyleSchema.optional().describe('비디오 전체 스타일 설정 (폰트, 색상, 레이아웃 등)'),
  title: z.string().optional().describe('비디오 제목'),
  postMeta: z.object({
    author: z.string().default('익명'),
    time: z.string().default('14:25'),
    viewCount: z.string().default('3,463,126'),
  }).optional().describe('게시물 정보 (작성자, 시간, 조회수)'),
  media: z.array(SceneSchema).describe('비디오를 구성하는 씬(장면) 배열'),
});

export type VideoProps = Omit<z.infer<typeof VideoPropsSchema>, 'media'> & {
  media: Scene[];
};

export type TemplateStyle = z.infer<typeof TemplateStyleSchema>;

// CSS 타입 안전성을 위한 정확한 textAlign 타입 정의
export type CSSTextAlign = 'left' | 'center' | 'right';

// TemplateStyle의 textAlign이 CSS textAlign과 호환되도록 하는 타입 가드
export const isValidCSSTextAlign = (value: string | undefined): value is CSSTextAlign => {
  return value === 'left' || value === 'center' || value === 'right';
};