import { interpolate } from 'remotion';
import { TransitionAnimation } from './types';

const TRANSITION_DURATION = 15;

export const slideLeft: TransitionAnimation = (frame, durationInFrames) => {
	const translateX = interpolate(
		frame,
		[0, TRANSITION_DURATION, durationInFrames - TRANSITION_DURATION, durationInFrames],
		[100, 0, 0, -100], // Enter from right, exit to left
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return {
		transform: `translateX(${translateX}%)`,
	};
};