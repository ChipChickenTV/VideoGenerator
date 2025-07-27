import { interpolate } from 'remotion';
import { TransitionAnimation } from './types';

const TRANSITION_DURATION = 15;

export const fade: TransitionAnimation = (frame, durationInFrames) => {
	const opacity = interpolate(
		frame,
		[0, TRANSITION_DURATION, durationInFrames - TRANSITION_DURATION, durationInFrames],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);
	return { opacity };
};