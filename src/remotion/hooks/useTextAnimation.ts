import { useCurrentFrame, interpolate } from 'remotion';
import { VideoProps } from '@/types/VideoProps';
import React from 'react';

// 이 파일 내부에서만 사용될 헬퍼 함수들 (export하지 않음)
const splitTextIntoChunks = (text: string, chunkSize: number = 4) => {
  const elements = text.trim().match(/<[^>]+>|\S+/g) || [];
  const chunks = [];
  for (let i = 0; i < elements.length; i += chunkSize) {
    chunks.push(elements.slice(i, i + chunkSize).join(' '));
  }
  if (chunks.length === 0 && text.trim().length > 0) {
    return [text.trim()];
  }
  return chunks;
};

const getCurrentChunkInfo = (text: string, frame: number, duration: number) => {
  const chunks = splitTextIntoChunks(text, 4);
  const totalChunks = chunks.length;
  if (totalChunks === 0) {
    return { text: '', frameInChunk: 0, chunkDuration: 0 };
  }
  const chunkDuration = Math.floor(duration / totalChunks);
  const currentChunkIndex = Math.floor(frame / chunkDuration);
  const safeChunkIndex = Math.min(currentChunkIndex, totalChunks - 1);
  if (safeChunkIndex < 0) {
    return { text: '', frameInChunk: 0, chunkDuration: 0 };
  }
  const chunkStartFrame = safeChunkIndex * chunkDuration;
  const frameInChunk = frame - chunkStartFrame;
  return {
    text: chunks[safeChunkIndex],
    frameInChunk,
    chunkDuration,
  };
};

const getInAnimationStyle = (animationType: string, frameInChunk: number, chunkDuration: number) => {
  const animationDuration = Math.min(chunkDuration * 0.3, 20);
  switch (animationType) {
    case 'none':
      return { opacity: 1 };
    case 'fadeIn':
      return { opacity: interpolate(frameInChunk, [0, animationDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) };
    case 'slideUp':
      return {
        opacity: interpolate(frameInChunk, [0, animationDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        transform: `translateY(${interpolate(frameInChunk, [0, animationDuration], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
      };
    case 'word-by-word-fade': // Fallback for now
    case 'typing':
      return {
        opacity: 1,
        typingProgress: interpolate(frameInChunk, [0, chunkDuration * 0.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      };
    default:
      return { opacity: 1 };
  }
};

const getOutAnimationStyle = (animationType: string, frameInChunk: number, chunkDuration: number) => {
  const animationDuration = Math.min(chunkDuration * 0.3, 20);
  const startFrame = chunkDuration - animationDuration;

  switch (animationType) {
    case 'none':
      return {};
    case 'fadeOut':
      return { opacity: interpolate(frameInChunk, [startFrame, chunkDuration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) };
    case 'slideDown':
      return {
        opacity: interpolate(frameInChunk, [startFrame, chunkDuration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        transform: `translateY(${interpolate(frameInChunk, [startFrame, chunkDuration], [0, 30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
      };
    default:
      return {};
  }
};

const getTypingText = (text: string, progress: number) => {
  const elements = text.match(/<[^>]+>|./g) || [];
  const totalChars = elements.filter(el => !el.startsWith('<')).length;
  const visibleChars = Math.floor(totalChars * progress);
  let currentChars = 0;
  let result = '';
  for (const el of elements) {
    if (el.startsWith('<')) {
      result += el;
    } else {
      if (currentChars < visibleChars) {
        result += el;
        currentChars++;
      }
    }
  }
  return result;
};


interface UseTextAnimationParams {
  script: VideoProps['media'][0]['script'];
  audioDurationInFrames?: number;
}

export const useTextAnimation = ({ script, audioDurationInFrames }: UseTextAnimationParams) => {
  const frame = useCurrentFrame();

  const inAnimation = script.animation.in;
  const outAnimation = script.animation.out;
  const duration = audioDurationInFrames || 60;

  const chunkInfo = getCurrentChunkInfo(script.text || '', frame, duration);
  const { frameInChunk, chunkDuration } = chunkInfo;

  const inStyle = getInAnimationStyle(inAnimation, frameInChunk, chunkDuration);
  const outStyle = getOutAnimationStyle(outAnimation, frameInChunk, chunkDuration);

  // `typing` 효과를 위한 displayText 처리
  let displayText = chunkInfo.text;
  if (inAnimation === 'typing' && 'typingProgress' in inStyle) {
    displayText = getTypingText(chunkInfo.text, inStyle.typingProgress as number);
  }

  // inStyle과 outStyle을 병합합니다.
  const combinedStyle: React.CSSProperties = { ...inStyle, ...outStyle };

  // transform 속성이 충돌하는 경우 (e.g., slideUp -> slideDown)
  // 퇴장 애니메이션의 transform이 등장 애니메이션의 transform을 덮어쓰도록 합니다.
  if (inStyle.transform && outStyle.transform) {
    const outAnimationStartFrame = chunkDuration - Math.min(chunkDuration * 0.3, 20);
    // 퇴장 애니메이션이 시작된 후에는 퇴장 스타일만 적용
    if (frameInChunk >= outAnimationStartFrame) {
      combinedStyle.transform = outStyle.transform;
    } else {
      combinedStyle.transform = inStyle.transform;
    }
  }
  
  return { displayText, animationStyle: combinedStyle };
};