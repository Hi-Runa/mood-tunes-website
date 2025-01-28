import React, { useRef, useEffect, useState } from 'react';
import { Camera as CameraIcon } from 'lucide-react';

interface CameraProps {
  onMoodDetected?: (mood: string) => void;
}

export function Camera({ onMoodDetected }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
          setError('');
        }
      } catch (err) {
        setError('Camera access denied or not available');
        console.error('Camera error:', err);
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // This function will be used when you add the TensorFlow model
  const analyzeFace = async () => {
    if (!videoRef.current || !isStreaming) return;

    // TODO: Add TensorFlow model integration here
    // For now, we'll just log that the capture was attempted
    console.log('Face analysis will be implemented when model is added');
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 right-4">
            <button
              onClick={analyzeFace}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
              disabled={!isStreaming}
            >
              <CameraIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}