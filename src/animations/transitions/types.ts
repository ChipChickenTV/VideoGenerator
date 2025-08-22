import { CSSProperties } from 'react';

export type TransitionAnimation = (
	frame: number,
	duration?: number
) => CSSProperties;