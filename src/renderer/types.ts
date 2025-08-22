export interface RenderOptions {
  outputPath?: string;
  codec?: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores';
  jpegQuality?: number;
  concurrency?: number | null;
  overwrite?: boolean;
  verbose?: boolean;
}

export interface RenderResult {
  success: boolean;
  outputPath: string;
  error?: string;
  duration?: number;
  assetsInfo?: Record<string, unknown>;
}