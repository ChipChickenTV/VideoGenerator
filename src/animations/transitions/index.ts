import { fade } from './fade';
import { slideLeft } from './slideLeft';
import { slideRight } from './slideRight';
import { wipeUp } from './wipeUp';
import { TransitionAnimation } from './types';

export const transitionAnimations: Record<string, TransitionAnimation> = {
	'none': () => ({}),
	fade,
	'slide-left': slideLeft,
	'slide-right': slideRight,
	'wipe-up': wipeUp,
};

export const getTransitionAnimation = (
	effect: string
): TransitionAnimation => {
	return transitionAnimations[effect];
};