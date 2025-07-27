import React from 'react';
import { VideoProps } from '@/types/VideoProps';
import { THEME_CONSTANTS } from '@/config/theme';

interface PostHeaderProps {
  title?: string;
  postMeta?: VideoProps['postMeta'];
}

export const PostHeader: React.FC<PostHeaderProps> = ({ title, postMeta }) => {
  return (
    <div style={{
      paddingBottom: 40,
      borderBottom: `4px solid ${THEME_CONSTANTS.COLORS.BORDER}`,
      marginBottom: 60,
    }}>
      {/* 제목 */}
      {title && (
        <div style={{
          fontSize: THEME_CONSTANTS.TYPOGRAPHY.POST_TITLE_SIZE,
          fontWeight: 700,
          marginBottom: 20,
          lineHeight: 1.3,
          fontFamily: THEME_CONSTANTS.FONTS.PRIMARY,
          color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
        }}>
          {title}
        </div>
      )}
      
      {/* 메타 정보 */}
      {postMeta && (
        <div style={{
          fontSize: THEME_CONSTANTS.TYPOGRAPHY.META_TEXT_SIZE,
          color: THEME_CONSTANTS.COLORS.TEXT_META,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          fontFamily: THEME_CONSTANTS.FONTS.PRIMARY,
        }}>
          <span>{postMeta.author || '익명'}</span>
          <span>|</span>
          <span>{postMeta.time || '14:25'}</span>
          <span style={{ marginLeft: 'auto' }}>
            조회수 {postMeta.viewCount || '3,463,126'}
          </span>
        </div>
      )}
    </div>
  );
}; 