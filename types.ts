
export interface TryOnResult {
  imageUrl: string | null;
  text: string | null;
}

export type ClothingType = 'top' | 'bottom' | 'outerwear' | 'fullBody';

export interface Room {
  name: string;
  color: string;
  boundary: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type AppMode = 'clothingTryOn' | 'glassesTryOn' | 'extractor' | 'threeDView' | 'interiorDesign' | 'interiorVisualization';
export type Studio = 'apparel' | 'eyewear' | 'interior';
