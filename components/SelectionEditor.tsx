
import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { TryOnButton } from './TryOnButton';

interface SelectionEditorProps {
  imageUrl: string;
  onGenerateView: (selectionDataUrl: string) => void;
  isGenerating: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const SelectionEditor: React.FC<SelectionEditorProps> = ({ imageUrl, onGenerateView, isGenerating }) => {
  const [selection, setSelection] = useState<Rectangle | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset selection when image changes
  useEffect(() => {
    setSelection(null);
  }, [imageUrl]);

  const getCoordinates = (event: MouseEvent): Point | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  };

  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    const point = getCoordinates(event);
    if (point) {
      setIsDrawing(true);
      setStartPoint(point);
      setSelection(null);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    const endPoint = getCoordinates(event);
    if (endPoint && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.min(startPoint.x, endPoint.x);
      const y = Math.min(startPoint.y, endPoint.y);
      const width = Math.abs(startPoint.x - endPoint.x);
      const height = Math.abs(startPoint.y - endPoint.y);
      
      // Constrain selection to image boundaries
      const constrainedX = Math.max(0, x);
      const constrainedY = Math.max(0, y);
      const constrainedWidth = Math.min(width, rect.width - constrainedX);
      const constrainedHeight = Math.min(height, rect.height - constrainedY);

      setSelection({ x: constrainedX, y: constrainedY, width: constrainedWidth, height: constrainedHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPoint(null);
  };
  
  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
    }
  };

  const handleGenerate = () => {
    if (!selection || !imageRef.current || selection.width < 10 || selection.height < 10) {
        alert("Please draw a valid selection on the image first.");
        return;
    }
    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    
    // Calculate scale between displayed image size and natural image size
    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;
    
    const sourceX = selection.x * scaleX;
    const sourceY = selection.y * scaleY;
    const sourceWidth = selection.width * scaleX;
    const sourceHeight = selection.height * scaleY;
    
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get canvas context");
        return;
    }

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onGenerateView(dataUrl);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <h3 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">2. Select a Room</h3>
      <p className="text-gray-400 text-center -mt-2">Click and drag on the image below to select an area, then generate a first-person view.</p>
      <div 
        ref={containerRef} 
        className="relative w-full max-w-lg mx-auto cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Interior design to select from"
          className="w-full h-auto block select-none pointer-events-none rounded-lg"
          crossOrigin="anonymous"
        />
        {selection && (
          <div
            className="absolute border-2 border-dashed border-sky-400 bg-sky-500/30 pointer-events-none"
            style={{
              left: `${selection.x}px`,
              top: `${selection.y}px`,
              width: `${selection.width}px`,
              height: `${selection.height}px`,
            }}
          />
        )}
      </div>
      
      <div className="w-full max-w-lg">
        <TryOnButton 
          onClick={handleGenerate} 
          disabled={!selection || isGenerating || (selection.width < 10 || selection.height < 10)} 
          isLoading={isGenerating} 
          loadingText="Generating...">
            Generate Room View
        </TryOnButton>
      </div>
    </div>
  );
};
