import React from 'react';
import { TemplateStyle, ThemePreset } from '../src/types/VideoProps';
import { ThemeSelector } from './ThemeSelector';
import { AdvancedCustomization } from './AdvancedCustomization';
import { ThemeExporter } from './ThemeExporter';

interface CustomizationPanelProps {
  style: Partial<TemplateStyle>;
  onStyleChange: (newStyle: Partial<TemplateStyle>) => void;
  onReset: () => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  style,
  onStyleChange,
  onReset,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onStyleChange({ ...style, [name]: value });
  };

  const handleThemeChange = (themePreset: ThemePreset, themeStyle: TemplateStyle) => {
    onStyleChange(themeStyle);
  };

  return (
    <div className="customization-panel">
      <h3>🎨 디자인 커스터마이징</h3>
      
      {/* 테마 선택기 */}
      <ThemeSelector
        currentTheme={style.themePreset || 'original'}
        onThemeChange={handleThemeChange}
      />

      {/* 기존 커스터마이징 옵션들 */}
      <div className="manual-customization">
        <h4 className="section-title">⚙️ 세부 설정</h4>
        
        <div className="form-group">
          <label>배경색:</label>
          <input
            type="color"
            name="backgroundColor"
            value={style.backgroundColor || '#ffffff'}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>헤더 색상:</label>
          <input
            type="color"
            name="headerColor"
            value={style.headerColor || '#a5d8f3'}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>텍스트 색상:</label>
          <input
            type="color"
            name="textColor"
            value={style.textColor || '#1a1a1a'}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>제목 색상:</label>
          <input
            type="color"
            name="titleColor"
            value={style.titleColor || style.textColor || '#1a1a1a'}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>메타 색상:</label>
          <input
            type="color"
            name="metaColor"
            value={style.metaColor || '#757575'}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>폰트:</label>
          <input
            type="text"
            name="fontFamily"
            value={style.fontFamily || 'Pretendard, sans-serif'}
            onChange={handleChange}
            placeholder="Pretendard, sans-serif"
          />
        </div>
        
        <div className="form-group">
          <label>레이아웃:</label>
          <select name="layout" value={style.layout || 'text-middle'} onChange={handleChange}>
            <option value="text-top">상단</option>
            <option value="text-middle">중앙</option>
            <option value="text-bottom">하단</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>텍스트 정렬:</label>
          <select name="textAlign" value={style.textAlign || 'left'} onChange={handleChange}>
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
            <option value="justify">양쪽 정렬</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>행간:</label>
          <input
            type="text"
            name="lineHeight"
            value={style.lineHeight || '1.4'}
            onChange={handleChange}
            placeholder="1.4"
          />
        </div>
        
        <div className="form-group">
          <label>글자 간격:</label>
          <input
            type="text"
            name="letterSpacing"
            value={style.letterSpacing || 'normal'}
            onChange={handleChange}
            placeholder="normal"
          />
        </div>
        
        <div className="form-group">
          <label>텍스트 들여쓰기:</label>
          <input
            type="text"
            name="textIndent"
            value={style.textIndent || '0'}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
      </div>

      {/* 고급 커스터마이징 */}
      <AdvancedCustomization
        style={style}
        onStyleChange={onStyleChange}
      />

      {/* 테마 내보내기/가져오기 */}
      <ThemeExporter
        currentStyle={style}
        onStyleImport={onStyleChange}
      />

      <button onClick={onReset} className="reset-button">🔄 초기화</button>
    </div>
  );
};