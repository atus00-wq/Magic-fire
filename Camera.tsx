import { useRef, useEffect, useState } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { useCamera } from '@/hooks/use-camera';
import { useFlameDetector } from '@/hooks/use-flame-detector';
import { FaFire, FaMagnifyingGlass } from 'react-icons/fa6';
import { alarmSound } from '@/lib/alarm-sound';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFlameStateRef = useRef<boolean>(false);
  
  const { 
    cameraActive, 
    isDetecting, 
    flameDetected, 
    detectionAccuracy,
    requestCameraAccess,
    soundEffectsEnabled
  } = useGameContext();
  
  // Initialize camera
  const { stream, error: cameraError } = useCamera(cameraActive);
  
  // Initialize flame detector
  const { error: detectionError } = useFlameDetector({
    videoRef,
    canvasRef,
    enabled: cameraActive && isDetecting
  });

  // Connect stream to video element when available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Play alarm sound when flame is detected
  useEffect(() => {
    // Only play sound when flame state changes from false to true
    if (flameDetected && !lastFlameStateRef.current && soundEffectsEnabled) {
      // Play alarm sound
      alarmSound.currentTime = 0; // Reset sound to beginning
      alarmSound.play().catch(err => {
        console.error("Failed to play alarm sound:", err);
      });
    }
    
    // Update the last flame state reference
    lastFlameStateRef.current = flameDetected;
  }, [flameDetected, soundEffectsEnabled]);

  return (
    <div className="relative bg-black/20 rounded-xl overflow-hidden shadow-lg border-2 border-primary/30">
      <div className="aspect-[4/3] bg-gray-900 rounded flex items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          {/* Hidden canvas for processing */}
          <canvas 
            ref={canvasRef} 
            className="hidden"
            width="640"
            height="480"
          />
          
          {/* Video feed */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Detection overlay when flame is detected */}
          {flameDetected && (
            <div className="absolute inset-0 bg-danger/20 flex items-center justify-center">
              <div className="bg-neutral/70 rounded-full p-4 animate-pulse-flame">
                <FaFire className="text-4xl text-danger" />
              </div>
            </div>
          )}
          
          {/* Magical particles overlay - would be implemented with a particle system library */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full camera-scan-effect"></div>
          </div>
        </div>
      </div>

      {/* Camera access prompt (shown when camera is not active) */}
      {!cameraActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral/70 rounded">
          <div className="text-center p-6">
            <FaFire className="text-3xl mb-2 text-accent mx-auto" />
            <p className="mb-4">Camera access is needed to detect magical flames</p>
            {cameraError ? (
              <div className="text-danger mb-4 text-sm">
                Error: {cameraError}
              </div>
            ) : null}
            <button 
              onClick={requestCameraAccess}
              className="bg-primary hover:bg-primary/80 text-white py-2 px-6 rounded-full transition-colors"
            >
              Start Magical Journey
            </button>
          </div>
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-neutral/80 flex items-center">
        {/* Detection status indicator */}
        <div className="mr-3">
          {isDetecting ? (
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
          ) : (
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          )}
        </div>
        
        {/* Status text */}
        {flameDetected ? (
          <div className="flex items-center">
            <FaFire className="text-danger mr-2" />
            <span>Matchstick Fire Detected!</span>
          </div>
        ) : (
          <div className="flex items-center">
            <FaMagnifyingGlass className="text-accent mr-2" />
            <span>No Fire Detected</span>
          </div>
        )}
      </div>
      
      {/* Flame detection progress */}
      <div className="absolute top-2 right-2 bg-neutral/70 rounded-full px-3 py-1 text-sm">
        <span>Detection: {detectionAccuracy}%</span>
      </div>

      {detectionError && (
        <div className="absolute top-2 left-2 bg-danger/70 rounded-full px-3 py-1 text-sm">
          <span>Error: {detectionError}</span>
        </div>
      )}
    </div>
  );
}
