import React from 'react';
import { TemplateStyle, CSSTextAlign, isValidCSSTextAlign } from '@/types/VideoProps';

/**
 * 통합 스타일 유틸리티 - 모든 스타일 관련 함수들을 제공
 */

// 타입 안전한 textAlign 처리 함수
const getTypeSafeTextAlign = (value: string | undefined, defaultValue: CSSTextAlign): CSSTextAlign => {
  if (isValidCSSTextAlign(value)) {
    return value;
  }
  return defaultValue;
};

// ===== 배경 관련 함수들 =====

export const generateBackground = (style?: TemplateStyle): string => {
  if (!style) return '#ffffff';
  return style.backgroundColor || '#ffffff';
};

export const generateHeaderBackground = (style?: TemplateStyle): string => {
  if (!style) return '#a5d8f3';
  return style.headerColor || '#a5d8f3';
};

// ===== 시각 효과 관련 함수들 =====

export const generateTextShadow = (effect?: TemplateStyle['textEffect']): string => {
  if (!effect?.shadow?.enabled) return 'none';
  
  const { x, y, blur, color } = effect.shadow;
  return `${x}px ${y}px ${blur}px ${color}`;
};

export const generateTextGlow = (effect?: TemplateStyle['textEffect']): string => {
  if (!effect?.glow?.enabled) return 'none';
  
  const { color, size } = effect.glow;
  return `0 0 ${size}px ${color}`;
};

export const generateBoxShadow = (shadow?: { enabled?: boolean; x?: number; y?: number; blur?: number; color?: string }): string => {
  if (!shadow?.enabled) return 'none';
  
  const { x = 0, y = 4, blur = 8, color = 'rgba(0,0,0,0.1)' } = shadow;
  return `${x}px ${y}px ${blur}px ${color}`;
};

export const generateBorder = (border?: TemplateStyle['border']): string => {
  if (!border?.enabled) return 'none';
  
  const { width, style, color } = border;
  return `${width} ${style} ${color}`;
};

export const generateAnimation = (): string => {
  return 'none';
};

// ===== 레거시 호환성 함수들 =====

export const generateHighlightStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style?.highlight) return {};
  
  const { backgroundColor, textColor, padding, borderRadius } = style.highlight;
  
  return {
    backgroundColor: backgroundColor || '#ffd700',
    color: textColor || '#000000',
    padding: padding || '0.1em 0.3em',
    borderRadius: borderRadius || '4px',
  };
};

export const generateDecorationText = (style?: TemplateStyle, position?: 'before' | 'after'): string => {
  return '';
};

// ===== 컴포넌트 스타일 함수들 =====

export const generateContainerStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    background: generateBackground(style),
    color: style.textColor || '#1a1a1a',
    fontFamily: style.fontFamily?.text || 'Pretendard, sans-serif',
    fontSize: style.fontSize?.text || '38px',
    fontWeight: style.fontWeight?.text || 600,
    fontStyle: style.fontStyle?.text || 'normal',
    lineHeight: style.lineHeight || '1.4',
    letterSpacing: style.letterSpacing || '-0.01em',
    textAlign: getTypeSafeTextAlign(style.textAlign?.text, 'center'),
    border: generateBorder(style.border),
    borderRadius: style.border?.radius || '48px',
    boxShadow: generateBoxShadow(style.boxShadow),
    textShadow: [
      generateTextShadow(style.textEffect),
      generateTextGlow(style.textEffect)
    ].filter(s => s !== 'none').join(', ') || 'none',
  };
};

export const generateHeaderStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    background: generateHeaderBackground(style),
    color: style.headerTextColor || '#333333',
    fontFamily: style.fontFamily?.header || 'Pretendard, sans-serif',
    fontSize: style.fontSize?.header || '54px',
    fontWeight: style.fontWeight?.header || 700,
    fontStyle: style.fontStyle?.header || 'normal',
    textAlign: getTypeSafeTextAlign(style.textAlign?.header, 'center'),
    textShadow: [
      generateTextShadow(style.headerEffect),
      generateTextGlow(style.headerEffect)
    ].filter(s => s !== 'none').join(', ') || 'none',
    boxShadow: generateBoxShadow(style.headerEffect?.shadow),
  };
};

export const generateTitleStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    color: style.titleColor || style.textColor || '#1a1a1a',
    fontSize: style.fontSize?.title || '42px',
    fontWeight: style.fontWeight?.title || 700,
    fontStyle: style.fontStyle?.title || 'normal',
    fontFamily: style.fontFamily?.title || 'Pretendard, sans-serif',
    textAlign: getTypeSafeTextAlign(style.textAlign?.title, 'left'),
    textShadow: [
      generateTextShadow(style.titleEffect),
      generateTextGlow(style.titleEffect)
    ].filter(s => s !== 'none').join(', ') || 'none',
  };
};

export const generateTextAreaStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    backgroundColor: 'transparent',
    padding: '60px 40px',
    borderRadius: '0px',
    border: 'none',
    color: style.textColor || '#1a1a1a',
    fontSize: style.fontSize?.text || '38px',
    fontWeight: style.fontWeight?.text || 600,
    fontStyle: style.fontStyle?.text || 'normal',
    fontFamily: style.fontFamily?.text || 'Pretendard, sans-serif',
    lineHeight: style.lineHeight || '1.4',
    letterSpacing: style.letterSpacing || '-0.01em',
    textAlign: getTypeSafeTextAlign(style.textAlign?.text, 'center'),
    textShadow: [
      generateTextShadow(style.textEffect),
      generateTextGlow(style.textEffect)
    ].filter(s => s !== 'none').join(', ') || 'none',
  };
};

export const generateMetaStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    color: style.metaColor || '#888888',
    fontSize: style.fontSize?.meta || '28px',
    fontWeight: style.fontWeight?.meta || 400,
    fontFamily: style.fontFamily?.meta || 'Pretendard, sans-serif',
  };
};

export const generatePostHeaderStyle = (style?: TemplateStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    borderBottom: '4px solid #e0e0e0',
    paddingBottom: '40px',
    marginBottom: '60px',
  };
};