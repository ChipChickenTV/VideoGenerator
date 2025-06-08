export interface MediaItem {
  image: string;
  script: string;
  voice: string;
}

export interface VideoData {
  title: string;
  media: MediaItem[];
}

// Import JSON file directly
import inputJsonData from '../input.json';

export const inputData: VideoData[] = inputJsonData; 