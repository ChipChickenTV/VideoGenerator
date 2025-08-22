import React from 'react';
import { AbsoluteFill } from 'remotion';
import { THEME_CONSTANTS } from '@/config/theme';

interface PhoneFrameProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, style }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME_CONSTANTS.COLORS.BACKGROUND, // 검은색 배경
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: (typeof style?.background === 'string' ? style.background : THEME_CONSTANTS.COLORS.PHONE_BACKGROUND),
          borderRadius: THEME_CONSTANTS.DIMENSIONS.PHONE_BORDER_RADIUS,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          ...style, // 전달받은 스타일 적용
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
}; 