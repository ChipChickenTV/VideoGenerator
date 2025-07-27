import React from 'react';
import { THEME_CONSTANTS } from '@/config/theme';

export const Header: React.FC = () => {
  return (
    <div style={{
      backgroundColor: THEME_CONSTANTS.COLORS.HEADER_BACKGROUND,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${THEME_CONSTANTS.DIMENSIONS.HEADER_PADDING}px 60px`,
      color: THEME_CONSTANTS.COLORS.TEXT_SECONDARY,
    }}>
      {/* 뒤로가기 버튼 */}
      <div style={{
        fontSize: 54,
        fontWeight: 'bold',
      }}>
        &lt;
      </div>
      
      {/* 헤더 제목 */}
      <div style={{
        fontSize: THEME_CONSTANTS.TYPOGRAPHY.HEADER_TITLE_SIZE,
        fontWeight: 700,
        fontFamily: THEME_CONSTANTS.FONTS.PRIMARY,
      }}>
        썰풀기
      </div>
      
      {/* 프로필 */}
      <div style={{
        width: THEME_CONSTANTS.DIMENSIONS.PROFILE_SIZE,
        height: THEME_CONSTANTS.DIMENSIONS.PROFILE_SIZE,
        borderRadius: '50%',
        backgroundColor: THEME_CONSTANTS.COLORS.PROFILE_BACKGROUND,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        fontWeight: 'bold',
      }}>
        P
      </div>
    </div>
  );
}; 