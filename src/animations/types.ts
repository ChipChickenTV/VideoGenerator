import { z } from 'zod';
import { CSSProperties } from 'react';

export const zodAnimationInfo = z.object({
	name: z.string(),
	type: z.enum(['image', 'text', 'transition', 'highlight']),
	description: z.string(),
  demoContent: z.string().optional(),
});

export type AnimationInfo = z.infer<typeof zodAnimationInfo>;

export interface AnimationPluginOptions {
  duration?: number;
  delay?: number;
  frame?: number;
  [key: string]: unknown;
}

export interface AnimationResult {
  style: CSSProperties;
  className?: string;
}

export type AnimationPlugin = (options?: AnimationPluginOptions) => AnimationResult;

export interface AnimationWithDescription extends AnimationPlugin {
  description: string;
}

// 완벽한 애니메이션 메타데이터 시스템
export interface AnimationMetadata {
  description: string;
  defaultDuration: number;
  params?: Record<string, {
    type: string;
    default: unknown;
    required: boolean;
    description?: string;
  }>;
}

export interface AnimationWithMetadata extends AnimationPlugin {
  metadata: AnimationMetadata;
}

// Scene 길이에 맞춰 실행되는 애니메이션 (Image)
export interface SceneLengthAnimationMetadata {
  description: string;
  params?: Record<string, {
    type: string;
    default: unknown;
    required: boolean;
    description?: string;
  }>;
}

export type SceneLengthAnimation = AnimationPlugin & {
  metadata: SceneLengthAnimationMetadata;
};

// 타입 안전한 애니메이션 함수 타입 (Text, Transition)
export type TypedAnimationFunction = AnimationPlugin & {
  metadata: AnimationMetadata;
}