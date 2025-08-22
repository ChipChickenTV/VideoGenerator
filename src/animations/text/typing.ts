import { interpolate } from 'remotion';
import { AnimationPluginOptions, TypedAnimationFunction } from '../types';
import { ANIMATION_CONSTANTS } from '../../config/theme';

export const typing: TypedAnimationFunction = Object.assign(
  ({ duration, text = '' }: AnimationPluginOptions & { text?: string } = {}) => {
    return {
      style: {
        overflow: 'hidden',
        whiteSpace: 'pre-wrap',
      },
      // Note: 실제 텍스트 자르기는 컴포넌트에서 처리
    };
  },
  {
    metadata: {
      description: "Text appears with typing effect",
      defaultDuration: 90,
      params: {
        duration: {
          type: 'number',
          default: 90,
          required: false,
          description: '타이핑 애니메이션 지속 시간 (프레임)'
        },
        text: {
          type: 'string',
          default: '',
          required: false,
          description: '타이핑할 텍스트'
        }
      }
    }
  }
);

export const getVisibleText = (text: string, frame: number, duration?: number): string => {
  const totalChars = text.length;
  const animationDuration = duration || typing.metadata.defaultDuration;
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