import { CSSProperties } from 'react';

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

export type AnimationPlugin = (options: AnimationPluginOptions) => AnimationResult; 