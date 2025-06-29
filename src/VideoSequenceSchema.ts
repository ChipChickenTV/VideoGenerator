import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { 
  imageAnimationEffects,
  imageAnimationFilters,
  scriptAnimationInTypes,
  scriptAnimationOutTypes,
  scriptAnimationHighlightTypes,
  transitionEffects
} from './inputData';

// Define the schema for VideoSequence props using const arrays from inputData
export const videoSequenceSchema = z.object({
  title: z.string().optional(),
  media: z.array(z.object({
    image: z.object({
      url: z.string().url().optional(),
      animation: z.object({
        effect: z.enum(imageAnimationEffects).optional(),
        filter: z.enum(imageAnimationFilters).optional(),
      }).optional(),
    }),
    script: z.object({
      url: z.string().url().optional(),
      animation: z.object({
        in: z.enum(scriptAnimationInTypes).optional(),
        out: z.enum(scriptAnimationOutTypes).optional(),
        highlight: z.enum(scriptAnimationHighlightTypes).optional(),
      }).optional(),
    }),
    voice: z.string().url().optional(),
    transition: z.object({
      effect: z.enum(transitionEffects),
      duration: z.number(),
    }).optional(),
  })).optional(),
  theme: z.object({
    fontFamily: z.string().optional(),
    textColor: zColor().optional(),
    backgroundColor: zColor().optional(),
    layout: z.enum(['text-top', 'text-middle', 'text-bottom']).optional(),
  }).optional(),
  audioDurations: z.array(z.number()).optional(),
});

// Export the type
export type VideoSequenceProps = z.infer<typeof videoSequenceSchema>; 