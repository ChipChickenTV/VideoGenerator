import { VideoProps, VideoPropsSchema } from '@/types/VideoProps';
import { enrichPropsWithAudioDuration, enrichPropsWithRemoteScript } from './enrichment';

/**
 * VideoProps 데이터 검증 및 정규화
 */
export async function validateAndEnrichProps(
  inputProps: unknown,
  verbose: boolean = false
): Promise<VideoProps> {
  if (verbose) console.log('🔍 Props 검증 및 데이터 보강 시작...');

  // Zod 스키마 검증
  const parsedProps = VideoPropsSchema.parse(inputProps);
  if (verbose) console.log('✅ Props 스키마 검증 완료');

  // 오디오 지속시간 자동 분석
  let enrichedProps = await enrichPropsWithAudioDuration(parsedProps, verbose);
  
  // 원격 스크립트 로드
  enrichedProps = await enrichPropsWithRemoteScript(enrichedProps, verbose);

  if (verbose) console.log('✨ Props 데이터 보강 완료');
  return enrichedProps;
}

/**
 * 렌더링에 필요한 기본 검증
 */
export function validateRenderRequirements(props: VideoProps): void {
  if (!props.media || props.media.length === 0) {
    throw new Error('최소 하나의 씬(media)이 필요합니다.');
  }

  for (const [index, scene] of props.media.entries()) {
    if (!scene.script?.text && !scene.script?.url) {
      throw new Error(`씬 ${index + 1}: script.text 또는 script.url이 필요합니다.`);
    }
  }
}