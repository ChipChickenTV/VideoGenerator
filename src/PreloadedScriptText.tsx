import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { Theme, ScriptAnimation } from './inputData';

interface PreloadedScriptTextProps {
  scriptText: string;
  animation?: ScriptAnimation;
  frameInSlide: number;
  slideDuration: number;
  fps: number;
  theme: Theme;
}

export const PreloadedScriptText: React.FC<PreloadedScriptTextProps> = ({
  scriptText,
  animation,
  frameInSlide,
  slideDuration,
  fps,
  theme
}) => {
  const words = scriptText.trim().split(/\s+/);
  const wordGroups: string[] = [];
  
  for (let i = 0; i < words.length; i += 3) {
    const group = words.slice(i, i + 3).join(' ');
    wordGroups.push(group);
  }

  const totalGroups = wordGroups.length;
  const framesPerGroup = totalGroups > 0 ? slideDuration / totalGroups : slideDuration;
  const currentGroupIndex = Math.floor(frameInSlide / framesPerGroup);
  const safeGroupIndex = Math.min(currentGroupIndex, totalGroups - 1);
  
  const frameInGroup = frameInSlide % framesPerGroup;
  const currentText = wordGroups[safeGroupIndex] || '';

  // --- Animation Logic ---
  const inType = animation?.in || 'fadeIn';
  const outType = animation?.out || 'fadeOut';
  
  const transitionFrames = 15;

  const opacity = interpolate(
    frameInGroup,
    [0, transitionFrames, framesPerGroup - transitionFrames, framesPerGroup],
    [0, 1, 1, 0]
  );

  let transform = '';
  let clipPath;

  switch(inType) {
    case 'slideUp':
      const slideY = interpolate(frameInGroup, [0, transitionFrames], [20, 0]);
      transform = `translateY(${slideY}px)`;
      break;
    case 'reveal': {
      const revealWidth = interpolate(frameInGroup, [0, transitionFrames * 2], [0, 100]);
      clipPath = `inset(0 ${100 - revealWidth}% 0 0)`;
      break;
    }
    case 'typing':
      // Logic is handled below, no style changes here
      break;
    case 'pop-in':
      const popScale = interpolate(frameInGroup, [0, transitionFrames], [0.8, 1]);
      transform = `scale(${popScale})`;
      break;
  }

  const dynamicTextStyle: React.CSSProperties = {
    opacity,
    transform,
    clipPath,
    textAlign: 'center',
    padding: '10px 20px',
    margin: '10px auto',
    maxWidth: '90%',
    color: theme.textColor || '#1a1a1a',
    fontSize: '50px',
    fontWeight: '600',
    lineHeight: '1.35',
    letterSpacing: '-0.01em',
    fontFamily: theme.fontFamily || '"Pretendard Variable", Pretendard, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  };

  // --- Highlight Logic ---
  const highlightType = animation?.highlight || 'none';

  const getHighlightStyle = (type?: string): React.CSSProperties => {
    const finalHighlightType = type || highlightType;
    switch (finalHighlightType) {
      case 'yellow-box':
        return {
          backgroundColor: 'rgba(255, 229, 0, 0.7)',
          padding: '0 5px',
          borderRadius: '5px',
        };
      case 'underline':
        return {
          textDecoration: 'underline',
          textDecorationColor: '#FFD700',
          textDecorationThickness: '0.2em',
        };
      case 'color-change':
        return {
          color: '#FFD700', // Example highlight color
        };
      case 'bounce': {
        const bounceProgress = spring({
          frame: frameInSlide,
          fps,
          config: { damping: 10, stiffness: 100 }
        });
        const bounceY = Math.sin(bounceProgress * Math.PI) * -15;
        return {
          display: 'inline-block',
          transform: `translateY(${bounceY}px)`
        };
      }
      case 'glow': {
        const glowProgress = Math.sin((frameInSlide / fps) * Math.PI * 2); // Glow cycles every 1 second
        const glowOpacity = interpolate(glowProgress, [-1, 1], [0.5, 1]);
        return {
          textShadow: `0 0 8px rgba(255, 229, 0, ${glowOpacity}), 0 0 16px rgba(255, 229, 0, ${glowOpacity})`
        };
      }
      default:
        return {};
    }
  };

  const parseAndRenderText = (text: string) => {
    const regex = /<h(?: type="([^"]+)")?>(.*?)<\/h>/g;
    const elements = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Push text before the match
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
      
      const type = match[1];
      const content = match[2];
      
      // Push the highlighted span
      elements.push(
        <span key={lastIndex} style={getHighlightStyle(type)}>
          {content}
        </span>
      );
      
      lastIndex = regex.lastIndex;
    }

    // Push remaining text after the last match
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements;
  };

  // For typing effect, we'd need to render differently
  if (inType === 'typing') {
    const charsToShow = Math.floor(interpolate(frameInGroup, [0, framesPerGroup * 0.8], [0, currentText.length]));
    const visibleText = currentText.substring(0, charsToShow);
    return (
      <div style={dynamicTextStyle}>
        {parseAndRenderText(visibleText)}
      </div>
    );
  }

  if (inType === 'word-by-word-fade') {
    const nodes = parseAndRenderText(currentText);
    let wordCount = 0;

    const animatedNodes = nodes.map((node, nodeIndex) => {
        if (typeof node === 'string') {
            const wordsInNode = node.split(/\s+/).filter(Boolean);
            return wordsInNode.map((word, wordIndex) => {
                const wordDelay = wordCount * 5;
                const wordOpacity = interpolate(
                    frameInGroup,
                    [wordDelay, wordDelay + 15],
                    [0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
                wordCount++;
                return (
                    <span key={`${nodeIndex}-${wordIndex}`} style={{ opacity: wordOpacity }}>
                        {word}{' '}
                    </span>
                );
            });
        }
        if (React.isValidElement<{style?: React.CSSProperties}>(node)) {
            const wordDelay = wordCount * 5;
            const wordOpacity = interpolate(
                frameInGroup,
                [wordDelay, wordDelay + 15],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            wordCount++;
            const existingStyle = node.props.style || {};
            return React.cloneElement(node, {
                key: nodeIndex,
                style: { ...existingStyle, opacity: wordOpacity }
            });
        }
        return node;
    }).flat();

    const { opacity, transform, ...restOfStyle } = dynamicTextStyle;
    // Apply base styles but override opacity and transform for the container
    // as individual words are animated.
    return <div style={{...restOfStyle, opacity: 1, transform: 'none'}}>{animatedNodes}</div>;
  }

  return (
    <div style={dynamicTextStyle}>
      {parseAndRenderText(currentText)}
    </div>
  );
};