import { CSSProperties } from 'react';

export const highlightStyles: Record<string, CSSProperties> = {
  'yellow-box': {
    backgroundColor: '#ffeb3b',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#333333',
    fontWeight: 'bold',
  },
  'underline': {
    textDecoration: 'underline',
    textDecorationColor: '#2196f3',
    textDecorationThickness: '3px',
    textUnderlineOffset: '4px',
    fontWeight: 'bold',
  },
  'red-box': {
    backgroundColor: '#f44336',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  'blue-box': {
    backgroundColor: '#2196f3',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  'green-box': {
    backgroundColor: '#4caf50',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  'bold': {
    fontWeight: 'bold',
    color: '#333333',
  },
  'italic': {
    fontStyle: 'italic',
    color: '#666666',
  },
  'glow': {
    textShadow: '0 0 10px #ffeb3b, 0 0 20px #ffeb3b, 0 0 30px #ffeb3b',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  'strike': {
    textDecoration: 'line-through',
    textDecorationColor: '#f44336',
    textDecorationThickness: '2px',
    color: '#999999',
  },
  'outline': {
    textShadow: '1px 1px 0 #000000, -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  'none': {},
};

export const getHighlightStyle = (highlightType: string): CSSProperties => {
  return highlightStyles[highlightType] || highlightStyles['none'];
};

// HTML 태그 파싱을 위한 헬퍼 함수 (상태 기반)
export const parseHighlightedText = (text: string, defaultHighlight: string) => {
  // 여는 h 태그, 닫는 h 태그를 기준으로 분리
  const parts = text.split(/(<h(?:\s+type="[^"]*")?>|<\/h>)/g).filter(p => p);

  let isHighlighting = false;
  let highlightType = defaultHighlight;
  const result: { type: 'highlight' | 'text'; content: string; highlightType?: string; key: number }[] = [];

  parts.forEach((part, index) => {
    const isOpenTag = part.match(/^<h(?:\s+type="([^"]*)")?>$/);
    const isCloseTag = part === '</h>';

    if (isOpenTag) {
      isHighlighting = true;
      highlightType = isOpenTag[1] || defaultHighlight;
    } else if (isCloseTag) {
      isHighlighting = false;
    } else {
      if (isHighlighting) {
        result.push({
          type: 'highlight',
          content: part,
          highlightType: highlightType,
          key: index,
        });
      } else {
        result.push({
          type: 'text',
          content: part,
          key: index,
        });
      }
    }
  });

  return result;
};

// 사용 가능한 하이라이트 타입 목록
export const AVAILABLE_HIGHLIGHT_TYPES = Object.keys(highlightStyles) as (keyof typeof highlightStyles)[];

// 하이라이트 타입 설명
export const HIGHLIGHT_TYPE_DESCRIPTIONS = {
  'none': '하이라이트 없음',
  'yellow-box': '노란색 박스 배경',
  'red-box': '빨간색 박스 배경',
  'blue-box': '파란색 박스 배경', 
  'green-box': '초록색 박스 배경',
  'underline': '파란색 밑줄',
  'bold': '굵은 글씨',
  'italic': '기울임 글씨',
  'glow': '발광 효과',
  'strike': '취소선',
  'outline': '외곽선 효과',
} as const; 