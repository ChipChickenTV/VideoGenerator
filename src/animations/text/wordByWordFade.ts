import { AnimationPlugin, AnimationWithDescription } from '../types';

export const wordByWordFade: AnimationPlugin = ({ duration, text = '', chunkSize = 1 } = {}) => {
  const defaultDuration = (wordByWordFade as any).defaultDuration;
  const finalDuration = duration || defaultDuration;
  const effectiveDuration = text.length > 0 ? text.length * 3 : finalDuration;

  // HTML 태그와 텍스트를 분리하여 처리
  const parts = text.trim().match(/(<[^>]+>|[^<]+)/g) || [];
  
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
};

(wordByWordFade as AnimationWithDescription).description = "Text appears word by word with fade effect";
(wordByWordFade as any).defaultDuration = 90;