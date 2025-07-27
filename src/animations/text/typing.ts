import { interpolate } from 'remotion';
import { AnimationPlugin } from '../types';
import { ANIMATION_CONSTANTS } from '../../config/theme';

export const typing: AnimationPlugin = ({ duration = 90, text = '' }) => {
  return {
    style: {
      overflow: 'hidden',
      whiteSpace: 'pre-wrap',
    },
    // Note: 실제 텍스트 자르기는 컴포넌트에서 처리
  };
};

export const getVisibleText = (text: string, frame: number, duration: number = 90): string => {
  const totalChars = text.length;
  const typingDuration = Math.min(duration, totalChars * ANIMATION_CONSTANTS.DURATIONS.TYPING_SPEED);
  
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