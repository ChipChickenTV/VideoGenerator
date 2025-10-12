import { interpolate } from 'remotion';
import { AnimationPluginOptions, TypedAnimationFunction } from '../types';

// word-by-word-fade 전용 청킹 함수
export const getCurrentTextChunk = (text: string, frame: number, duration: number = 90, chunkSize: number = 4) => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return {
      text: '',
      opacity: 0,
      chunkIndex: 0,
      totalChunks: 0,
    };
  }

  const hasSeptDelimiter = trimmedText.includes('[SEPT]');

  const createChunks = (): string[] => {
    if (hasSeptDelimiter) {
      return trimmedText
        .split('[SEPT]')
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0);
    }

    const words = trimmedText.split(/\s+/);
    const totalWords = words.length;

    if (totalWords === 0) {
      return [];
    }

    const chunks: string[] = [];
    for (let i = 0; i < totalWords; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    return chunks;
  };

  const chunks = createChunks();
  const totalChunks = chunks.length;

  if (totalChunks === 0) {
    return {
      text: '',
      opacity: 0,
      chunkIndex: 0,
      totalChunks,
    };
  }

  const chunkDuration = Math.max(1, Math.floor(duration / totalChunks));

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
    text: chunks[safeChunkIndex],
    opacity,
    chunkIndex: safeChunkIndex,
    totalChunks,
  };
}; 

export const wordByWordFade: TypedAnimationFunction = Object.assign(
  ({ duration, text = '', chunkSize = 1 }: AnimationPluginOptions & { text?: string; chunkSize?: number } = {}) => {
    const defaultDuration = wordByWordFade.metadata.defaultDuration;
    const finalDuration = duration || defaultDuration;
    const cleanedText = text.replace(/\[SEPT\]/g, ' ');
    const effectiveDuration = cleanedText.length > 0 ? cleanedText.length * 3 : finalDuration;

    // HTML 태그와 텍스트를 분리하여 처리
    const parts = cleanedText.trim().match(/(<[^>]+>|[^<]+)/g) || [];
    
    const elements: string[] = [];
    parts.forEach((part: string) => {
      if (part.startsWith('<')) {
        // HTML 태그는 그대로 유지
        elements.push(part);
      } else {
        // 텍스트는 글자 단위로 분할
        elements.push(...part.split(''));
      }
    });

    // 청크 크기로 나누어서 그룹화
    const chunks: string[][] = [];
    for (let i = 0; i < elements.length; i += chunkSize) {
      chunks.push(elements.slice(i, i + chunkSize));
    }
    
    const totalChunks = chunks.length;
    const chunkDuration = Math.floor(effectiveDuration / Math.max(totalChunks, 1));
    
    return {
      style: {
        opacity: 1,
      },
      chunks,
      chunkDuration,
      totalChunks,
    };
  },
  {
    metadata: {
      description: "Text appears word by word with fade effect",
      defaultDuration: 90,
      params: {
        duration: {
          type: 'number',
          default: 90,
          required: false,
          description: '단어별 페이드 애니메이션 지속 시간 (프레임)'
        },
        text: {
          type: 'string',
          default: '',
          required: false,
          description: '표시할 텍스트 내용'
        },
        chunkSize: {
          type: 'number',
          default: 1,
          required: false,
          description: '한 번에 표시할 글자 수'
        }
      }
    }
  }
);
