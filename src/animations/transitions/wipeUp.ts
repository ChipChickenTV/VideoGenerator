import { interpolate } from 'remotion';
import { TransitionAnimation } from './types';

const TRANSITION_DURATION = 15;

export const wipeUp: TransitionAnimation = (frame, durationInFrames) => {
	const inset = interpolate(
		frame,
		[0, TRANSITION_DURATION, durationInFrames - TRANSITION_DURATION, durationInFrames],
		[100, 0, 0, 100], // Wipe in from bottom, wipe out to top
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return {
		clipPath: `inset(${inset}% 0 0 0)`,
	};
};