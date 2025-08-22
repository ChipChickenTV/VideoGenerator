import { interpolate } from 'remotion';
import { TransitionAnimation } from './types';

export const wipeUp: TransitionAnimation = (frame, duration) => {
	const animationDuration = duration || (wipeUp as any).defaultDuration;
	const inset = interpolate(
		frame,
		[0, animationDuration],
		[100, 0], // Wipe in from bottom
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return {
		clipPath: `inset(${inset}% 0 0 0)`,
	};
};

(wipeUp as any).description = "Wipe up transition effect";
(wipeUp as any).defaultDuration = 15;