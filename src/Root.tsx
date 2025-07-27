import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { VideoPropsSchema, VideoProps } from "./types/VideoProps";
import { AnimationShowcase, animationShowcasePropsSchema } from "./remotion/AnimationShowcase";
import { getAllAnimations } from "./animations";
import { getAnimationDuration } from "./animations/duration";

// Helper to capitalize the first letter for the enum
function capitalize<T extends string>(string: T): Capitalize<T> {
  return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>;
}

export const Root: React.FC = () => {
  // 모든 애니메이션 정보 수집
  const allAnimations = getAllAnimations();

  // FPS 설정
  const fps = 30;

  return (
    <>
      <Composition
        id="ThumbStory"
        component={MyComposition}
        width={1080}
        height={1920}
        fps={fps}
        calculateMetadata={({ props }) => {
          const videoProps = props as VideoProps;
          if (!videoProps?.media || videoProps.media.length === 0) {
            return { durationInFrames: fps * 10 };
          }
          const totalDurationInFrames = videoProps.media.reduce((total, scene) => {
            const sceneDurationInFrames = Math.ceil((scene.audioDuration || 3) * fps);
            return total + sceneDurationInFrames;
          }, 0);
          return {
            durationInFrames: totalDurationInFrames,
          };
        }}
        schema={VideoPropsSchema}
        defaultProps={{
          theme: {
            fontFamily: "'Pretendard', sans-serif",
            textColor: "#1a1a1a",
            backgroundColor: "#ffffff",
            headerColor: "#a5d8f3",
            layout: "text-middle",
          },
          title: "샘플 비디오",
          postMeta: {
            author: "익명",
            time: "14:25",
            viewCount: "3,463,126",
          },
          media: [
            {
              image: {
                url: "image.png",
                animation: {
                  effect: "zoom-in",
                  filter: "none",
                },
              },
              script: {
                text: "안녕하세요! 이것은 샘플 텍스트입니다.",
                animation: {
                  in: "fadeIn",
                  out: 'fadeOut',
                  highlight: "yellow-box",
                },
              },
              audioDuration: 3,
            },
          ],
        } as VideoProps}
      />

      {/* 애니메이션 쇼케이스 컴포지션들 */}
      {allAnimations.map((animation) => (
        <Composition
          key={`Showcase-${animation.type}-${animation.name}`}
          id={`Showcase-${animation.type}-${animation.name}`}
          component={AnimationShowcase}
          durationInFrames={getAnimationDuration(animation.type, animation.name)}
          fps={fps}
          width={1080}
          height={1920}
          schema={animationShowcasePropsSchema}
          defaultProps={{
            animationType: capitalize(animation.type),
            animationName: animation.name,
            demoContent: animation.demoContent,
          }}
        />
      ))}
    </>
  );
};
