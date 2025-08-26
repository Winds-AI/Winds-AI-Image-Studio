import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { XIcon } from './icons/XIcon';
import { CameraCapture } from './CameraCapture';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageUpload: (base64Image: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        // If the file is AVIF, convert it to JPEG using canvas
        if (file.type === 'image/avif') {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const convertedDataUrl = canvas.toDataURL('image/jpeg');
                    setImagePreview(convertedDataUrl);
                    onImageUpload(convertedDataUrl);
                } else {
                    console.error("Could not get canvas context to convert AVIF image.");
                    // Fallback to using the original if canvas fails
                    setImagePreview(dataUrl);
                    onImageUpload(dataUrl);
                }
            };
            img.src = dataUrl;
        } else {
            // For other supported formats, use the file directly
            setImagePreview(dataUrl);
            onImageUpload(dataUrl);
        }
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handleUploadClick = useCallback(() => {
    inputRef.current?.click();
  }, []);
  
  const handleCameraClick = useCallback(() => {
    setIsCameraOpen(true);
  }, []);

  const handleImageCapture = useCallback((base64Image: string) => {
    setImagePreview(base64Image);
    onImageUpload(base64Image);
    setIsCameraOpen(false);
  }, [onImageUpload]);

  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    onImageUpload(null);
    if (inputRef.current) {
        inputRef.current.value = ''; // Reset file input
    }
  }, [onImageUpload]);

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <label className="font-semibold text-gray-300">{label}</label>
        <div
          className="relative w-full h-64 rounded-xl border-2 border-dashed border-gray-600 flex justify-center items-center bg-gray-900/50 transition-all duration-300 hover:border-purple-500 hover:bg-gray-800/50 overflow-hidden"
        >
          <input
            type="file"
            id={id}
            ref={inputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/webp, image/avif"
            onChange={handleFileChange}
            aria-hidden="true"
          />
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1.5 hover:bg-black/80 transition-colors"
                aria-label="Remove image"
              >
                  <XIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="text-center text-gray-400 flex flex-col items-center gap-4">
              <div className="flex gap-4">
                  <button onClick={handleUploadClick} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <UploadIcon className="w-10 h-10" />
                      <span>Upload File</span>
                  </button>
                  <button onClick={handleCameraClick} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <CameraIcon className="w-10 h-10" />
                      <span>Take Photo</span>
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isCameraOpen && <CameraCapture onCapture={handleImageCapture} onClose={() => setIsCameraOpen(false)} />}
    </>
  );
};