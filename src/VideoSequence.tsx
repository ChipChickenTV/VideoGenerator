import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Audio,
  interpolate,
} from 'remotion';
import { MediaItem, Theme } from './inputData';
import { ImageSlide } from './ImageSlide';
import { useDataLoader } from './DataLoader';
import { PreloadedScriptText } from './PreloadedScriptText';
import FontLoader from './FontLoader';
import { VideoSequenceProps } from './VideoSequenceSchema';

export const VideoSequence: React.FC<any> = (props) => {
  // On Windows, props can be double-stringified. We need to parse it.
  const parsedProps: VideoSequenceProps = typeof props === 'string' ? JSON.parse(props) : props;
  
  const {
    title = "제목 없음",
    media = [],
    theme = {},
    audioDurations
  } = parsedProps;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Filter out media items that don't have a valid image URL
  const validMedia = media.filter(item => item.image && typeof item.image.url === 'string') as MediaItem[];

  // 데이터가 없으면 에러 상태 표시
  if (!validMedia || validMedia.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={backButtonStyle}>&lt;</span>
          <h1 style={headerTitleStyle}>썰풀기</h1>
          <div style={profileIconStyle}>P</div>
        </div>
        <div style={{
          ...postAreaStyle,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '48px',
          color: '#ff6b6b'
        }}>
          입력 데이터가 없습니다
        </div>
      </div>
    );
  }
  
  // Load all data upfront
  const { scripts, audioDurations: loadedDurations, isReady } = useDataLoader(validMedia);
  
  // Use loaded durations or fallback to provided ones
  const finalDurations = isReady ? loadedDurations : (audioDurations || validMedia.map(() => 3));
  
  // Calculate durations in frames for each slide based on audio length
  const slideDurations = finalDurations.map(duration => Math.ceil(duration * fps));
  
  // Calculate cumulative frame positions
  const cumulativeFrames = slideDurations.reduce((acc, duration, index) => {
    acc[index] = index === 0 ? 0 : acc[index - 1] + slideDurations[index - 1];
    return acc;
  }, [] as number[]);
  
  const transitionDuration = 30; // frames for transition overlap
  
  // Find current slide index for text display
  let currentSlideIndex = 0;
  for (let i = 0; i < cumulativeFrames.length; i++) {
    if (frame >= cumulativeFrames[i] && frame < cumulativeFrames[i] + slideDurations[i]) {
      currentSlideIndex = i;
      break;
    }
  }
  
  const frameInCurrentSlide = frame - cumulativeFrames[currentSlideIndex];
  const currentSlideDuration = slideDurations[currentSlideIndex] || (3 * fps);

  const dynamicContainerStyle: React.CSSProperties = {
    ...containerStyle,
    fontFamily: theme.fontFamily || containerStyle.fontFamily,
    backgroundColor: theme.backgroundColor || containerStyle.backgroundColor,
  };

  // Show loading state if data is not ready
  if (!isReady) {
    return (
      <div style={dynamicContainerStyle}>
        <div style={headerStyle}>
          <span style={backButtonStyle}>&lt;</span>
          <h1 style={headerTitleStyle}>썰풀기</h1>
          <div style={profileIconStyle}>P</div>
        </div>
        <div style={{
          ...postAreaStyle,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '48px',
          color: '#666'
        }}>
          데이터 로딩 중...
        </div>
      </div>
    );
  }

  return (
    <>
      <FontLoader />
      <div style={dynamicContainerStyle}>
        {/* Static Header and Post Info */}
      <div style={headerStyle}>
        <span style={backButtonStyle}>&lt;</span>
        <h1 style={headerTitleStyle}>썰풀기</h1>
        <div style={profileIconStyle}>P</div>
      </div>

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
          {/* Text - Always rendered to maintain layout */}
          <div style={{
            marginBottom: '40px',
            position: 'relative',
            zIndex: 10,
            minHeight: '88px' // Reserve space to prevent layout shift
          }}>
            <PreloadedScriptText
              scriptText={isReady ? scripts[currentSlideIndex] : ''}
              animation={validMedia[currentSlideIndex]?.script.animation}
              frameInSlide={frameInCurrentSlide}
              slideDuration={currentSlideDuration}
              fps={fps}
              theme={theme}
            />
          </div>
          
          {/* Images - Overlapping sequences for crossfade */}
          <div style={imageContainerStyle}>
            {validMedia.map((mediaItem, index) => {
              const startFrame = cumulativeFrames[index];
              const duration = slideDurations[index];
              const isLastSlide = index === validMedia.length - 1;
              
              // Extend duration for overlap except for the last slide
              const extendedDuration = isLastSlide ? duration : duration + transitionDuration;
              
              const transition = validMedia[index - 1]?.transition;
              let transitionStyle: React.CSSProperties = {};

              if (transition && frame >= startFrame && frame < startFrame + transition.duration) {
                switch (transition.effect) {
                  case 'slide-left': {
                    const slideProgress = interpolate(frame, [startFrame, startFrame + transition.duration], [100, 0]);
                    transitionStyle.transform = `translateX(${slideProgress}%)`;
                    break;
                  }
                  case 'wipe-up': {
                    const wipeProgress = interpolate(frame, [startFrame, startFrame + transition.duration], [100, 0]);
                    transitionStyle.transform = `translateY(${wipeProgress}%)`;
                    break;
                  }
                  case 'circle-open': {
                    // Circle expands from 0% to 150% to ensure it covers the corners of the rectangle
                    const circleSize = interpolate(frame, [startFrame, startFrame + transition.duration], [0, 150]);
                    transitionStyle.clipPath = `circle(${circleSize}% at 50% 50%)`;
                    break;
                  }
                }
              }

              return (
                <div key={index} style={{...transitionStyle, position: 'absolute', width: '100%', height: '100%'}}>
                  <Sequence
                    from={startFrame}
                    durationInFrames={extendedDuration}
                  >
                    <ImageSlide
                      mediaItem={mediaItem}
                      slideDuration={duration}
                      isLastSlide={isLastSlide}
                    />
                  </Sequence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Audio sequences */}
      {validMedia.map((item, index) => (
        <Sequence
          key={`audio-${index}`}
          from={cumulativeFrames[index]}
          durationInFrames={slideDurations[index]}
        >
          <Audio src={item.voice} />
        </Sequence>
            ))}
    </div>
    </>
  );
  };

// Styles
const containerStyle: React.CSSProperties = {
  width: '1080px',
  height: '1920px',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '72px',
  overflow: 'hidden',
  fontFamily: '"Pretendard Variable", Pretard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
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
  fontWeight: '700',
  margin: 0,
  letterSpacing: '-0.02em',
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
  borderBottom: '6px solid #d0d0d0',
  // More robust alternatives (uncomment to try):
  // borderBottom: '8px solid #c0c0c0', // Even thicker line
  // boxShadow: '0 6px 0 #d0d0d0', // Shadow instead of border
  // background: 'linear-gradient(to bottom, transparent 90%, #e0e0e0 100%)', // Gradient line
};

const postTitleStyle: React.CSSProperties = {
  fontSize: '60px',
  fontWeight: '700',
  margin: '0 0 30px 0',
  letterSpacing: '-0.015em',
  lineHeight: '1.2',
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
  position: 'relative',
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: '36px',
  overflow: 'hidden',
  margin: '0 auto',
};