import { interpolate } from 'remotion';
import { TransitionAnimation } from './types';

export const fade: TransitionAnimation = (frame, duration) => {
	const animationDuration = duration || (fade as any).defaultDuration;
	const opacity = interpolate(
		frame,
		[0, animationDuration],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);
	return { opacity };
};

(fade as any).description = "Fade in/out transition effect";
(fade as any).defaultDuration = 15;