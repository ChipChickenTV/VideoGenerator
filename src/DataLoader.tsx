import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { MediaItem } from './inputData';
import { getAudioDurations } from './AudioDuration';

interface DataLoaderResult {
  scripts: string[];
  audioDurations: number[];
  isReady: boolean;
}

export const useDataLoader = (media: MediaItem[]): DataLoaderResult => {
  const [scripts, setScripts] = useState<string[]>([]);
  const [audioDurations, setAudioDurations] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load all scripts
        const scriptPromises = media.map(async (item) => {
          try {
            const response = await fetch(item.script.url);
            return await response.text();
          } catch (error) {
            console.error('Error loading script:', error);
            return '스크립트를 불러올 수 없습니다.';
          }
        });

        // Load all audio durations using the centralized function
        const audioUrls = media.map((item) => item.voice);
        const audioDurationsPromise = getAudioDurations(audioUrls);

        // Wait for all data to load
        const [loadedScripts, loadedDurations] = await Promise.all([
          Promise.all(scriptPromises),
          audioDurationsPromise,
        ]);

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