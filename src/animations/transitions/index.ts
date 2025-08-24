import { fade } from './fade';
import { slideLeft } from './slideLeft';
import { slideRight } from './slideRight';
import { wipeUp } from './wipeUp';
import { TypedAnimationFunction } from '../types';

const noneTransition: TypedAnimationFunction = Object.assign(
	() => ({ style: {} }),
	{
		metadata: {
			description: "No transition effect",
			defaultDuration: 0
		}
	}
);

export const transitionAnimations: Record<string, TypedAnimationFunction> = {
	'none': noneTransition,
	fade,
	'slide-left': slideLeft,
	'slide-right': slideRight,
	'wipe-up': wipeUp,
};

export const getTransitionAnimation = (effect: string): TypedAnimationFunction => {
	return transitionAnimations[effect];
};