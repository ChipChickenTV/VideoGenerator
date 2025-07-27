import React, { useState } from 'react';
import { TemplateStyle } from '../src/types/VideoProps';

interface AdvancedCustomizationProps {
  style: Partial<TemplateStyle>;
  onStyleChange: (newStyle: Partial<TemplateStyle>) => void;
}

export const AdvancedCustomization: React.FC<AdvancedCustomizationProps> = ({
  style,
  onStyleChange,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleInputChange = (path: string, value: any) => {
    const pathParts = path.split('.');
    const newStyle = { ...style };
    
    let current: any = newStyle;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;
    
    onStyleChange(newStyle);
  };

  const addGradientColor = () => {
    const currentColors = style.backgroundGradient?.colors || [
      { color: '#ffffff', stop: '0%' },
      { color: '#f0f0f0', stop: '100%' }
    ];
    
    const newColors = [
      ...currentColors,
      { color: '#cccccc', stop: '50%' }
    ];
    
    handleInputChange('backgroundGradient.colors', newColors);
  };

  const removeGradientColor = (index: number) => {
    const currentColors = style.backgroundGradient?.colors || [];
    if (currentColors.length > 2) {
      const newColors = currentColors.filter((_, i) => i !== index);
      handleInputChange('backgroundGradient.colors', newColors);
    }
  };

  const updateGradientColor = (index: number, field: 'color' | 'stop', value: string) => {
    const currentColors = style.backgroundGradient?.colors || [];
    const newColors = [...currentColors];
    newColors[index] = { ...newColors[index], [field]: value };
    handleInputChange('backgroundGradient.colors', newColors);
  };

  return (
    <div className="advanced-customization">
      <h4 className="section-title">🔧 고급 설정</h4>

      {/* 배경 그라디언트 */}
      <div className="advanced-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('gradient')}
        >
          <span>🎨 배경 그라디언트</span>
          <span className="toggle-icon">
            {expandedSections.has('gradient') ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSections.has('gradient') && (
          <div className="section-content">
            <div className="form-group">
              <label>그라디언트 활성화:</label>
              <input
                type="checkbox"
                checked={!!style.backgroundGradient}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange('backgroundGradient', {
                      type: 'linear',
                      direction: '135deg',
                      colors: [
                        { color: '#ffffff', stop: '0%' },
                        { color: '#f0f0f0', stop: '100%' }
                      ]
                    });
                  } else {
                    const newStyle = { ...style };
                    delete newStyle.backgroundGradient;
                    onStyleChange(newStyle);
                  }
                }}
              />
            </div>

            {style.backgroundGradient && (
              <>
                <div className="form-group">
                  <label>타입:</label>
                  <select
                    value={style.backgroundGradient.type || 'linear'}
                    onChange={(e) => handleInputChange('backgroundGradient.type', e.target.value)}
                  >
                    <option value="linear">선형</option>
                    <option value="radial">원형</option>
                  </select>
                </div>

                {style.backgroundGradient.type === 'linear' && (
                  <div className="form-group">
                    <label>방향:</label>
                    <input
                      type="text"
                      value={style.backgroundGradient.direction || '135deg'}
                      onChange={(e) => handleInputChange('backgroundGradient.direction', e.target.value)}
                      placeholder="135deg"
                    />
                  </div>
                )}

                {style.backgroundGradient.type === 'radial' && (
                  <div className="form-group">
                    <label>위치:</label>
                    <input
                      type="text"
                      value={style.backgroundGradient.position || 'center'}
                      onChange={(e) => handleInputChange('backgroundGradient.position', e.target.value)}
                      placeholder="center"
                    />
                  </div>
                )}

                <div className="gradient-colors">
                  <label>색상 정의:</label>
                  {(style.backgroundGradient.colors || []).map((color, index) => (
                    <div key={index} className="gradient-color-row">
                      <input
                        type="color"
                        value={color.color}
                        onChange={(e) => updateGradientColor(index, 'color', e.target.value)}
                      />
                      <input
                        type="text"
                        value={color.stop}
                        onChange={(e) => updateGradientColor(index, 'stop', e.target.value)}
                        placeholder="0%"
                        className="stop-input"
                      />
                      {(style.backgroundGradient?.colors || []).length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeGradientColor(index)}
                          className="remove-color-btn"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addGradientColor} className="add-color-btn">
                    + 색상 추가
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 텍스트 효과 */}
      <div className="advanced-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('textEffect')}
        >
          <span>✨ 텍스트 효과</span>
          <span className="toggle-icon">
            {expandedSections.has('textEffect') ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSections.has('textEffect') && (
          <div className="section-content">
            {/* 텍스트 그림자 */}
            <div className="sub-section">
              <h5>그림자</h5>
              <div className="form-group">
                <label>활성화:</label>
                <input
                  type="checkbox"
                  checked={style.textEffect?.shadow?.enabled || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('textEffect.shadow', {
                        enabled: true,
                        x: 2,
                        y: 2,
                        blur: 4,
                        color: 'rgba(0,0,0,0.3)'
                      });
                    } else {
                      handleInputChange('textEffect.shadow.enabled', false);
                    }
                  }}
                />
              </div>

              {style.textEffect?.shadow?.enabled && (
                <>
                  <div className="form-group">
                    <label>X 오프셋:</label>
                    <input
                      type="number"
                      value={style.textEffect.shadow.x || 2}
                      onChange={(e) => handleInputChange('textEffect.shadow.x', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Y 오프셋:</label>
                    <input
                      type="number"
                      value={style.textEffect.shadow.y || 2}
                      onChange={(e) => handleInputChange('textEffect.shadow.y', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>블러:</label>
                    <input
                      type="number"
                      value={style.textEffect.shadow.blur || 4}
                      onChange={(e) => handleInputChange('textEffect.shadow.blur', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>색상:</label>
                    <input
                      type="text"
                      value={style.textEffect.shadow.color || 'rgba(0,0,0,0.3)'}
                      onChange={(e) => handleInputChange('textEffect.shadow.color', e.target.value)}
                      placeholder="rgba(0,0,0,0.3)"
                    />
                  </div>
                </>
              )}
            </div>

            {/* 글로우 효과 */}
            <div className="sub-section">
              <h5>글로우</h5>
              <div className="form-group">
                <label>활성화:</label>
                <input
                  type="checkbox"
                  checked={style.textEffect?.glow?.enabled || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('textEffect.glow', {
                        enabled: true,
                        color: '#ff00ff',
                        size: 8
                      });
                    } else {
                      handleInputChange('textEffect.glow.enabled', false);
                    }
                  }}
                />
              </div>

              {style.textEffect?.glow?.enabled && (
                <>
                  <div className="form-group">
                    <label>색상:</label>
                    <input
                      type="color"
                      value={style.textEffect.glow.color || '#ff00ff'}
                      onChange={(e) => handleInputChange('textEffect.glow.color', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>크기:</label>
                    <input
                      type="number"
                      value={style.textEffect.glow.size || 8}
                      onChange={(e) => handleInputChange('textEffect.glow.size', parseInt(e.target.value))}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 테두리 */}
      <div className="advanced-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('border')}
        >
          <span>🔲 테두리</span>
          <span className="toggle-icon">
            {expandedSections.has('border') ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSections.has('border') && (
          <div className="section-content">
            <div className="form-group">
              <label>활성화:</label>
              <input
                type="checkbox"
                checked={style.border?.enabled || false}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange('border', {
                      enabled: true,
                      width: '2px',
                      style: 'solid',
                      color: '#000000',
                      radius: '0px'
                    });
                  } else {
                    handleInputChange('border.enabled', false);
                  }
                }}
              />
            </div>

            {style.border?.enabled && (
              <>
                <div className="form-group">
                  <label>두께:</label>
                  <input
                    type="text"
                    value={style.border.width || '2px'}
                    onChange={(e) => handleInputChange('border.width', e.target.value)}
                    placeholder="2px"
                  />
                </div>
                <div className="form-group">
                  <label>스타일:</label>
                  <select
                    value={style.border.style || 'solid'}
                    onChange={(e) => handleInputChange('border.style', e.target.value)}
                  >
                    <option value="solid">실선</option>
                    <option value="dashed">파선</option>
                    <option value="dotted">점선</option>
                    <option value="double">이중선</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>색상:</label>
                  <input
                    type="color"
                    value={style.border.color || '#000000'}
                    onChange={(e) => handleInputChange('border.color', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>모서리 반경:</label>
                  <input
                    type="text"
                    value={style.border.radius || '0px'}
                    onChange={(e) => handleInputChange('border.radius', e.target.value)}
                    placeholder="0px"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 박스 시아도우 */}
      <div className="advanced-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('shadow')}
        >
          <span>🎭 박스 시아도우</span>
          <span className="toggle-icon">
            {expandedSections.has('shadow') ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSections.has('shadow') && (
          <div className="section-content">
            <div className="form-group">
              <label>활성화:</label>
              <input
                type="checkbox"
                checked={style.boxShadow?.enabled || false}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange('boxShadow', {
                      enabled: true,
                      x: 0,
                      y: 20,
                      blur: 60,
                      spread: 0,
                      color: 'rgba(0,0,0,0.3)',
                      inset: false
                    });
                  } else {
                    handleInputChange('boxShadow.enabled', false);
                  }
                }}
              />
            </div>

            {style.boxShadow?.enabled && (
              <>
                <div className="form-group">
                  <label>X 오프셋:</label>
                  <input
                    type="number"
                    value={style.boxShadow.x || 0}
                    onChange={(e) => handleInputChange('boxShadow.x', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Y 오프셋:</label>
                  <input
                    type="number"
                    value={style.boxShadow.y || 20}
                    onChange={(e) => handleInputChange('boxShadow.y', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>블러:</label>
                  <input
                    type="number"
                    value={style.boxShadow.blur || 60}
                    onChange={(e) => handleInputChange('boxShadow.blur', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>확산:</label>
                  <input
                    type="number"
                    value={style.boxShadow.spread || 0}
                    onChange={(e) => handleInputChange('boxShadow.spread', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>색상:</label>
                  <input
                    type="text"
                    value={style.boxShadow.color || 'rgba(0,0,0,0.3)'}
                    onChange={(e) => handleInputChange('boxShadow.color', e.target.value)}
                    placeholder="rgba(0,0,0,0.3)"
                  />
                </div>
                <div className="form-group">
                  <label>내부 그림자:</label>
                  <input
                    type="checkbox"
                    checked={style.boxShadow.inset || false}
                    onChange={(e) => handleInputChange('boxShadow.inset', e.target.checked)}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 애니메이션 */}
      <div className="advanced-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('animations')}
        >
          <span>🎪 애니메이션</span>
          <span className="toggle-icon">
            {expandedSections.has('animations') ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSections.has('animations') && (
          <div className="section-content">
            {/* 바운스 애니메이션 */}
            <div className="sub-section">
              <h5>바운스</h5>
              <div className="form-group">
                <label>활성화:</label>
                <input
                  type="checkbox"
                  checked={style.animations?.bounce?.enabled || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('animations.bounce', {
                        enabled: true,
                        duration: '2s',
                        timing: 'infinite'
                      });
                    } else {
                      handleInputChange('animations.bounce.enabled', false);
                    }
                  }}
                />
              </div>

              {style.animations?.bounce?.enabled && (
                <>
                  <div className="form-group">
                    <label>지속시간:</label>
                    <input
                      type="text"
                      value={style.animations.bounce.duration || '2s'}
                      onChange={(e) => handleInputChange('animations.bounce.duration', e.target.value)}
                      placeholder="2s"
                    />
                  </div>
                  <div className="form-group">
                    <label>타이밍:</label>
                    <input
                      type="text"
                      value={style.animations.bounce.timing || 'infinite'}
                      onChange={(e) => handleInputChange('animations.bounce.timing', e.target.value)}
                      placeholder="infinite"
                    />
                  </div>
                </>
              )}
            </div>

            {/* 플리커 애니메이션 */}
            <div className="sub-section">
              <h5>플리커</h5>
              <div className="form-group">
                <label>활성화:</label>
                <input
                  type="checkbox"
                  checked={style.animations?.flicker?.enabled || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('animations.flicker', {
                        enabled: true,
                        duration: '3s',
                        timing: 'infinite alternate'
                      });
                    } else {
                      handleInputChange('animations.flicker.enabled', false);
                    }
                  }}
                />
              </div>

              {style.animations?.flicker?.enabled && (
                <>
                  <div className="form-group">
                    <label>지속시간:</label>
                    <input
                      type="text"
                      value={style.animations.flicker.duration || '3s'}
                      onChange={(e) => handleInputChange('animations.flicker.duration', e.target.value)}
                      placeholder="3s"
                    />
                  </div>
                  <div className="form-group">
                    <label>타이밍:</label>
                    <input
                      type="text"
                      value={style.animations.flicker.timing || 'infinite alternate'}
                      onChange={(e) => handleInputChange('animations.flicker.timing', e.target.value)}
                      placeholder="infinite alternate"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 