
import React, { useRef, useEffect, useCallback } from 'react';
import type { Room } from '../types';
import { XIcon } from './icons/XIcon';

interface InteractiveFloorPlanProps {
  imageUrl: string;
  maskImageUrl: string | null;
  rooms: Room[] | null;
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  onClear: () => void;
}

const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (c: number) => `0${c.toString(16)}`.slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({ imageUrl, maskImageUrl, rooms, selectedRoom, onSelectRoom, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const highlightCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!maskImageUrl || !highlightCanvasRef.current) return;

    const highlightCanvas = highlightCanvasRef.current;
    const ctx = highlightCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const maskImg = new Image();
    maskImg.crossOrigin = "Anonymous";
    maskImg.src = maskImageUrl;

    maskImg.onload = () => {
      highlightCanvas.width = maskImg.naturalWidth;
      highlightCanvas.height = maskImg.naturalHeight;
      ctx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
      
      if (selectedRoom) {
        ctx.drawImage(maskImg, 0, 0);
        const imageData = ctx.getImageData(0, 0, highlightCanvas.width, highlightCanvas.height);
        const data = imageData.data;
        const selectedColorHex = selectedRoom.color.toLowerCase();

        for (let i = 0; i < data.length; i += 4) {
          const pixelHex = rgbToHex(data[i], data[i + 1], data[i + 2]);
          if (pixelHex.toLowerCase() === selectedColorHex) {
            data[i] = 74;     // R for sky-500
            data[i+1] = 222;  // G for sky-500
            data[i+2] = 230;  // B for sky-500
            data[i+3] = 150;  // Alpha
          } else {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
    };
  }, [selectedRoom, maskImageUrl]);


  useEffect(() => {
    if (!maskImageUrl || !maskCanvasRef.current) return;
    const maskCanvas = maskCanvasRef.current;
    const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    const maskImg = new Image();
    maskImg.crossOrigin = "Anonymous";
    maskImg.src = maskImageUrl;
    maskImg.onload = () => {
      maskCanvas.width = maskImg.naturalWidth;
      maskCanvas.height = maskImg.naturalHeight;
      ctx.drawImage(maskImg, 0, 0);
    }
  }, [maskImageUrl]);

  const handleImageClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!rooms || !maskCanvasRef.current || !imageRef.current) return;
    
    const maskCanvas = maskCanvasRef.current;
    const image = imageRef.current;
    const rect = image.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const scaleX = maskCanvas.width / image.width;
    const scaleY = maskCanvas.height / image.height;
    const canvasX = Math.floor(x * scaleX);
    const canvasY = Math.floor(y * scaleY);

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
    const clickedHex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const foundRoom = rooms.find(room => room.color.toLowerCase() === clickedHex.toLowerCase());
    
    if (foundRoom) {
      onSelectRoom(foundRoom);
    }
  }, [rooms, onSelectRoom]);

  return (
    <div className="flex flex-col gap-3">
        <div 
          ref={containerRef} 
          className="relative w-full overflow-hidden rounded-lg cursor-pointer group"
          onClick={maskImageUrl ? handleImageClick : undefined}
        >
            <button 
                onClick={onClear}
                className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1.5 hover:bg-black/80 transition-colors z-30 opacity-0 group-hover:opacity-100"
                aria-label="Clear floor plan"
            >
                <XIcon className="w-5 h-5" />
            </button>
            <img
                ref={imageRef}
                src={imageUrl}
                alt="Floor plan"
                className="w-full h-auto block"
            />
            <canvas ref={maskCanvasRef} className="hidden" aria-hidden="true" />
            
            {maskImageUrl && (
              <img 
                src={maskImageUrl} 
                alt="Room segmentation mask" 
                className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none" 
              />
            )}

            <canvas 
              ref={highlightCanvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
              style={{ imageRendering: 'pixelated' }}
            />
        </div>
        {selectedRoom && (
          <div className="text-center bg-gray-900/50 p-2 rounded-lg">
            <p className="text-gray-300">Selected Room: <span className="font-bold text-sky-300">{selectedRoom.name}</span></p>
          </div>
        )}
    </div>
  );
};
