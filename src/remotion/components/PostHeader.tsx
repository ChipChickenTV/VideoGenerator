import React from 'react';
import { VideoProps, TemplateStyle } from '@/types/VideoProps';
import { THEME_CONSTANTS } from '@/config/theme';
import { generatePostHeaderStyle, generateTitleStyle, generateMetaStyle } from '../utils/styleUtils';

interface PostHeaderProps {
  title?: string;
  postMeta?: VideoProps['postMeta'];
  templateStyle?: TemplateStyle;
}

export const PostHeader: React.FC<PostHeaderProps> = ({ 
  title, 
  postMeta, 
  templateStyle 
}) => {
  const postHeaderStyle = generatePostHeaderStyle(templateStyle);
  const titleStyle = generateTitleStyle(templateStyle);
  const metaStyle = generateMetaStyle(templateStyle);

  return (
    <div style={{
      ...postHeaderStyle,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '36px 0', // 12px * 3
    }}>
      {/* 제목 */}
      {title && (
        <div style={{
          ...titleStyle,
          fontSize: titleStyle.fontSize || THEME_CONSTANTS.TYPOGRAPHY.POST_TITLE_SIZE,
          fontWeight: titleStyle.fontWeight || 700,
          marginBottom: 20,
          lineHeight: 1.3,
          fontFamily: titleStyle.fontFamily || THEME_CONSTANTS.FONTS.PRIMARY,
        }}>
          {title}
        </div>
      )}
      
      {/* 메타 정보 */}
      {postMeta && (postMeta.leftText || postMeta.rightText) && (
        <div style={{
          ...metaStyle,
          fontSize: metaStyle.fontSize || THEME_CONSTANTS.TYPOGRAPHY.META_TEXT_SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: THEME_CONSTANTS.FONTS.PRIMARY,
          fontStyle: templateStyle?.fontStyle?.text === 'italic' ? 'italic' : 'normal',
        }}>
          {postMeta.leftText && <span>{postMeta.leftText}</span>}
          {postMeta.rightText && <span>{postMeta.rightText}</span>}
        </div>
      )}
    </div>
  );
}; 