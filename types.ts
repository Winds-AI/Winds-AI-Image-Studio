
export interface TryOnResult {
  imageUrl: string | null;
  text: string | null;
}

// Fix: Add Room interface for interior design features.
export interface Room {
  name: string;
  color: string;
}

export type ClothingType = 'top' | 'bottom' | 'outerwear' | 'fullBody';

export type AppMode = 'clothingTryOn' | 'glassesTryOn' | 'extractor' | 'threeDView' | 'interiorDesign' | 'imageEditing';
export type Studio = 'apparel' | 'eyewear' | 'interior' | 'creative';
