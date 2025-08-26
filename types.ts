
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
