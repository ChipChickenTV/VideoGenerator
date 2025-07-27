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

export const VideoPropsSchema = z.object({
  theme: z.object({
    fontFamily: z.string().default('Pretendard, sans-serif'),
    textColor: z.string().default('#1a1a1a'),
    backgroundColor: z.string().default('#ffffff'),
    headerColor: z.string().default('#a5d8f3'),
    layout: z.string().default('text-middle'),
  }).optional(),
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