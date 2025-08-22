// 메인 렌더링 인터페이스 - 모든 렌더링 기능을 통합 제공
export { renderVideo, renderStill } from './core';
export { validateAndEnrichProps } from './validation';
export type { RenderOptions, RenderResult } from './types';

// 레거시 호환성을 위한 기본 내보내기
export { renderVideo as default } from './core';