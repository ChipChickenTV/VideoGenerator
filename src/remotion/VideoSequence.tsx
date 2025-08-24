import React from 'react';
import {
	AbsoluteFill,
	useVideoConfig,
	Audio,
	Series,
} from 'remotion';
import {Scene, VideoProps} from '@/types/VideoProps';
import {PhoneFrame} from './components/PhoneFrame';
import {SceneSlide} from './components/SceneSlide';
import {Header} from './components/Header';
import {PostHeader} from './components/PostHeader';
import { generateContainerStyle } from './utils/styleUtils';

interface VideoSequenceProps {
	enrichedProps: VideoProps;
}

const getSceneDuration = (scene: Scene, fps: number): number => {
	// Priority: 1. Audio duration, 2. Default
	// All durations are in seconds and converted to frames
	
	if (scene.audioDuration) {
		return Math.ceil(scene.audioDuration * fps); // Convert seconds to frames
	}
	
	// Default duration: 3 seconds
	const defaultDurationInSeconds = 3;
	return defaultDurationInSeconds * fps;
};

export const VideoSequence: React.FC<VideoSequenceProps> = ({
	enrichedProps,
}) => {
	const {fps} = useVideoConfig();
	const {templateStyle} = enrichedProps;
	
	// 확장된 스타일 적용
	const containerStyle = generateContainerStyle(templateStyle);

	return (
		<PhoneFrame style={containerStyle}>
			<AbsoluteFill style={containerStyle}>
				{/* 1. 고정 템플릿 영역 */}
				<Header templateStyle={templateStyle} />
				<div
					style={{
						flex: 1,
						position: 'relative',
					}}
				>
					{/* template-examples.html 방식: PostHeader 고정 위치 */}
					<div style={{
						position: 'absolute',
						top: 0,
						left: 60, // CONTENT_PADDING
						right: 60, // CONTENT_PADDING
						height: 240, // 80px * 3
					}}>
						<PostHeader
							title={enrichedProps.title}
							postMeta={enrichedProps.postMeta}
							templateStyle={templateStyle}
						/>
					</div>

					{/* 2. 씬 콘텐츠가 교체될 영역 */}
					<div style={{position: 'relative', flex: 1}}>
						<Series>
							{enrichedProps.media.map((scene: Scene, index) => {
								const sceneDuration = getSceneDuration(scene, fps);

								return (
									<Series.Sequence key={index} durationInFrames={sceneDuration}>
										{scene.voice && <Audio src={scene.voice} />}
										<SceneSlide
											scene={scene}
											templateStyle={templateStyle}
										/>
									</Series.Sequence>
								);
							})}
						</Series>
					</div>
				</div>
			</AbsoluteFill>
		</PhoneFrame>
	);
};