import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame } from 'remotion';
import { TextArea } from './TextArea';
import { ImageArea } from './ImageArea';
import { getTransitionAnimation } from '@/animations/transitions';

import { Scene, TemplateStyle } from '@/types/VideoProps';

interface SceneContentProps {
  scene: Scene;
  templateStyle?: TemplateStyle;
}

export const SceneSlide: React.FC<SceneContentProps> = ({
  scene,
  templateStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const effect = scene.transition?.effect ?? 'none';
  const transitionAnimation = getTransitionAnimation(effect);
  const transitionWithMetadata = transitionAnimation as { metadata?: { defaultDuration: number } };
  const transitionDuration = scene.transition?.duration || transitionWithMetadata?.metadata?.defaultDuration || 15;
  const transitionResult = transitionAnimation({ duration: transitionDuration, frame });
  const transitionStyle = transitionResult.style;

  const audioDurationInFrames = scene.audioDuration
    ? Math.ceil(scene.audioDuration * fps)
    : fps * 3;

  return (
    <AbsoluteFill>
        {/* template-examples.html 방식: 텍스트 영역 고정 위치 */}
        <div style={{
          position: 'absolute',
          top: 285, // 95px * 3 (PostHeader 240px + 여백 45px)
          left: 90,  // 30px * 3
          right: 90, // 30px * 3
          height: 300, // 100px * 3
        }}>
          <TextArea
            script={scene.script}
            audioDurationInFrames={audioDurationInFrames}
            templateStyle={templateStyle}
          />
        </div>
        
        {/* template-examples.html 방식: 이미지 고정 위치/크기 - transition 효과 적용 */}
        <div style={{
          position: 'absolute',
          top: 630, // 150px * 3 (더 위로 올려서 확실히 보이게)
          left: 'calc(50% - 480px)', // 중앙 정렬 (960px의 절반)
          width: 960, // 320px * 3
          height: 960, // 320px * 3
          ...transitionStyle, // transition 효과를 이미지 영역에만 적용
        }}>
          {scene.image && (
            <ImageArea 
              image={scene.image}
            />
          )}
        </div>
    </AbsoluteFill>
  );
};