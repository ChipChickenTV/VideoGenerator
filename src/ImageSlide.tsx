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
  const animation = mediaItem.image.animation;
  const effect = animation?.effect || 'static';

  // --- Dynamic Animation Logic ---

  const fadeIn = interpolate(frame, [0, transitionDuration], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = isLastSlide ? 1 : interpolate(frame, [slideDuration - transitionDuration, slideDuration], [1, 0], { extrapolateLeft: 'clamp' });
  const imageOpacity = Math.min(fadeIn, fadeOut);

  let imageTransform = '';

  switch (effect) {
    case 'zoom-in':
      const scaleIn = interpolate(frame, [0, slideDuration], [1, 1.15]);
      imageTransform = `scale(${scaleIn})`;
      break;
    case 'zoom-out':
      const scaleOut = interpolate(frame, [0, slideDuration], [1.15, 1]);
      imageTransform = `scale(${scaleOut})`;
      break;
    case 'pan-right':
      const panRight = interpolate(frame, [0, slideDuration], [-10, 0]);
      imageTransform = `translateX(${panRight}%) scale(1.2)`;
      break;
    case 'pan-left':
      const panLeft = interpolate(frame, [0, slideDuration], [0, -10]);
      imageTransform = `translateX(${panLeft}%) scale(1.2)`;
      break;
    case 'pan-down':
        const panDown = interpolate(frame, [0, slideDuration], [-10, 0]);
        imageTransform = `translateY(${panDown}%) scale(1.2)`;
        break;
    case 'pan-up':
        const panUp = interpolate(frame, [0, slideDuration], [0, -10]);
        imageTransform = `translateY(${panUp}%) scale(1.2)`;
        break;
    case 'ken-burns':
      const kenBurnsScale = interpolate(frame, [0, slideDuration], [1, 1.2]);
      const kenBurnsTranslateX = interpolate(frame, [0, slideDuration], [-5, 5]);
      const kenBurnsTranslateY = interpolate(frame, [0, slideDuration], [2, -2]);
      imageTransform = `scale(${kenBurnsScale}) translateX(${kenBurnsTranslateX}%) translateY(${kenBurnsTranslateY}%)`;
      break;
    case 'subtle-wobble':
      const wobbleX = Math.sin(frame / 15) * 2;
      const wobbleY = Math.cos(frame / 20) * 2;
      imageTransform = `translateX(${wobbleX}px) translateY(${wobbleY}px) scale(1.1)`;
      break;
    case 'static':
    default:
      imageTransform = 'scale(1)';
      break;
  }

  const getFilterValue = () => {
    switch (animation?.filter) {
      case 'grayscale':
        return 'grayscale(100%)';
      case 'sepia':
        return 'sepia(100%)';
      case 'blur':
        return 'blur(8px)';
      default:
        return 'none';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: imageOpacity,
        transform: imageTransform,
        borderRadius: '36px',
        overflow: 'hidden',
      }}
    >
      <Img
        src={mediaItem.image.url}
        style={{
          ...postImageStyle,
          filter: getFilterValue(),
        }}
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