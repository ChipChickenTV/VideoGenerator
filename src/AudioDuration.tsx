import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';

export const useAudioDuration = (audioUrl: string): number | null => {
  const [duration, setDuration] = useState<number | null>(null);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    const audio = new Audio();
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      continueRender(handle);
    };

    const handleError = () => {
      console.error('Error loading audio:', audioUrl);
      setDuration(3); // fallback to 3 seconds
      continueRender(handle);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    
    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, handle]);

  return duration;
};

export const getAudioDurations = async (audioUrls: string[]): Promise<number[]> => {
  const promises = audioUrls.map((url) => {
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
  });

  return Promise.all(promises);
}; 