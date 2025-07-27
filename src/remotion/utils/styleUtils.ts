import { TemplateStyle } from '@/types/VideoProps';

// 그라디언트 배경 생성
export const generateBackground = (style?: TemplateStyle): string => {
  if (!style) return '#ffffff'; // THEME_CONSTANTS.COLORS.PHONE_BACKGROUND
  
  if (style.backgroundGradient) {
    const { type, direction, position, colors } = style.backgroundGradient;
    const colorStops = colors.map(c => `${c.color} ${c.stop}`).join(', ');
    
    if (type === 'linear') {
      return `linear-gradient(${direction}, ${colorStops})`;
    } else {
      return `radial-gradient(circle at ${position}, ${colorStops})`;
    }
  }
  
  return style.backgroundColor || '#ffffff'; // THEME_CONSTANTS.COLORS.PHONE_BACKGROUND
};

// 헤더 배경 생성
export const generateHeaderBackground = (style?: TemplateStyle): string => {
  if (!style) return '#a5d8f3'; // THEME_CONSTANTS.COLORS.HEADER_BACKGROUND
  
  if (style.headerGradient) {
    const { type, direction, position, colors } = style.headerGradient;
    const colorStops = colors.map(c => `${c.color} ${c.stop}`).join(', ');
    
    if (type === 'linear') {
      return `linear-gradient(${direction}, ${colorStops})`;
    } else {
      return `radial-gradient(circle at ${position}, ${colorStops})`;
    }
  }
  
  return style.headerColor || '#a5d8f3'; // THEME_CONSTANTS.COLORS.HEADER_BACKGROUND
};

// 텍스트 시아도우 생성
export const generateTextShadow = (effect?: TemplateStyle['textEffect']): string => {
  if (!effect?.shadow?.enabled) return 'none';
  
  const { x, y, blur, color } = effect.shadow;
  return `${x}px ${y}px ${blur}px ${color}`;
};

// 글로우 효과 생성 (text-shadow 사용)
export const generateTextGlow = (effect?: TemplateStyle['textEffect']): string => {
  if (!effect?.glow?.enabled) return 'none';
  
  const { color, size } = effect.glow;
  return `0 0 ${size}px ${color}`;
};

// 박스 시아도우 생성
export const generateBoxShadow = (shadow?: TemplateStyle['boxShadow']): string => {
  if (!shadow?.enabled) return 'none';
  
  const { x, y, blur, spread, color, inset } = shadow;
  const insetStr = inset ? 'inset ' : '';
  return `${insetStr}${x}px ${y}px ${blur}px ${spread}px ${color}`;
};

// 테두리 생성
export const generateBorder = (border?: TemplateStyle['border']): string => {
  if (!border?.enabled) return 'none';
  
  const { width, style, color } = border;
  return `${width} ${style} ${color}`;
};

// 애니메이션 생성
export const generateAnimation = (animations?: TemplateStyle['animations']): string => {
  const activeAnimations: string[] = [];
  
  if (animations?.bounce?.enabled) {
    activeAnimations.push(`bounce ${animations.bounce.duration} ${animations.bounce.timing}`);
  }
  
  if (animations?.flicker?.enabled) {
    activeAnimations.push(`flicker ${animations.flicker.duration} ${animations.flicker.timing}`);
  }
  
  if (animations?.pulse?.enabled) {
    activeAnimations.push(`pulse ${animations.pulse.duration} ${animations.pulse.timing}`);
  }
  
  return activeAnimations.join(', ') || 'none';
};

// 완전한 컨테이너 스타일 생성
export const generateContainerStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    background: generateBackground(style),
    color: style.textColor || '#1a1a1a',
    fontFamily: style.fontFamily || 'Pretendard, sans-serif',
    fontSize: style.fontSize?.text || '38px', // THEME_CONSTANTS 기본값
    fontWeight: style.fontWeight?.text || 600,
    fontStyle: style.fontStyle?.text || 'normal',
    lineHeight: style.lineHeight || '1.4',
    letterSpacing: style.letterSpacing || '-0.01em', // THEME_CONSTANTS 기본값
    textIndent: style.textIndent || '0',
    textAlign: style.textAlign as any || 'center',
    border: generateBorder(style.border),
    borderRadius: style.border?.radius || '48px', // THEME_CONSTANTS 기본값
    boxShadow: generateBoxShadow(style.boxShadow),
    animation: generateAnimation(style.animations),
    textShadow: [
      generateTextShadow(style.textEffect),
      generateTextGlow(style.textEffect)
    ].filter(s => s !== 'none').join(', ') || 'none',
  };
};

// 헤더 스타일 생성
export const generateHeaderStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  const headerStyle = style.headerStyle || {};
  
  return {
    background: generateHeaderBackground(style),
    color: style.textColor || '#333', // THEME_CONSTANTS.COLORS.TEXT_SECONDARY
    fontFamily: style.fontFamily || 'Pretendard, sans-serif',
    fontSize: style.fontSize?.title || '48px', // THEME_CONSTANTS.TYPOGRAPHY.HEADER_TITLE_SIZE
    fontWeight: style.fontWeight?.title || 700,
    fontStyle: style.fontStyle?.title || 'normal',
    textAlign: headerStyle.textAlign as any || 'center',
    borderBottom: headerStyle.borderBottom?.enabled ? 
      `${headerStyle.borderBottom.width} ${headerStyle.borderBottom.style} ${headerStyle.borderBottom.color}` : 
      'none',
    textShadow: [
      generateTextShadow(style.titleEffect),
      generateTextGlow(style.titleEffect)
    ].filter(s => s !== 'none').join(', ') || 'none',
    animation: generateAnimation(style.animations),
  };
};

// 텍스트 영역 스타일 생성
export const generateTextAreaStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  const textAreaStyle = style.textAreaStyle || {};
  
  return {
    backgroundColor: textAreaStyle.backgroundColor || 'transparent',
    padding: textAreaStyle.padding || '60px 40px', // THEME_CONSTANTS 기본값
    borderRadius: textAreaStyle.borderRadius || '0px',
    border: textAreaStyle.border || 'none',
    color: style.textColor || '#1a1a1a',
    fontSize: style.fontSize?.text || '38px', // THEME_CONSTANTS 기본값
    fontWeight: style.fontWeight?.text || 600,
    fontStyle: style.fontStyle?.text || 'normal',
    lineHeight: style.lineHeight || '1.4',
    letterSpacing: style.letterSpacing || '-0.01em', // THEME_CONSTANTS 기본값
    textAlign: style.textAlign as any || 'center',
    textShadow: [
      generateTextShadow(style.textEffect),
      generateTextGlow(style.textEffect)
    ].filter(s => s !== 'none').join(', ') || 'none',
  };
};

// 포스트 헤더 스타일 생성
export const generatePostHeaderStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  const postHeaderStyle = style.postHeaderStyle || {};
  
  return {
    borderBottom: postHeaderStyle.borderBottom?.enabled ? 
      `${postHeaderStyle.borderBottom.width} ${postHeaderStyle.borderBottom.style} ${postHeaderStyle.borderBottom.color}` : 
      '4px solid #e0e0e0', // THEME_CONSTANTS 기본값
    paddingBottom: '40px', // THEME_CONSTANTS 기준으로 증가
    marginBottom: '60px',  // THEME_CONSTANTS 기준으로 증가
  };
};

// 제목 스타일 생성
export const generateTitleStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    color: style.titleColor || style.textColor || '#1a1a1a',
    fontSize: style.fontSize?.title || '42px', // THEME_CONSTANTS.TYPOGRAPHY.POST_TITLE_SIZE
    fontWeight: style.fontWeight?.title || 700,
    fontStyle: style.fontStyle?.title || 'normal',
    textAlign: style.textAlign as any || 'left',
    textShadow: [
      generateTextShadow(style.titleEffect),
      generateTextGlow(style.titleEffect)
    ].filter(s => s !== 'none').join(', ') || 'none',
  };
};

// 메타 정보 스타일 생성
export const generateMetaStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    color: style.metaColor || '#888', // THEME_CONSTANTS.COLORS.TEXT_META
    fontSize: style.fontSize?.meta || '28px', // THEME_CONSTANTS.TYPOGRAPHY.META_TEXT_SIZE
    fontWeight: style.fontWeight?.meta || 400,
  };
};

// 하이라이트 스타일 생성
export const generateHighlightStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style?.highlight) return {};
  
  const { backgroundColor, textColor, padding, borderRadius, border, boxShadow } = style.highlight;
  
  return {
    backgroundColor: backgroundColor || '#ffd700',
    color: textColor || '#000000',
    padding: padding || '0.1em 0.3em',
    borderRadius: borderRadius || '4px',
    border: border || 'none',
    boxShadow: boxShadow || 'none',
  };
};

// 데코레이션 텍스트 생성
export const generateDecorationText = (style?: TemplateStyle, position: 'before' | 'after' = 'before'): string => {
  if (!style?.decorations) return '';
  
  const decoration = style.decorations.find(d => d.position === 'header');
  if (!decoration) return '';
  
  return position === 'before' ? (decoration.before || '') : (decoration.after || '');
}; 