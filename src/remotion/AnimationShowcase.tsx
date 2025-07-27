import React from 'react';
import { z } from 'zod';
import { VideoSequence } from './VideoSequence';
import { VideoProps, TemplateStyleSchema } from '@/types/VideoProps';
import { THEME_PRESETS } from '@/config/themes';

export const animationShowcasePropsSchema = z.object({
  animationType: z.enum(['Image', 'Text', 'Transition', 'Filter', 'Highlight']),
  animationName: z.string(),
  templateStyle: TemplateStyleSchema.deepPartial().optional(),
});

type AnimationShowcaseProps = z.infer<typeof animationShowcasePropsSchema>;

export const AnimationShowcase: React.FC<AnimationShowcaseProps> = ({
  animationType,
  animationName,
  templateStyle,
}) => {
  // 기본 템플릿 props에 전달받은 스타일을 병합
  const baseProps: VideoProps = {
    templateStyle: {
      ...THEME_PRESETS.original, // 기본 원본 테마 적용
      ...templateStyle, // 전달받은 값으로 덮어쓰기
    },
    title: `${animationType.toUpperCase()}: ${animationName}`,
    postMeta: {
      author: 'Animation Test',
      time: '00:00',
      viewCount: '999',
    },
    media: [],
  };

  // 애니메이션 타입에 따라 테스트 시나리오 생성
  if (animationType === 'Image') {
    baseProps.media = [{
      script: {
        text: `이미지 애니메이션: ${animationName}`,
        animation: {
          in: 'fadeIn',
          out: 'fadeOut',
          highlight: 'none',
        },
      },
      image: {
        url: 'image.png',
        animation: {
          effect: animationName as any,
          filter: 'none',
        },
      },
    }];
  }
  
  else if (animationType === 'Text') {
    baseProps.media = [{
      script: {
        text: `텍스트 애니메이션: <h>${animationName}</h>`,
        animation: {
          in: animationName as any,
          out: 'fadeOut',
          highlight: 'yellow-box',
        },
      },
      image: {
        url: 'image.png',
        animation: {
          effect: 'none',
          filter: 'none',
        },
      },
    }];
  }
  
  else if (animationType === 'Filter') {
    baseProps.media = [{
      script: {
        text: `이미지 필터: ${animationName}`,
        animation: {
          in: 'fadeIn',
          out: 'fadeOut',
          highlight: 'none',
        },
      },
      image: {
        url: 'image.png',
        animation: {
          effect: 'none',
          filter: animationName as any,
        },
      },
    }];
  }
  
  else if (animationType === 'Highlight') {
    baseProps.media = [{
      script: {
        text: `하이라이트 테스트: <h>강조된 텍스트</h> 입니다`,
        animation: {
          in: 'fadeIn',
          out: 'fadeOut',
          highlight: animationName as any,
        },
      },
      image: {
        url: 'image.png',
        animation: {
          effect: 'none',
          filter: 'none',
        },
      },
    }];
  }
  
  else if (animationType === 'Transition') {
    // 전환 효과는 두 개 씬으로 테스트
    baseProps.media = [
      {
        script: {
          text: '첫 번째 씬',
          animation: {
            in: 'fadeIn',
            out: 'fadeOut',
            highlight: 'none',
          },
        },
        image: {
          url: 'image.png',
          animation: {
            effect: 'none',
            filter: 'none',
          },
        },
        transition: {
          effect: animationName as any,
        },
      },
      {
        script: {
          text: `전환 효과: ${animationName}`,
          animation: {
            in: 'fadeIn',
            out: 'fadeOut',
            highlight: 'none',
          },
        },
        image: {
          url: 'image.png',
          animation: {
            effect: 'none',
            filter: 'sepia',
          },
        },
      },
    ];
  }

  // 기존 VideoSequence 컴포넌트를 그대로 사용
  return <VideoSequence enrichedProps={baseProps} />;
};