import { fade } from './fade';
import { slideLeft } from './slideLeft';
import { slideRight } from './slideRight';
import { wipeUp } from './wipeUp';
import { TransitionAnimation } from './types';
import { TypedAnimationFunction } from '../types';

// TypedAnimationFunction을 TransitionAnimation으로 변환하는 wrapper 함수들
const wrapTransition = (typedAnimation: TypedAnimationFunction): TransitionAnimation => {
	return (frame: number, duration?: number) => {
		const result = typedAnimation({ frame, duration });
		return result.style || {};
	};
};

export const transitionAnimations: Record<string, TransitionAnimation> = {
	'none': () => ({}),
	fade: wrapTransition(fade),
	'slide-left': wrapTransition(slideLeft),
	'slide-right': wrapTransition(slideRight),
	'wipe-up': wrapTransition(wipeUp),
};

export const getTransitionAnimation = (
	effect: string
): TransitionAnimation => {
	return transitionAnimations[effect];
};