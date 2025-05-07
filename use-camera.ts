import { useState, useEffect } from 'react';

interface UseCameraResult {
  stream: MediaStream | null;
  error: string | null;
}

export function useCamera(active: boolean): UseCameraResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    async function setupCamera() {
      try {
        if (!active) {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
          }
          return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Your browser doesn't support camera access");
        }

        // Request camera with highest available resolution
        const constraints = {
          video: {
            facingMode: 'environment', // Prefer back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown camera error';
        console.error('Camera access error:', errorMessage);
        setError(errorMessage);
        setStream(null);
      }
    }

    setupCamera();

    // Clean up on unmount
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [active]);

  return { stream, error };
}
