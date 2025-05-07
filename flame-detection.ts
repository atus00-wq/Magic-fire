import * as tf from '@tensorflow/tfjs';

interface DetectionResult {
  detected: boolean;
  confidence: number;
}

// Color ranges for flame detection (in RGB)
const FLAME_COLORS = [
  { r: [180, 255], g: [100, 180], b: [0, 100] },   // Yellow-orange flame
  { r: [200, 255], g: [50, 150], b: [0, 50] },     // Orange-red flame
  { r: [150, 255], g: [30, 100], b: [0, 40] }      // Deep red flame
];

// Number of pixels that need to match flame colors to trigger detection
const FLAME_PIXEL_THRESHOLD = 300;

/**
 * Detect flames in the given canvas using a combination of machine learning
 * and color-based detection for better accuracy
 */
export async function detectFlame(
  canvas: HTMLCanvasElement,
  model: tf.GraphModel,
  sensitivityThreshold: number = 0.7
): Promise<DetectionResult> {
  try {
    // 1. Color-based detection (fast first pass)
    const colorDetectionResult = detectFlameByColor(canvas);
    
    // If few flame-colored pixels, shortcut to "no flame"
    if (colorDetectionResult.flamePixelCount < FLAME_PIXEL_THRESHOLD * sensitivityThreshold) {
      return { 
        detected: false, 
        confidence: colorDetectionResult.confidence 
      };
    }
    
    // 2. Machine learning-based detection (more accurate but slower)
    const mlDetectionResult = await detectFlameByMachineLearning(canvas, model, sensitivityThreshold);
    
    // Combine both results for higher accuracy
    // We weigh ML detection more heavily (70/30 split)
    const combinedConfidence = 
      (mlDetectionResult.confidence * 0.7) + 
      (colorDetectionResult.confidence * 0.3);
    
    return {
      detected: combinedConfidence >= sensitivityThreshold,
      confidence: combinedConfidence
    };
  } catch (error) {
    console.error('Flame detection error:', error);
    return { detected: false, confidence: 0 };
  }
}

/**
 * Detect flames using color thresholding
 */
function detectFlameByColor(canvas: HTMLCanvasElement): { flamePixelCount: number, confidence: number } {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { flamePixelCount: 0, confidence: 0 };
  }
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let flamePixelCount = 0;
  const totalPixels = canvas.width * canvas.height;
  
  // Check each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Check if the pixel color matches any flame color range
    if (isFlameColor(r, g, b)) {
      flamePixelCount++;
    }
  }
  
  // Calculate confidence based on percentage of flame-colored pixels
  // Normalize to account for different image sizes
  const normalizedPixelRatio = flamePixelCount / (totalPixels * 0.05); // Assume max 5% of frame is flame
  const confidence = Math.min(normalizedPixelRatio, 1);
  
  return { 
    flamePixelCount, 
    confidence
  };
}

/**
 * Check if a pixel's RGB values match flame color ranges
 */
function isFlameColor(r: number, g: number, b: number): boolean {
  for (const range of FLAME_COLORS) {
    if (
      r >= range.r[0] && r <= range.r[1] &&
      g >= range.g[0] && g <= range.g[1] &&
      b >= range.b[0] && b <= range.b[1]
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Detect flames using TensorFlow.js model
 */
async function detectFlameByMachineLearning(
  canvas: HTMLCanvasElement,
  model: tf.GraphModel,
  sensitivityThreshold: number
): Promise<{ detected: boolean, confidence: number }> {
  return tf.tidy(() => {
    // Prepare the image to match the model's expected input format
    const img = tf.browser.fromPixels(canvas);
    
    // Resize image to model input size (224x224 for MobileNet)
    const resized = tf.image.resizeBilinear(img, [224, 224]);
    
    // Normalize pixel values to [-1, 1]
    const normalized = resized.div(127.5).sub(1);
    
    // Expand dimensions to create a batch of 1 image
    const batched = normalized.expandDims(0);
    
    // Run inference
    const predictions = model.predict(batched) as tf.Tensor;
    
    // Get results 
    const data = predictions.dataSync();
    
    // These indices correspond to classes that might indicate fire/flame
    // MobileNet class indices:
    // 917: matchstick
    // 474: lighter
    // 475: candle
    const flameRelatedIndices = [917, 474, 475];
    
    // Sum probabilities of flame-related classes
    let totalFlameConfidence = 0;
    for (const idx of flameRelatedIndices) {
      totalFlameConfidence += data[idx];
    }
    
    // Apply sensitivity adjustment
    const adjustedConfidence = totalFlameConfidence * (1 + (sensitivityThreshold - 0.5));
    
    return {
      detected: adjustedConfidence >= sensitivityThreshold,
      confidence: Math.min(adjustedConfidence, 1)
    };
  });
}
