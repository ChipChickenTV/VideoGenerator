import { CSSProperties } from 'react';

export type TransitionAnimation = (
	frame: number,
	durationInFrames: number
) => CSSProperties;