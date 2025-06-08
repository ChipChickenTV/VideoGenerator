import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, useCurrentFrame, interpolate } from 'remotion';

interface ScriptTextProps {
  scriptUrl: string;
  style?: React.CSSProperties;
  frameInSlide: number;
  slideDuration: number;
  fps: number;
}

export const ScriptText: React.FC<ScriptTextProps> = ({ 
  scriptUrl, 
  style, 
  frameInSlide, 
  slideDuration,
  fps 
}) => {
  const [fullText, setFullText] = useState<string>('');
  const [wordGroups, setWordGroups] = useState<string[]>([]);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    fetch(scriptUrl)
      .then((response) => response.text())
      .then((scriptText) => {
        setFullText(scriptText);
        
        // Split text into groups of 3 words
        const words = scriptText.trim().split(/\s+/);
        const groups: string[] = [];
        
        for (let i = 0; i < words.length; i += 3) {
          const group = words.slice(i, i + 3).join(' ');
          groups.push(group);
        }
        
        setWordGroups(groups);
        continueRender(handle);
      })
      .catch((error) => {
        console.error('Error fetching script:', error);
        setFullText('스크립트를 불러올 수 없습니다.');
        setWordGroups(['스크립트를 불러올 수 없습니다.']);
        continueRender(handle);
      });
  }, [scriptUrl, handle]);

  // Calculate which word group to show based on time
  const totalGroups = wordGroups.length;
  const framesPerGroup = totalGroups > 0 ? slideDuration / totalGroups : slideDuration;
  const currentGroupIndex = Math.floor(frameInSlide / framesPerGroup);
  const safeGroupIndex = Math.min(currentGroupIndex, totalGroups - 1);
  
  // Animation for text change
  const frameInGroup = frameInSlide % framesPerGroup;
  const textOpacity = interpolate(
    frameInGroup,
    [0, 5, framesPerGroup - 5, framesPerGroup],
    [0, 1, 1, 0.8],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const textScale = interpolate(
    frameInGroup,
    [0, 10],
    [0.9, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const currentText = wordGroups[safeGroupIndex] || '';

  return (
    <div style={{ 
      ...style, 
      opacity: textOpacity,
      transform: `scale(${textScale})`,
      transition: 'all 0.2s ease-out',
      textAlign: 'center',
      padding: '10px 20px',
      margin: '10px auto',
      maxWidth: '90%',
      color: '#333',
      fontSize: '48px',
      fontWeight: '600',
      lineHeight: '1.3',
    }}>
      {currentText}
    </div>
  );
}; 