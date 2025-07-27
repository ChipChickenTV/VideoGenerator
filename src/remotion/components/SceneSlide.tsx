import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame } from 'remotion';
import { VideoProps } from '@/types/VideoProps';
import { TextArea } from './TextArea';
import { ImageArea } from './ImageArea';
import { z } from 'zod';
import { VideoPropsSchema } from '@/types/VideoProps';
import { getTransitionAnimation } from '@/animations/transitions';

interface SceneContentProps {
  scene: z.infer<typeof VideoPropsSchema>['media'][0];
  durationInFrames: number;
  theme: VideoProps['theme'];
}

export const SceneSlide: React.FC<SceneContentProps> = ({
  scene,
  durationInFrames,
  theme,
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
        <TextArea 
          script={scene.script}
          audioDurationInFrames={audioDurationInFrames}
          theme={theme}
        />
        
        {scene.image && (
          <ImageArea 
            image={scene.image}
          />
        )}
    </AbsoluteFill>
  );
};