import { useState, useEffect, useRef, RefObject } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { detectFlame } from '@/lib/flame-detection';
import * as tf from '@tensorflow/tfjs';

interface UseFlameDetectorProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  enabled: boolean;
}

interface UseFlameDetectorResult {
  error: string | null;
}

export function useFlameDetector({
  videoRef,
  canvasRef,
  enabled
}: UseFlameDetectorProps): UseFlameDetectorResult {
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const { 
    sensitivity, 
    setFlameDetected, 
    setDetectionAccuracy,
    flameDetected,
    checkForNewDiscoveries
  } = useGameContext();
  
  const detectionIntervalRef = useRef<number | null>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const detectionCountRef = useRef<number>(0);

  // Load TensorFlow.js model
  useEffect(() => {
    async function loadModel() {
      try {
        // Check if TF is ready and available
        if (!tf.ready) {
          console.log("TensorFlow.js not ready yet, waiting...");
          return;
        }

        // Load the model (using MobileNet for this example)
        const model = await tf.loadGraphModel(
          'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/classification/5/default/1',
          { fromTFHub: true }
        );
        
        modelRef.current = model;
        setModelLoaded(true);
        setError(null);
        console.log("TensorFlow model loaded successfully");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load detection model';
        console.error('Model loading error:', errorMessage);
        setError(errorMessage);
        setModelLoaded(false);
      }
    }

    loadModel();
  }, []);

  // Setup detection loop
  useEffect(() => {
    // Don't start detection if not enabled or model not loaded
    if (!enabled || !modelLoaded) {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      return;
    }

    async function detectFrame() {
      if (!videoRef.current || !canvasRef.current || !modelRef.current) return;
      
      try {
        // Only run detection if video is playing
        if (videoRef.current.readyState < 2) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Adjust canvas to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas for processing
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Perform flame detection
        const { detected, confidence } = await detectFlame(
          canvas, 
          modelRef.current,
          sensitivity / 10 // Convert 1-10 to 0.1-1.0
        );
        
        // Update detection accuracy display
        setDetectionAccuracy(Math.round(confidence * 100));
        
        // Handle flame detection state
        if (detected) {
          detectionCountRef.current += 1;
          // Require multiple consecutive detections for stability
          if (detectionCountRef.current >= 3) {
            setFlameDetected(true);
            
            // Check for new discoveries after consistent flame detection
            if (!flameDetected) {
              checkForNewDiscoveries();
            }
            
            // Record detection time for cooldown
            lastDetectionTimeRef.current = Date.now();
          }
        } else {
          detectionCountRef.current = 0;
          
          // Add cooldown for detection state to avoid flickering
          const now = Date.now();
          if (flameDetected && now - lastDetectionTimeRef.current > 2000) {
            setFlameDetected(false);
          }
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
    }

    // Run detection at regular intervals
    detectionIntervalRef.current = window.setInterval(detectFrame, 200);

    // Clean up
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [enabled, modelLoaded, videoRef, canvasRef, sensitivity, setFlameDetected, 
      setDetectionAccuracy, flameDetected, checkForNewDiscoveries]);

  return { error };
}
