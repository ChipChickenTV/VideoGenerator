import { VideoProps } from '@/types/VideoProps';
import { parseFile, parseBuffer } from 'music-metadata';
import fetch from 'node-fetch';
import path from 'path';
import { existsSync } from 'fs';

/**
 * 오디오 지속시간을 자동으로 분석하여 Props에 추가
 */
export async function enrichPropsWithAudioDuration(props: VideoProps, verbose: boolean): Promise<VideoProps> {
  const enrichedMedia = await Promise.all(
    (props.media || []).map(async (scene) => {
      if (scene.voice && (scene.audioDuration === undefined || scene.audioDuration === null)) {
        try {
          if (verbose) console.log(`🎤 Analyzing audio duration for: ${scene.voice}`);
          let duration: number | undefined;

          if (scene.voice.startsWith('http')) {
            const response = await fetch(scene.voice);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${scene.voice}: ${response.statusText}`);
            }
            const buffer = await response.buffer();
            const metadata = await parseBuffer(buffer);
            duration = metadata.format.duration;
          } else {
            const filePath = path.join(process.cwd(), 'public', scene.voice);
            if (existsSync(filePath)) {
              const metadata = await parseFile(filePath);
              duration = metadata.format.duration;
            } else {
              if (verbose) console.warn(`⚠️ Local audio file not found: ${filePath}.`);
            }
          }

          if (duration) {
            if (verbose) console.log(`🎵 Audio duration found: ${duration.toFixed(2)}s`);
            return { ...scene, audioDuration: duration };
          }
        } catch (error: any) {
          if (verbose) console.error(`❌ Error analyzing audio duration for "${scene.voice}": ${error.message}`);
        }
      }
      return scene;
    })
  );
  return { ...props, media: enrichedMedia };
}

/**
 * 원격 URL에서 스크립트를 로드하여 Props에 추가
 */
export async function enrichPropsWithRemoteScript(props: VideoProps, verbose: boolean): Promise<VideoProps> {
  const enrichedMedia = await Promise.all(
    (props.media || []).map(async (scene) => {
      if (scene.script.url && !scene.script.text) {
        try {
          if (verbose) console.log(`📜 Loading script from: ${scene.script.url}`);
          const response = await fetch(scene.script.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${scene.script.url}: ${response.statusText}`);
          }
          const text = await response.text();
          if (verbose) console.log(`✍️ Script loaded successfully.`);
          return { ...scene, script: { ...scene.script, text } };
        } catch (error: any) {
          if (verbose) console.error(`❌ Error loading script from "${scene.script.url}": ${error.message}`);
        }
      }
      return scene;
    })
  );
  return { ...props, media: enrichedMedia };
}