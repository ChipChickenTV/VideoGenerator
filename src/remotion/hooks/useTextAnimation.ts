import { useCurrentFrame, interpolate } from 'remotion';
import { VideoProps } from '@/types/VideoProps';
import React from 'react';
import { getTextAnimation } from '@/animations/text';
import { getCurrentTextChunk } from '@/animations/text/wordByWordFade';

// 이 파일 내부에서만 사용될 헬퍼 함수들 (export하지 않음)
const splitTextIntoChunks = (text: string) => {
  // [SEPT] 구분자로 텍스트 분할
  const chunks = text.split('[SEPT]').map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);
  
  // [SEPT] 구분자가 없는 경우 전체 텍스트를 하나의 청크로 처리
  if (chunks.length === 0 && text.trim().length > 0) {
    return [text.trim()];
  }
  
  return chunks;
};

const getCurrentChunkInfo = (text: string, frame: number, duration: number) => {
  const chunks = splitTextIntoChunks(text);
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

const getInAnimationStyle = (animationType: string, frameInChunk: number, chunkDuration: number, customDuration?: number) => {
  const animationFunction = getTextAnimation(animationType);
  const animationWithMetadata = animationFunction as { metadata?: { defaultDuration: number } };
  const defaultDuration = animationWithMetadata?.metadata?.defaultDuration || 30;
  const animationDuration = customDuration || Math.min(chunkDuration * 0.3, 20, defaultDuration);
  
  try {
    const result = animationFunction({ duration: animationDuration, delay: 0, frame: frameInChunk });
    
    // Special handling for typing effect
    if (animationType === 'typing') {
      return {
        ...result.style,
        typingProgress: interpolate(frameInChunk, [0, chunkDuration * 0.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      };
    }
    
    return result.style;
  } catch {
    // Fallback to default if animation not found
    return { opacity: 1 };
  }
};

const getOutAnimationStyle = (animationType: string, frameInChunk: number, chunkDuration: number, customDuration?: number) => {
  if (animationType === 'none') {
    return {};
  }
  
  const animationFunction = getTextAnimation(animationType);
  const animationWithMetadata = animationFunction as { metadata?: { defaultDuration: number } };
  const defaultDuration = animationWithMetadata?.metadata?.defaultDuration || 30;
  const animationDuration = customDuration || Math.min(chunkDuration * 0.3, 20, defaultDuration);
  const startFrame = chunkDuration - animationDuration;
  
  try {
    const result = animationFunction({ duration: animationDuration, delay: startFrame, frame: frameInChunk });
    
    return result.style;
  } catch {
    // Fallback to default if animation not found
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
  script: VideoProps['media'][0]['script'] | null;
  audioDurationInFrames?: number;
}

export const useTextAnimation = ({ script, audioDurationInFrames }: UseTextAnimationParams) => {
  const frame = useCurrentFrame();

  // script가 null이거나 animation이 없는 경우 안전한 기본값 반환
  if (!script || !script.animation) {
    return { 
      displayText: '', 
      animationStyle: { opacity: 0 } 
    };
  }

  const inAnimation = script.animation.in;
  const outAnimation = script.animation.out;
  const duration = audioDurationInFrames || 60;

  // Special handling for word-by-word-fade
  if (inAnimation === 'word-by-word-fade') {
    const chunkResult = getCurrentTextChunk(script.text || '', frame, duration);
    return { 
      displayText: chunkResult.text, 
      animationStyle: { opacity: chunkResult.opacity } 
    };
  }

  const chunkInfo = getCurrentChunkInfo(script.text || '', frame, duration);
  const { frameInChunk, chunkDuration } = chunkInfo;

  const inStyle = getInAnimationStyle(inAnimation, frameInChunk, chunkDuration, script.animation.inDuration);
  const outStyle = getOutAnimationStyle(outAnimation, frameInChunk, chunkDuration, script.animation.outDuration);

  // `typing` 효과를 위한 displayText 처리
  let displayText = chunkInfo.text;
  if (inAnimation === 'typing' && 'typingProgress' in inStyle) {
    displayText = getTypingText(chunkInfo.text, inStyle.typingProgress as number);
  }

  // Animation timing: in (30%), static (40%), out (30%)
  const outAnimationStartFrame = chunkDuration - Math.min(chunkDuration * 0.3, 20);
  
  let combinedStyle: React.CSSProperties;
  
  if (frameInChunk >= outAnimationStartFrame) {
    // Out animation phase - use only out animation style
    combinedStyle = { ...outStyle };
  } else {
    // In animation phase - use only in animation style
    combinedStyle = { ...inStyle };
  }
  
  return { displayText, animationStyle: combinedStyle };
};