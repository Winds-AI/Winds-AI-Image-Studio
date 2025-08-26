import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { XIcon } from './icons/XIcon';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          setCameraError("Camera permission was denied. Please grant permission in your browser settings to use this feature.");
        } else {
          setCameraError("Could not access the camera. Please ensure it is not being used by another application and try again.");
        }
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="relative bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-2xl max-w-4xl w-full min-h-[300px] flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-900/50 rounded-full p-2 hover:bg-gray-700 transition-colors z-10"
          aria-label="Close camera"
        >
          <XIcon className="w-6 h-6" />
        </button>
        
        {cameraError ? (
          <div className="text-center p-6 text-red-300">
            <h3 className="text-xl font-bold mb-2">Camera Access Error</h3>
            <p>{cameraError}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto rounded-lg"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <button
                onClick={handleCapture}
                className="w-20 h-20 bg-white rounded-full border-4 border-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-400"
                aria-label="Take picture"
              >
                <CameraIcon className="w-10 h-10 text-gray-800" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};