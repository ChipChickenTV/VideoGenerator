import React from 'react';
import { ThemePreset, TemplateStyle } from '../src/types/VideoProps';
import { THEME_PRESETS, THEME_INFO } from '../src/config/themes';

interface ThemeSelectorProps {
  currentTheme: ThemePreset;
  onThemeChange: (themePreset: ThemePreset, themeStyle: TemplateStyle) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const handleThemeSelect = (themePreset: ThemePreset) => {
    const themeStyle = THEME_PRESETS[themePreset];
    onThemeChange(themePreset, themeStyle);
  };

  const getThemePreviewStyle = (themePreset: ThemePreset): React.CSSProperties => {
    const theme = THEME_PRESETS[themePreset];
    
    // 그라디언트 배경 생성
    let background = theme.backgroundColor || '#ffffff';
    if (theme.backgroundGradient) {
      const { type, direction, position, colors } = theme.backgroundGradient;
      const colorStops = colors.map(c => `${c.color} ${c.stop}`).join(', ');
      
      if (type === 'linear') {
        background = `linear-gradient(${direction}, ${colorStops})`;
      } else {
        background = `radial-gradient(circle at ${position}, ${colorStops})`;
      }
    }

    return {
      background,
      color: theme.textColor || '#000000',
      fontFamily: theme.fontFamily || 'Pretendard, sans-serif',
      fontSize: '10px',
      border: theme.border?.enabled ? 
        `${theme.border.width} ${theme.border.style} ${theme.border.color}` : 
        '1px solid #e0e0e0',
      borderRadius: theme.border?.radius || '8px',
      boxShadow: theme.boxShadow?.enabled ? 
        `${theme.boxShadow.x}px ${theme.boxShadow.y}px ${theme.boxShadow.blur}px ${theme.boxShadow.spread}px ${theme.boxShadow.color}` : 
        '0 2px 4px rgba(0,0,0,0.1)',
    };
  };

  const getHeaderStyle = (themePreset: ThemePreset): React.CSSProperties => {
    const theme = THEME_PRESETS[themePreset];
    
    let headerBackground = theme.headerColor || '#f0f0f0';
    if (theme.headerGradient) {
      const { type, direction, position, colors } = theme.headerGradient;
      const colorStops = colors.map(c => `${c.color} ${c.stop}`).join(', ');
      
      if (type === 'linear') {
        headerBackground = `linear-gradient(${direction}, ${colorStops})`;
      } else {
        headerBackground = `radial-gradient(circle at ${position}, ${colorStops})`;
      }
    }

    return {
      background: headerBackground,
      borderBottom: theme.headerStyle?.borderBottom?.enabled ? 
        `${theme.headerStyle.borderBottom.width} ${theme.headerStyle.borderBottom.style} ${theme.headerStyle.borderBottom.color}` : 
        'none',
    };
  };

  const getTextShadow = (effect?: TemplateStyle['textEffect']): string => {
    if (!effect?.shadow?.enabled) return 'none';
    const { x, y, blur, color } = effect.shadow;
    return `${x}px ${y}px ${blur}px ${color}`;
  };

  return (
    <div className="theme-selector">
      <h4 className="theme-selector-title">🎨 테마 선택</h4>
      <div className="theme-grid">
        {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((themePreset) => {
          const themeInfo = THEME_INFO[themePreset];
          const isActive = currentTheme === themePreset;
          
          return (
            <div
              key={themePreset}
              className={`theme-card ${isActive ? 'active' : ''}`}
              onClick={() => handleThemeSelect(themePreset)}
            >
              <div 
                className="theme-preview"
                style={getThemePreviewStyle(themePreset)}
              >
                <div 
                  className="theme-preview-header"
                  style={getHeaderStyle(themePreset)}
                >
                  <span className="theme-preview-title">
                    {THEME_PRESETS[themePreset].decorations?.[0]?.before || ''}
                    제목
                    {THEME_PRESETS[themePreset].decorations?.[0]?.after || ''}
                  </span>
                </div>
                <div className="theme-preview-content">
                  <div 
                    className="theme-preview-text"
                    style={{ 
                      textShadow: getTextShadow(THEME_PRESETS[themePreset].textEffect),
                      fontWeight: THEME_PRESETS[themePreset].fontWeight?.text || 400,
                      fontStyle: THEME_PRESETS[themePreset].fontStyle?.text || 'normal',
                    }}
                  >
                    샘플 텍스트
                  </div>
                  <div className="theme-preview-highlight">
                    <span 
                      style={{
                        backgroundColor: THEME_PRESETS[themePreset].highlight?.backgroundColor || '#ffd700',
                        color: THEME_PRESETS[themePreset].highlight?.textColor || '#000',
                        padding: THEME_PRESETS[themePreset].highlight?.padding || '2px 4px',
                        borderRadius: THEME_PRESETS[themePreset].highlight?.borderRadius || '2px',
                        border: THEME_PRESETS[themePreset].highlight?.border || 'none',
                        boxShadow: THEME_PRESETS[themePreset].highlight?.boxShadow || 'none',
                        fontSize: '8px',
                      }}
                    >
                      하이라이트
                    </span>
                  </div>
                </div>
              </div>
              <div className="theme-info">
                <div className="theme-name">
                  {themeInfo.emoji} {themeInfo.name}
                </div>
                <div className="theme-description">
                  {themeInfo.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 