import React, { useEffect, useState } from 'react';
import { AnimationInfo } from '../src/animations/types';
import { PlayerWrapper } from './PlayerWrapper';
import { CustomizationPanel } from './CustomizationPanel';
import { TemplateStyle, TemplateStyleSchema } from '../src/types/VideoProps';
import { THEME_PRESETS, THEME_INFO } from '../src/config/themes';

interface ShowcaseData {
  categories: {
    type: string;
    title: string;
    animations: AnimationInfo[];
  }[];
}

export const App: React.FC = () => {
  const [data, setData] = useState<ShowcaseData | null>(null);
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationInfo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // 기본 원본 테마로 초기화
  const [customStyle, setCustomStyle] = useState<TemplateStyle>(() => {
    const defaultTheme = THEME_PRESETS.original;
    return TemplateStyleSchema.parse(defaultTheme);
  });

  useEffect(() => {
    fetch('/animations.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Failed to load animations.json", err));
  }, []);

  if (!data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🎬</div>
        <div className="loading-text">애니메이션 데이터를 불러오는 중...</div>
      </div>
    );
  }

  const handleAnimationSelect = (animation: AnimationInfo) => {
    setSelectedAnimation(animation);
  };

  const handleStyleChange = (newStyleProperty: Partial<TemplateStyle>) => {
    setCustomStyle(prevStyle => {
      // 테마 프리셋이 변경되는 경우 완전히 새로운 테마로 교체
      if (newStyleProperty.themePreset && newStyleProperty.themePreset !== 'custom') {
        return TemplateStyleSchema.parse(newStyleProperty);
      }
      
      // 일반적인 스타일 변경의 경우 병합
      const mergedStyle = { ...prevStyle, ...newStyleProperty };
      
      // 테마가 변경될 때 themePreset을 custom으로 설정 (프리셋 테마가 아닌 경우)
      if (!newStyleProperty.themePreset && Object.keys(newStyleProperty).length > 0) {
        mergedStyle.themePreset = 'custom';
      }
      
      return mergedStyle;
    });
  };
  
  const handleReset = () => {
    // 기본 원본 테마로 리셋
    const defaultTheme = THEME_PRESETS.original;
    setCustomStyle(TemplateStyleSchema.parse(defaultTheme));
  }

  return (
    <div className="showcase-container">
      <header className="showcase-header">
        <h1>🎬 VideoWeb3 Animation Showcase</h1>
        <p className="subtitle">
          {customStyle.themePreset !== 'custom' && (
            <span className="current-theme">
              현재 테마: {THEME_INFO[customStyle.themePreset || 'original']?.emoji} {THEME_INFO[customStyle.themePreset || 'original']?.name}
            </span>
          )}
          <span className="divider"> | </span>
          애니메이션을 선택하여 실시간으로 확인하세요.
        </p>
      </header>

      <div className="showcase-body">
        <nav className="sidebar">
          <div className="filter-container">
            <button
              className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {data.categories.map(category => (
              <button
                key={category.type}
                className={`filter-btn ${activeCategory === category.type ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.type)}
              >
                {category.title.split(' ')[1].replace('애니메이션', '').replace('효과', '')}
              </button>
            ))}
          </div>

          {data.categories
            .filter(cat => activeCategory === 'all' || activeCategory === cat.type)
            .map(category => (
            <div key={category.type} className="category-group">
              <h2 className="category-title">{category.title}</h2>
              <ul className="animation-list">
                {category.animations.map(anim => (
                  <li
                    key={anim.name}
                    className={`animation-item ${selectedAnimation?.name === anim.name && selectedAnimation?.type === anim.type ? 'active' : ''}`}
                    onClick={() => handleAnimationSelect(anim)}
                  >
                    <span className="animation-name">{anim.name}</span>
                    <span className="animation-description">{anim.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="main-content">
          <main className="player-area">
            <PlayerWrapper animation={selectedAnimation} templateStyle={customStyle} />
          </main>

          <aside className="customization-sidebar">
            <CustomizationPanel
              style={customStyle}
              onStyleChange={handleStyleChange}
              onReset={handleReset}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};