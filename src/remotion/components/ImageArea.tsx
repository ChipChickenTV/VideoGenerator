import React from 'react';
import { Img, staticFile } from 'remotion';
import { VideoProps } from '@/types/VideoProps';
import { THEME_CONSTANTS } from '@/config/theme';
import { getImageAnimation } from '@/animations/image';

interface ImageAreaProps {
  image: VideoProps['media'][0]['image'];
}

export const ImageArea: React.FC<ImageAreaProps> = ({ image }) => {
  if (!image) return null;
  
  const animationEffect = image.animation.effect;
  
  const animation = getImageAnimation(animationEffect);
  const animationWithMetadata = animation as { metadata?: { defaultDuration: number } };
  const duration = image.animation.duration || animationWithMetadata?.metadata?.defaultDuration || 90;
  const animationResult = animation({ duration });
  
  
  // URL이 로컬 파일 경로인지 확인 (public/ 폴더 기준)
  const isLocalFile = !image.url.startsWith('http');
  const imageSrc = isLocalFile ? staticFile(image.url) : image.url;
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: THEME_CONSTANTS.DIMENSIONS.IMAGE_BORDER_RADIUS,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        ...animationResult.style,
      }}>
        <Img
          src={imageSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  );
}; 