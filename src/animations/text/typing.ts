import { interpolate } from 'remotion';
import { AnimationPlugin, AnimationWithDescription } from '../types';
import { ANIMATION_CONSTANTS } from '../../config/theme';

export const typing: AnimationPlugin = ({ duration, text = '' } = {}) => {
  return {
    style: {
      overflow: 'hidden',
      whiteSpace: 'pre-wrap',
    },
    // Note: 실제 텍스트 자르기는 컴포넌트에서 처리
  };
};

export const getVisibleText = (text: string, frame: number, duration?: number): string => {
  const totalChars = text.length;
  const animationDuration = duration || (typing as any).defaultDuration || 90;
  const typingDuration = Math.min(animationDuration, totalChars * ANIMATION_CONSTANTS.DURATIONS.TYPING_SPEED);
  
  const visibleChars = Math.floor(interpolate(
    frame,
    [0, typingDuration],
    [0, totalChars],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  ));
  
  return text.slice(0, visibleChars);
};

(typing as AnimationWithDescription).description = "Text appears with typing effect";
(typing as any).defaultDuration = 90; 