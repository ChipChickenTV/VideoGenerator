import React from 'react';
import { THEME_CONSTANTS } from '@/config/theme';
import { TemplateStyle } from '@/types/VideoProps';
import { generateHeaderStyle, generateDecorationText } from '../utils/styleUtils';

interface HeaderProps {
  templateStyle?: TemplateStyle;
}

export const Header: React.FC<HeaderProps> = ({ templateStyle }) => {
  const headerStyle = generateHeaderStyle(templateStyle);
  const decorationBefore = generateDecorationText(templateStyle, 'before');
  const decorationAfter = generateDecorationText(templateStyle, 'after');

  return (
    <div style={{
      ...headerStyle,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${THEME_CONSTANTS.DIMENSIONS.HEADER_PADDING}px 60px`,
      position: 'relative',
    }}>
      {/* 데코레이션 - 앞 */}
      {decorationBefore && (
        <div style={{
          position: 'absolute',
          left: '10px',
          fontSize: '16px',
        }}>
          {decorationBefore}
        </div>
      )}
      
      {/* 뒤로가기 버튼 */}
      <div style={{
        fontSize: 54,
        fontWeight: 'bold',
      }}>
        &lt;
      </div>
      
      {/* 헤더 제목 */}
      <div style={{
        color: headerStyle.color,
        fontSize: headerStyle.fontSize,
        fontWeight: headerStyle.fontWeight,
        fontFamily: headerStyle.fontFamily,
        fontStyle: headerStyle.fontStyle,
        textShadow: headerStyle.textShadow,
        animation: headerStyle.animation,
      }}>
        썰풀기
      </div>
      
      {/* 데코레이션 - 뒤 */}
      {decorationAfter && (
        <div style={{
          position: 'absolute',
          right: '50px',
          fontSize: '16px',
        }}>
          {decorationAfter}
        </div>
      )}
      
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