import React from 'react';
import { z } from 'zod';
import { VideoSequence } from './VideoSequence';
import { VideoProps } from '@/types/VideoProps';

export const animationShowcasePropsSchema = z.object({
  animationType: z.enum(['Image', 'Text', 'Transition', 'Filter', 'Highlight']),
  animationName: z.string(),
  demoContent: z.string().optional(),
});

type AnimationShowcaseProps = z.infer<typeof animationShowcasePropsSchema>;

export const AnimationShowcase: React.FC<AnimationShowcaseProps> = ({
  animationType,
  animationName,
  demoContent = "애니메이션 테스트"
}) => {
  // 기본 썰풀기 템플릿 props
  const baseProps: VideoProps = {
    theme: {
      fontFamily: 'Pretendard, sans-serif',
      textColor: '#1a1a1a',
      backgroundColor: '#ffffff',
      headerColor: '#a5d8f3',
      layout: 'text-middle',
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
        text: `이것은 <h>청크 분할 기능</h>을 테스트하기 위한 조금 더 긴 문장입니다. 과연 HTML 태그를 잘 처리하면서 단어들을 올바르게 나눌 수 있을까요?`,
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