import { AnimationPluginOptions, TypedAnimationFunction } from '../types';

export const wordByWordFade: TypedAnimationFunction = Object.assign(
  ({ duration, text = '', chunkSize = 1 }: AnimationPluginOptions & { text?: string; chunkSize?: number } = {}) => {
    const defaultDuration = wordByWordFade.metadata.defaultDuration;
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