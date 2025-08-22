import React from 'react';
import { TemplateStyle, VideoProps } from '@/types/VideoProps';
import { THEME_CONSTANTS } from '@/config/theme';
import { parseHighlightedText, getHighlightStyle } from '@/animations/text/highlights';
import { useTextAnimation } from '@/remotion/hooks/useTextAnimation';
import { generateTextAreaStyle, generateHighlightStyle } from '../utils/styleUtils';

interface TextAreaProps {
  script: VideoProps['media'][0]['script'];
  templateStyle?: TemplateStyle;
  audioDurationInFrames?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({ script, templateStyle, audioDurationInFrames }) => {
  if (!script) return null;

  const { displayText, animationStyle } = useTextAnimation({ script, audioDurationInFrames });
  const highlightEffect = script.animation?.highlight || 'yellow-box';
  
  // 확장된 스타일 생성
  const textAreaStyle = generateTextAreaStyle(templateStyle);
  const customHighlightStyle = generateHighlightStyle(templateStyle);

  if (!displayText) {
    return (
      <div style={{
        ...textAreaStyle,
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '45px 30px', // 15px 10px * 3
      }}>
        <div style={{ opacity: 0 }}>.</div>
      </div>
    );
  }

  const textParts = parseHighlightedText(displayText, highlightEffect);

  const layoutStyle: React.CSSProperties = {
    'text-top': { alignItems: 'flex-start' },
    'text-middle': { alignItems: 'center' },
    'text-bottom': { alignItems: 'flex-end' },
  }[templateStyle?.layout || 'text-middle'];

  return (
    <div style={{
      ...textAreaStyle,
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '45px 30px', // 15px 10px * 3 (template-examples.html 기준)
      overflow: 'hidden',
      ...layoutStyle,
    }}>
      <div style={{
        ...textAreaStyle,
        fontSize: textAreaStyle.fontSize || THEME_CONSTANTS.TYPOGRAPHY.SCRIPT_TEXT_SIZE,
        fontWeight: textAreaStyle.fontWeight || 600,
        lineHeight: textAreaStyle.lineHeight || THEME_CONSTANTS.TYPOGRAPHY.LINE_HEIGHT,
        letterSpacing: textAreaStyle.letterSpacing || THEME_CONSTANTS.TYPOGRAPHY.LETTER_SPACING,
        color: textAreaStyle.color || THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
        fontFamily: textAreaStyle.fontFamily || THEME_CONSTANTS.FONTS.PRIMARY,
        textAlign: textAreaStyle.textAlign || 'center',
        fontStyle: textAreaStyle.fontStyle,
        textShadow: textAreaStyle.textShadow,
        textIndent: '0',
        ...animationStyle,
      }}>
        {textParts.map((part) => {
          if (part.type === 'highlight' && part.highlightType) {
            // 커스텀 하이라이트 스타일이 있으면 사용, 없으면 기본 스타일 사용
            const highlightStyle = Object.keys(customHighlightStyle).length > 0 
              ? customHighlightStyle 
              : getHighlightStyle(part.highlightType);
            
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