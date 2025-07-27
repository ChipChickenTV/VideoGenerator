import { interpolate } from 'remotion';
import { AnimationPlugin } from '../types';
import { fadeIn } from './fadeIn';
import { fadeOut } from './fadeOut';
import { typing } from './typing';
import { highlightStyles } from './highlights';
import { wordByWordFade } from './wordByWordFade';
import { slideUp } from './slideUp';
import { slideDown } from './slideDown';

export { highlightStyles };

export const textAnimations: Record<string, AnimationPlugin> = {
  'none': () => ({ style: {} }),
  'fadeIn': fadeIn,
  'fadeOut': fadeOut,
  'typing': typing,
  'word-by-word-fade': wordByWordFade,
  'slideUp': slideUp,
  'slideDown': slideDown,
};

// 다이나믹 임포트를 위한 헬퍼 함수
export const getTextAnimation = (effect: string): AnimationPlugin => {
  return textAnimations[effect] || textAnimations['fadeIn'];
};

// 현재 보여줄 청크만 반환 (나레이션 타이밍 기반)
export const getCurrentTextChunk = (text: string, frame: number, duration: number = 90, chunkSize: number = 4) => {
  const words = text.trim().split(/\s+/);
  const totalWords = words.length;
  
  // 청크 크기로 나누어서 그룹화
  const chunks = [];
  for (let i = 0; i < totalWords; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }
  
  const totalChunks = chunks.length;
  const chunkDuration = Math.floor(duration / Math.max(totalChunks, 1));
  
  // 현재 프레임에서 보여야 할 청크 인덱스 계산
  const currentChunkIndex = Math.floor(frame / chunkDuration);
  
  // 범위를 벗어나면 마지막 청크 표시
  const safeChunkIndex = Math.min(currentChunkIndex, totalChunks - 1);
  
  if (safeChunkIndex < 0 || safeChunkIndex >= totalChunks) {
    return {
      text: '',
      opacity: 0,
      chunkIndex: 0,
      totalChunks,
    };
  }
  
  // 청크 전환 애니메이션 (페이드 효과)
  const chunkStartFrame = safeChunkIndex * chunkDuration;
  const chunkEndFrame = chunkStartFrame + chunkDuration;
  const fadeInDuration = 10; // 페이드 인 시간 (프레임)
  const fadeOutDuration = 10; // 페이드 아웃 시간 (프레임)
  
  let opacity = 1;
  
  // 청크 시작 부분에서 페이드 인
  if (frame < chunkStartFrame + fadeInDuration) {
    opacity = interpolate(
      frame,
      [chunkStartFrame, chunkStartFrame + fadeInDuration],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
  }
  // 청크 끝 부분에서 페이드 아웃 (마지막 청크가 아닌 경우)
  else if (safeChunkIndex < totalChunks - 1 && frame > chunkEndFrame - fadeOutDuration) {
    opacity = interpolate(
      frame,
      [chunkEndFrame - fadeOutDuration, chunkEndFrame],
      [1, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
  }
  
  return {
    text: chunks[safeChunkIndex].join(' '),
    opacity,
    chunkIndex: safeChunkIndex,
    totalChunks,
  };
}; 