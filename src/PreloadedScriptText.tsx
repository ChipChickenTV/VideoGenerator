import React from 'react';
import { interpolate } from 'remotion';

interface PreloadedScriptTextProps {
  scriptText: string;
  frameInSlide: number;
  slideDuration: number;
  fps: number;
}

export const PreloadedScriptText: React.FC<PreloadedScriptTextProps> = ({ 
  scriptText, 
  frameInSlide, 
  slideDuration,
  fps 
}) => {
  // Split text into groups of 3 words
  const words = scriptText.trim().split(/\s+/);
  const wordGroups: string[] = [];
  
  for (let i = 0; i < words.length; i += 3) {
    const group = words.slice(i, i + 3).join(' ');
    wordGroups.push(group);
  }

  // Calculate which word group to show based on time
  const totalGroups = wordGroups.length;
  const framesPerGroup = totalGroups > 0 ? slideDuration / totalGroups : slideDuration;
  const currentGroupIndex = Math.floor(frameInSlide / framesPerGroup);
  const safeGroupIndex = Math.min(currentGroupIndex, totalGroups - 1);
  
  // Smoother animation for text change
  const frameInGroup = frameInSlide % framesPerGroup;
  
  // Simplified opacity animation (no scaling to reduce jitter)
  const textOpacity = frameInGroup < 5 ? 
    interpolate(frameInGroup, [0, 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 
    1;
  
  // Remove scale animation to prevent jitter
  // const textScale = 1;

  const currentText = wordGroups[safeGroupIndex] || '';

  return (
    <div style={{ 
      opacity: textOpacity,
      // Removed transform and transition to prevent jitter
      textAlign: 'center',
      padding: '10px 20px',
      margin: '10px auto',
      maxWidth: '90%',
      color: '#1a1a1a',
      fontSize: '50px',
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '-0.01em',
      fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      // Add anti-aliasing for smoother text
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>
      {currentText}
    </div>
  );
}; 