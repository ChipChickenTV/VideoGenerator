import { z } from 'zod';
import { CSSProperties } from 'react';

export const zodAnimationInfo = z.object({
	name: z.string(),
	type: z.enum(['image', 'text', 'transition', 'filter', 'highlight']),
	description: z.string(),
  demoContent: z.string().optional(),
});

export type AnimationInfo = z.infer<typeof zodAnimationInfo>;

export interface AnimationPluginOptions {
  duration?: number;
  delay?: number;
  frame?: number;
  [key: string]: any;
}

export interface AnimationResult {
  style: CSSProperties;
  className?: string;
}

export type AnimationPlugin = (options?: AnimationPluginOptions) => AnimationResult;

export interface AnimationWithDescription extends AnimationPlugin {
  description: string;
}