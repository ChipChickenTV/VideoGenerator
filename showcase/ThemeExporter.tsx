import React, { useRef } from 'react';
import { TemplateStyle } from '../src/types/VideoProps';
import { THEME_INFO } from '../src/config/themes';

interface ThemeExporterProps {
  currentStyle: Partial<TemplateStyle>;
  onStyleImport: (style: TemplateStyle) => void;
}

export const ThemeExporter: React.FC<ThemeExporterProps> = ({
  currentStyle,
  onStyleImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    // 실제 시스템에서 바로 사용할 수 있는 VideoProps 구조로 export
    const videoPropsData = {
      templateStyle: currentStyle,
      title: `${currentStyle.themePreset === 'custom' ? '커스텀' : THEME_INFO[currentStyle.themePreset || 'original']?.name || '테마'} 테마 예시`,
      postMeta: {
        author: 'VideoWeb3 Showcase',
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        viewCount: '999',
      },
      media: [
        {
          script: {
            text: `이것은 ${currentStyle.themePreset === 'custom' ? '커스텀' : THEME_INFO[currentStyle.themePreset || 'original']?.name || '테마'} 테마를 적용한 <h>예시 영상</h>입니다.`,
            animation: {
              in: 'fadeIn',
              out: 'fadeOut',
              highlight: 'yellow-box',
            },
          },
          image: {
            url: 'image.png',
            animation: {
              effect: 'none',
              filter: 'none',
            },
          },
        },
      ],
    };

    const dataStr = JSON.stringify(videoPropsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `videoweb3-${currentStyle.themePreset || 'custom'}-${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileRead = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        let templateStyleData = null;
        let themeName = '테마';

        // 새로운 형태: { templateStyle: {...}, title: "...", media: [...] }
        if (jsonData.templateStyle && typeof jsonData.templateStyle === 'object') {
          templateStyleData = jsonData.templateStyle;
          themeName = jsonData.title || `${jsonData.templateStyle.themePreset || '커스텀'} 테마`;
        }
        // 기존 형태: { name: "...", style: {...} }
        else if (jsonData.style && typeof jsonData.style === 'object') {
          templateStyleData = jsonData.style;
          themeName = jsonData.name || 'Unnamed';
        }
        // 직접 templateStyle 객체: { themePreset: "...", fontFamily: "..." }
        else if (jsonData.themePreset || jsonData.fontFamily) {
          templateStyleData = jsonData;
          themeName = `${jsonData.themePreset || '커스텀'} 테마`;
        }

        if (templateStyleData) {
          onStyleImport(templateStyleData);
          alert(`"${themeName}"이(가) 성공적으로 가져와졌습니다!`);
        } else {
          alert('올바르지 않은 테마 파일 형식입니다.\n지원되는 형식:\n1. VideoProps (templateStyle 포함)\n2. 기존 테마 파일 (style 포함)\n3. 직접 TemplateStyle 객체');
        }
      } catch (error) {
        alert('테마 파일을 읽는 중 오류가 발생했습니다.');
        console.error('Theme import error:', error);
      }
    };
    
    reader.readAsText(file);
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  const generateThemePreview = () => {
    const previewData = {
      themePreset: currentStyle.themePreset || 'custom',
      fontFamily: currentStyle.fontFamily || 'Pretendard',
      backgroundColor: currentStyle.backgroundColor || '#ffffff',
      textColor: currentStyle.textColor || '#1a1a1a',
      hasGradient: !!currentStyle.backgroundGradient,
      hasTextEffects: !!(currentStyle.textEffect?.shadow?.enabled || currentStyle.textEffect?.glow?.enabled),
      hasAnimations: !!(currentStyle.animations?.bounce?.enabled || currentStyle.animations?.flicker?.enabled),
      hasBorder: !!currentStyle.border?.enabled,
      hasBoxShadow: !!currentStyle.boxShadow?.enabled,
    };

    return previewData;
  };

  const themePreview = generateThemePreview();

  return (
    <div className="theme-exporter">
      <h4 className="section-title">💾 테마 관리</h4>
      
      {/* 현재 테마 미리보기 */}
      <div className="theme-preview-card">
        <div className="theme-preview-header">
          <span className="theme-preview-name">
            {currentStyle.themePreset === 'custom' ? '🎨 커스텀 테마' : `${THEME_INFO[currentStyle.themePreset || 'original']?.emoji} ${THEME_INFO[currentStyle.themePreset || 'original']?.name}`}
          </span>
        </div>
        <div className="theme-preview-features">
          <div className="feature-badges">
            {themePreview.hasGradient && <span className="feature-badge">그라디언트</span>}
            {themePreview.hasTextEffects && <span className="feature-badge">텍스트 효과</span>}
            {themePreview.hasAnimations && <span className="feature-badge">애니메이션</span>}
            {themePreview.hasBorder && <span className="feature-badge">테두리</span>}
            {themePreview.hasBoxShadow && <span className="feature-badge">그림자</span>}
          </div>
          <div className="color-palette">
            <div 
              className="color-swatch" 
              style={{ backgroundColor: themePreview.backgroundColor }}
              title="배경색"
            ></div>
            <div 
              className="color-swatch" 
              style={{ backgroundColor: themePreview.textColor }}
              title="텍스트색"
            ></div>
            {currentStyle.headerColor && (
              <div 
                className="color-swatch" 
                style={{ backgroundColor: currentStyle.headerColor }}
                title="헤더색"
              ></div>
            )}
          </div>
        </div>
      </div>

      {/* 테마 관리 버튼들 */}
      <div className="theme-actions">
        <button onClick={handleExport} className="theme-action-btn export-btn">
          📁 내보내기
        </button>
        
        <button onClick={handleImportClick} className="theme-action-btn import-btn">
          📂 가져오기
        </button>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileRead}
      />

      {/* 사용법 안내 */}
      <div className="theme-exporter-help">
        <details>
          <summary>💡 사용법</summary>
          <div className="help-content">
            <p><strong>내보내기:</strong> 실제 시스템에서 바로 사용할 수 있는 VideoProps 형태의 JSON 파일로 저장합니다.</p>
            <p><strong>가져오기:</strong> 다양한 형태의 테마 파일을 불러옵니다 (VideoProps, 기존 테마 파일, TemplateStyle 객체).</p>
          </div>
        </details>
      </div>
    </div>
  );
}; 