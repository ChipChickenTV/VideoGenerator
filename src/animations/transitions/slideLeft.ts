import { interpolate } from 'remotion';
import { TransitionAnimation } from './types';

export const slideLeft: TransitionAnimation = (frame, duration) => {
	const animationDuration = duration || (slideLeft as any).defaultDuration;
	const translateX = interpolate(
		frame,
		[0, animationDuration],
		[100, 0], // Enter from right, settle at center
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return {
		transform: `translateX(${translateX}%)`,
	};
};

(slideLeft as any).description = "Slide left transition effect";
(slideLeft as any).defaultDuration = 15;