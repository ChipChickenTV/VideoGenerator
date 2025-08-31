import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { VideoPropsSchema, VideoProps } from "./types/VideoProps";

export const Root: React.FC = () => {
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
            // Priority: audio duration > default (all in seconds)
            const durationInSeconds = scene.audioDuration || 3;
            const sceneDurationInFrames = Math.ceil(durationInSeconds * fps);
            return total + sceneDurationInFrames;
          }, 0);
          return {
            durationInFrames: totalDurationInFrames,
          };
        }}
        schema={VideoPropsSchema}
        defaultProps={{
          templateStyle: {
            fontFamily: {
              header: "Pretendard, sans-serif",
              title: "Pretendard, sans-serif",
              text: "Pretendard, sans-serif",
              meta: "Pretendard, sans-serif",
            },
            textColor: "#1a1a1a",
            backgroundColor: "#ffffff",
            headerColor: "#a5d8f3",
            layout: "text-middle",
            textAlign: {
              header: "center",
              title: "left",
              text: "center",
              meta: "left",
            },
            lineHeight: "1.4",
            letterSpacing: "normal",
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
    </>
  );
};
