import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { MediaItem } from './inputData';
import { getAudioDurations } from './AudioDuration';

interface DataLoaderResult {
  scripts: string[];
  audioDurations: number[];
  isReady: boolean;
}

// 배치 단위로 요청을 제한하는 헬퍼 함수
const loadInBatches = async <T,>(
  items: T[],
  batchSize: number,
  loader: (item: T) => Promise<any>
): Promise<any[]> => {
  const results: any[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(loader);
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // 배치 간 짧은 지연
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};

export const useDataLoader = (media: MediaItem[]): DataLoaderResult => {
  const [scripts, setScripts] = useState<string[]>([]);
  const [audioDurations, setAudioDurations] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 스크립트 로딩을 배치 단위로 제한 (동시 2개씩)
        const scriptLoader = async (item: MediaItem) => {
          try {
            const response = await fetch(item.script.url);
            return await response.text();
          } catch (error) {
            console.error('Error loading script:', error);
            return '스크립트를 불러올 수 없습니다.';
          }
        };

        // 오디오 로딩을 배치 단위로 제한 (동시 2개씩)
        const audioLoader = async (url: string) => {
          return new Promise<number>((resolve) => {
            const audio = new Audio();
            
            const handleLoadedMetadata = () => {
              resolve(audio.duration);
            };

            const handleError = () => {
              console.error('Error loading audio:', url);
              resolve(3); // fallback to 3 seconds
            };

            audio.addEventListener('loadedmetadata', handleLoadedMetadata);
            audio.addEventListener('error', handleError);
            
            audio.src = url;
            audio.load();
          });
        };

        // 배치 단위로 순차 로딩
        console.log('Loading scripts in batches...');
        const loadedScripts = await loadInBatches(media, 2, scriptLoader);
        
        console.log('Loading audio durations in batches...');
        const audioUrls = media.map((item) => item.voice);
        const loadedDurations = await loadInBatches(audioUrls, 2, audioLoader);

        setScripts(loadedScripts);
        setAudioDurations(loadedDurations);
        setIsReady(true);
        continueRender(handle);
      } catch (error) {
        console.error('Error loading data:', error);
        // Set fallback data
        setScripts(media.map(() => '데이터를 불러올 수 없습니다.'));
        setAudioDurations(media.map(() => 3));
        setIsReady(true);
        continueRender(handle);
      }
    };

    loadAllData();
  }, [media, handle]);

  return { scripts, audioDurations, isReady };
}; 