import { Player } from '@remotion/player';
import React, { useMemo } from 'react';
import { z } from 'zod';
import { AnimationShowcase, animationShowcasePropsSchema } from '../src/remotion/AnimationShowcase';
import { AnimationInfo } from '../src/animations/types';
import { TemplateStyle } from '../src/types/VideoProps';

interface PlayerWrapperProps {
  animation: AnimationInfo | null;
  templateStyle?: Partial<TemplateStyle>;
}

const PlayerWrapperComponent: React.FC<PlayerWrapperProps> = ({ animation, templateStyle }) => {
  const inputProps: z.infer<typeof animationShowcasePropsSchema> = useMemo(() => {
    const baseProps = {
      templateStyle,
    };

    if (!animation) {
      return {
        ...baseProps,
        animationType: 'Text',
        animationName: 'none',
      };
    }

    const capitalizedType = (animation.type.charAt(0).toUpperCase() +
      animation.type.slice(1)) as z.infer<typeof animationShowcasePropsSchema>['animationType'];

    return {
      ...baseProps,
      animationType: capitalizedType,
      animationName: animation.name,
    };
  }, [animation, templateStyle]);

  if (!animation) {
    return (
      <div className="player-placeholder">
        <h2>애니메이션을 선택해주세요.</h2>
        <p>좌측 메뉴에서 확인할 애니메이션을 클릭하면 이곳에 플레이어가 나타납니다.</p>
      </div>
    );
  }

  const compositionId = `Showcase-${animation.type}-${animation.name}`;

  return (
    <Player
      key={compositionId}
      component={AnimationShowcase}
      inputProps={inputProps}
      durationInFrames={animation.durationInFrames}
      compositionWidth={1080}
      compositionHeight={1920}
      fps={30}
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: '9 / 16',
      }}
      controls
      loop
      autoPlay
      acknowledgeRemotionLicense
    />
  );
};

export const PlayerWrapper = React.memo(PlayerWrapperComponent);