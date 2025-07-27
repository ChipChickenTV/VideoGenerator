import React from 'react';
import { VideoProps } from '@/types/VideoProps';
import { THEME_CONSTANTS } from '@/config/theme';
import { parseHighlightedText, getHighlightStyle } from '@/animations/text/highlights';
import { useTextAnimation } from '@/remotion/hooks/useTextAnimation';

interface TextAreaProps {
  script: VideoProps['media'][0]['script'];
  theme?: VideoProps['theme'];
  audioDurationInFrames?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({ script, theme, audioDurationInFrames }) => {
  if (!script) return null;

  const { displayText, animationStyle } = useTextAnimation({ script, audioDurationInFrames });
  const highlightEffect = script.animation?.highlight || 'yellow-box';

  if (!displayText) {
    return (
      <div style={{
        textAlign: 'center',
        marginBottom: 80,
        padding: '60px 40px',
        minHeight: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ opacity: 0 }}>.</div>
      </div>
    );
  }

  const textParts = parseHighlightedText(displayText, highlightEffect);

  return (
    <div style={{
      textAlign: 'center',
      marginBottom: 80,
      padding: '60px 40px',
      minHeight: 240,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        fontSize: THEME_CONSTANTS.TYPOGRAPHY.SCRIPT_TEXT_SIZE,
        fontWeight: 600,
        lineHeight: THEME_CONSTANTS.TYPOGRAPHY.LINE_HEIGHT,
        letterSpacing: THEME_CONSTANTS.TYPOGRAPHY.LETTER_SPACING,
        color: theme?.textColor || THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
        maxWidth: '90%',
        wordBreak: 'keep-all',
        fontFamily: theme?.fontFamily || THEME_CONSTANTS.FONTS.PRIMARY,
        ...animationStyle,
      }}>
        {textParts.map((part) => {
          if (part.type === 'highlight' && part.highlightType) {
            const highlightStyle = getHighlightStyle(part.highlightType);
            return (
              <span key={part.key} style={highlightStyle}>
                {part.content}
              </span>
            );
          } else {
            return <span key={part.key} dangerouslySetInnerHTML={{ __html: part.content }} />;
          }
        })}
      </div>
    </div>
  );
};