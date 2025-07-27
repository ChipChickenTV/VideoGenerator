import React from 'react';
import {
	AbsoluteFill,
	useVideoConfig,
	Audio,
	staticFile,
	Series,
} from 'remotion';
import {Scene, VideoProps} from '@/types/VideoProps';
import {PhoneFrame} from './components/PhoneFrame';
import {SceneSlide} from './components/SceneSlide';
import {Header} from './components/Header';
import {PostHeader} from './components/PostHeader';
import {THEME_CONSTANTS} from '@/config/theme';

interface VideoSequenceProps {
	enrichedProps: VideoProps;
}

const getSceneDuration = (scene: Scene, fps: number): number => {
	const defaultDuration = 3 * fps;
	if (scene.audioDuration) {
		return Math.ceil(scene.audioDuration * fps);
	}
	return defaultDuration;
};

export const VideoSequence: React.FC<VideoSequenceProps> = ({
	enrichedProps,
}) => {
	const {fps} = useVideoConfig();

	return (
		<PhoneFrame>
			<AbsoluteFill>
				{/* 1. 고정 템플릿 영역 */}
				<Header />
				<div
					style={{
						flex: 1,
						padding: THEME_CONSTANTS.DIMENSIONS.CONTENT_PADDING,
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<PostHeader
						title={enrichedProps.title}
						postMeta={enrichedProps.postMeta}
					/>

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
											durationInFrames={sceneDuration}
											theme={enrichedProps.theme}
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