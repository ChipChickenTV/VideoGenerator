import React from 'react';
import { VideoProps } from './types/VideoProps';
import { VideoSequence } from './remotion/VideoSequence';

export const MyComposition: React.FC<VideoProps> = (props) => {
  return <VideoSequence enrichedProps={props} />;
};
