import React from 'react';
import { Img, staticFile } from 'remotion';
import { VideoProps } from '@/types/VideoProps';
import { THEME_CONSTANTS } from '@/config/theme';
import { getImageAnimation } from '@/animations/image';
import { getImageFilter } from '@/animations/image/filters';

interface ImageAreaProps {
  image: VideoProps['media'][0]['image'];
}

export const ImageArea: React.FC<ImageAreaProps> = ({ image }) => {
  if (!image) return null;
  
  const animationEffect = image.animation.effect;
  const filterEffect = image.animation.filter;
  const duration = 90; // 기본 애니메이션 길이
  
  // 애니메이션 스타일 가져오기
  const animation = getImageAnimation(animationEffect);
  const animationResult = animation({ duration });
  
  // 필터 스타일 가져오기
  const filterStyle = getImageFilter(filterEffect);
  
  // URL이 로컬 파일 경로인지 확인 (public/ 폴더 기준)
  const isLocalFile = !image.url.startsWith('http');
  const imageSrc = isLocalFile ? staticFile(image.url) : image.url;
  
  return (
    <div style={{
      width: '100%',
      aspectRatio: '1',
      borderRadius: THEME_CONSTANTS.DIMENSIONS.IMAGE_BORDER_RADIUS,
      overflow: 'hidden',
      margin: '0 auto',
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
            filter: filterStyle,
          }}
        />
      </div>
    </div>
  );
}; 