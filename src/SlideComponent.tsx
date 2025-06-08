import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Img,
  interpolate,
  spring,
} from 'remotion';
import { MediaItem } from './inputData';
import { ScriptText } from './ScriptText';

interface SlideComponentProps {
  mediaItem: MediaItem;
  title: string;
  slideIndex: number;
  totalSlides: number;
}

export const SlideComponent: React.FC<SlideComponentProps> = ({ 
  mediaItem, 
  title, 
  slideIndex,
  totalSlides 
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Spring animation for image entrance
  const imageScale = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });
  
  const imageTranslateY = interpolate(
    frame,
    [0, 30],
    [60, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={backButtonStyle}>&lt;</span>
        <h1 style={headerTitleStyle}>썰풀기</h1>
        <div style={profileIconStyle}>P</div>
      </div>

      {/* Post Area */}
      <div style={postAreaStyle}>
        {/* Post Header */}
        <div style={postHeaderStyle}>
          <h2 style={postTitleStyle}>{title}</h2>
          <div style={postMetaStyle}>
            <span>익명</span>
            <span style={{ margin: '0 24px' }}>|</span>
            <span>14:25</span>
            <span style={{ marginLeft: 'auto' }}>조회수 | 3,463,126</span>
          </div>
        </div>

        {/* Post Body */}
        <div style={postBodyStyle}>
          {/* Dynamic Script Text - Positioned above image */}
                     <div style={{ marginBottom: '40px', position: 'relative', zIndex: 10 }}>
             <ScriptText
               scriptUrl={mediaItem.script}
               style={{}}
               frameInSlide={frame}
               slideDuration={durationInFrames}
               fps={fps}
             />
           </div>
          
          {/* Current Image */}
          <div
            style={{
              ...imageContainerStyle,
              transform: `translateY(${imageTranslateY}px) scale(${imageScale})`,
            }}
          >
            <Img
              src={mediaItem.image}
              style={postImageStyle}
            />
          </div>
        </div>
      </div>

      {/* Audio */}
      <Audio src={mediaItem.voice} />
    </div>
  );
};

// Styles (same as before)
const containerStyle: React.CSSProperties = {
  width: '1080px',
  height: '1920px',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '72px',
  overflow: 'hidden',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Malgun Gothic", "맑은 고딕", sans-serif',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#a5d8f3',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '36px 54px',
  color: '#333',
  flexShrink: 0,
};

const backButtonStyle: React.CSSProperties = {
  fontSize: '72px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const headerTitleStyle: React.CSSProperties = {
  fontSize: '60px',
  fontWeight: '800',
  margin: 0,
};

const profileIconStyle: React.CSSProperties = {
  width: '108px',
  height: '108px',
  borderRadius: '50%',
  backgroundColor: '#3498db',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '48px',
  fontWeight: 'bold',
};

const postAreaStyle: React.CSSProperties = {
  padding: '0 60px 60px 60px',
  flex: 1,
};

const postHeaderStyle: React.CSSProperties = {
  padding: '54px 0',
  borderBottom: '3px solid #f0f0f0',
};

const postTitleStyle: React.CSSProperties = {
  fontSize: '60px',
  fontWeight: 'bold',
  margin: '0 0 30px 0',
};

const postMetaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '39px',
  color: '#888',
};

const postBodyStyle: React.CSSProperties = {
  paddingTop: '60px',
  textAlign: 'center',
};

const imageContainerStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: '36px',
  overflow: 'hidden',
  margin: '0 auto',
};

const postImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}; 