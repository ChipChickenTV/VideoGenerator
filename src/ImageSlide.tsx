import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
  spring,
} from 'remotion';
import { MediaItem } from './inputData';

interface ImageSlideProps {
  mediaItem: MediaItem;
  slideDuration: number;
  isLastSlide: boolean;
}

export const ImageSlide: React.FC<ImageSlideProps> = ({ mediaItem, slideDuration, isLastSlide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const transitionDuration = 10; // frames for transition
  
  // Spring animation for image entrance
  const imageScale = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });
  
  const imageTranslateY = interpolate(
    frame,
    [0, 30],
    [60, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  // Fade out animation for current image when transitioning
  const imageOpacity = isLastSlide 
    ? 1 // Last slide doesn't fade out
    : interpolate(
        frame,
        [0, transitionDuration, slideDuration, slideDuration + transitionDuration],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: imageOpacity,
        transform: `translateY(${imageTranslateY}px) scale(${imageScale})`,
        borderRadius: '36px',
        overflow: 'hidden',
      }}
    >
      <Img
        src={mediaItem.image}
        style={postImageStyle}
      />
    </div>
  );
};

const postImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}; 