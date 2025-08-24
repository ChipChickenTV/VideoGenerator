import { AnimationPlugin, TypedAnimationFunction } from '../types';
import { fadeIn } from './fadeIn';
import { fadeOut } from './fadeOut';
import { typing } from './typing';
import { highlightStyles } from './highlights';
import { wordByWordFade } from './wordByWordFade';
import { slideUp } from './slideUp';
import { slideDown } from './slideDown';

export { highlightStyles };

export const textAnimations: Record<string, TypedAnimationFunction | AnimationPlugin> = {
  'none': () => ({ style: {} }),
  'fadeIn': fadeIn,
  'fadeOut': fadeOut,
  'typing': typing,
  'word-by-word-fade': wordByWordFade,
  'slideUp': slideUp,
  'slideDown': slideDown,
};

export const getTextAnimation = (effect: string): TypedAnimationFunction | AnimationPlugin => {
  return textAnimations[effect] || textAnimations['fadeIn'];
}; 