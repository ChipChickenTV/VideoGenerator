import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame } from 'remotion';
import { VideoProps } from '@/types/VideoProps';
import { TextArea } from './TextArea';
import { ImageArea } from './ImageArea';
import { z } from 'zod';
import { VideoPropsSchema } from '@/types/VideoProps';
import { getTransitionAnimation } from '@/animations/transitions';

import { TemplateStyle } from '@/types/VideoProps';

interface SceneContentProps {
  scene: z.infer<typeof VideoPropsSchema>['media'][0];
  durationInFrames: number;
  templateStyle?: TemplateStyle;
}

export const SceneSlide: React.FC<SceneContentProps> = ({
  scene,
  durationInFrames,
  templateStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const effect = scene.transition?.effect ?? 'none';
  const transitionAnimation = getTransitionAnimation(effect);
  const style = transitionAnimation(frame, durationInFrames);

  const audioDurationInFrames = scene.audioDuration
    ? Math.ceil(scene.audioDuration * fps)
    : fps * 3;

  return (
    <AbsoluteFill style={style}>
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
        
        {/* template-examples.html 방식: 이미지 고정 위치/크기 */}
        {scene.image && (
          <div style={{
            position: 'absolute',
            top: 630, // 150px * 3 (더 위로 올려서 확실히 보이게)
            left: '50%',
            transform: 'translateX(-50%)',
            width: 960, // 320px * 3
            height: 960, // 320px * 3
          }}>
            <ImageArea 
              image={scene.image}
            />
          </div>
        )}
    </AbsoluteFill>
  );
};