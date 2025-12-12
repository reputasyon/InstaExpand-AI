export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4', // Closest to 4:5 supported by API
  STORY = '9:16'
}

export interface GeneratedImage {
  url: string;
  ratio: AspectRatio;
}

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';
