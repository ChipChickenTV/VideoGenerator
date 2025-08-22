import { interpolate } from 'remotion';
import { TransitionAnimation } from './types';

export const slideRight: TransitionAnimation = (frame, duration) => {
	const animationDuration = duration || (slideRight as any).defaultDuration;
	const translateX = interpolate(
		frame,
		[0, animationDuration],
		[-100, 0], // Enter from left, settle at center
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return {
		transform: `translateX(${translateX}%)`,
	};
};

(slideRight as any).description = "Slide right transition effect";
(slideRight as any).defaultDuration = 15;