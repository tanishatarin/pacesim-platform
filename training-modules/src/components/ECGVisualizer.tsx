import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  generateNormalPacingPoints,
  generateBradycardiaPoints,
  generateOversensingPoints,
  generateUndersensingPoints,
  generateCaptureModulePoints,
  generateFailureToCapturePoints,
} from "./ecgModes";

interface ECGVisualizerProps {
  rate?: number;
  aOutput?: number;
  vOutput?: number;
  sensitivity?: number;
  mode?: "sensitivity" | "oversensing" | "undersensing" | "capture_module" | "failure_to_capture";
}

const ECGVisualizer = ({
  rate = 150,
  aOutput = 5,
  vOutput = 5,
  sensitivity = 1,
  mode = "sensitivity",
}: ECGVisualizerProps) => {
  const [data, setData] = useState<{ x: number; y: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use refs to maintain stable references and prevent unnecessary re-renders
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const animationStateRef = useRef({ 
    isRunning: false, 
    lastParams: { rate, aOutput, vOutput, sensitivity, mode },
    shouldRestart: false
  });
  
  // Stable window size for smooth animation
  const WINDOW_SIZE = 120;
  const MIN_UPDATE_INTERVAL = 40; // Faster updates for smoother animation

  // Generate points with stable dependencies and better error handling
  const generatedPoints = useMemo(() => {
    try {
      console.log('🔄 Regenerating ECG points for:', { mode, rate, aOutput, vOutput, sensitivity });

      let points: { x: number; y: number }[] = [];

      switch (mode) {
        case "sensitivity":
          points = generateBradycardiaPoints({ rate, aOutput, vOutput, sensitivity });
          break;
        case "oversensing":
          points = generateOversensingPoints();
          break;
        case "undersensing":
          points = generateUndersensingPoints();
          break;
        case "capture_module":
          points = generateCaptureModulePoints({ rate, aOutput, vOutput, sensitivity });
          break;
        case "failure_to_capture":
          points = generateFailureToCapturePoints({ rate, aOutput, vOutput, sensitivity });
          break;
        default:
          points = generateNormalPacingPoints({ rate, aOutput, vOutput, sensitivity });
          break;
      }

      // Ensure we have enough points for smooth animation
      if (points.length < 300) {
        const originalPoints = [...points];
        const lastX = points[points.length - 1]?.x || 0;
        
        // Extend the waveform by repeating the pattern
        for (let i = 0; i < 3; i++) {
          originalPoints.forEach((point, index) => {
            points.push({
              x: lastX + (i + 1) * 400 + point.x,
              y: point.y
            });
          });
        }
      }

      // Add some baseline noise for realism (subtle)
      points = points.map(point => ({
        ...point,
        y: point.y + (Math.random() - 0.5) * 0.02 // Very subtle noise
      }));

      return points;
    } catch (error) {
      console.error('Error generating ECG points:', error);
      // Return fallback pattern
      return Array.from({ length: 200 }, (_, i) => ({
        x: i * 2,
        y: Math.sin(i * 0.1) * 0.1
      }));
    }
  }, [rate, aOutput, vOutput, sensitivity, mode]);

  // Smooth animation controller with better cleanup
  const startAnimation = useCallback((points: { x: number; y: number }[]) => {
    if (animationStateRef.current.isRunning) {
      stopAnimation(); // Stop current animation first
    }

    console.log('🎬 Starting ECG animation with', points.length, 'points');
    
    pointsRef.current = points;
    animationStateRef.current.isRunning = true;
    animationStateRef.current.shouldRestart = false;

    // Initialize display with first window of data
    const initialData = points.slice(0, WINDOW_SIZE);
    setData(initialData);
    setCurrentIndex(WINDOW_SIZE);

    if (points.length <= WINDOW_SIZE) {
      console.log('⚠️ Not enough points for animation');
      return;
    }

    // Calculate smooth update interval based on rate with better scaling
    const baseInterval = Math.max(MIN_UPDATE_INTERVAL, 200 - (rate * 0.8));
    
    const animateStep = () => {
      // Check if animation should continue
      if (!animationStateRef.current.isRunning || animationStateRef.current.shouldRestart) {
        return;
      }

      setCurrentIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % points.length;
        
        setData(prevData => {
          // Create smooth sliding window with better performance
          const newPoint = points[newIndex];
          if (!newPoint) return prevData;
          
          const newData = [...prevData.slice(1), newPoint];
          return newData;
        });

        return newIndex;
      });

      // Schedule next animation frame
      if (animationStateRef.current.isRunning && !animationStateRef.current.shouldRestart) {
        intervalRef.current = setTimeout(animateStep, baseInterval);
      }
    };

    // Start the animation loop
    intervalRef.current = setTimeout(animateStep, baseInterval);
  }, []);

  const stopAnimation = useCallback(() => {
    console.log('⏹️ Stopping ECG animation');
    animationStateRef.current.isRunning = false;
    animationStateRef.current.shouldRestart = true;
    
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle parameter changes smoothly with debouncing
  useEffect(() => {
    const currentParams = { rate, aOutput, vOutput, sensitivity, mode };
    const lastParams = animationStateRef.current.lastParams;
    
    // Check if parameters actually changed
    const paramsChanged = Object.keys(currentParams).some(
      key => currentParams[key as keyof typeof currentParams] !== 
            lastParams[key as keyof typeof lastParams]
    );

    if (!paramsChanged && animationStateRef.current.isRunning && !animationStateRef.current.shouldRestart) {
      return; // No change, keep current animation
    }

    console.log('📊 Parameters changed, updating ECG animation');
    
    // Update stored parameters
    animationStateRef.current.lastParams = currentParams;
    
    // Stop current animation
    stopAnimation();
    
    // Start new animation with updated points after small delay
    if (generatedPoints.length > 0) {
      const delay = animationStateRef.current.isRunning ? 150 : 50; // Longer delay if replacing active animation
      
      setTimeout(() => {
        if (!animationStateRef.current.shouldRestart) return; // Check if we should still restart
        startAnimation(generatedPoints);
      }, delay);
    }

    return () => {
      stopAnimation();
    };
  }, [generatedPoints, rate, aOutput, vOutput, sensitivity, mode, startAnimation, stopAnimation]);

  // Initialize animation on mount
  useEffect(() => {
    if (!isInitializedRef.current && generatedPoints.length > 0) {
      isInitializedRef.current = true;
      startAnimation(generatedPoints);
    }

    return () => {
      stopAnimation();
      isInitializedRef.current = false;
    };
  }, [generatedPoints, startAnimation, stopAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return (
    <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
      {/* ECG Grid Background */}
      <div className="absolute inset-0 z-0">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="smallGrid"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 4 0 L 0 0 0 4"
                fill="none"
                stroke="red"
                strokeWidth="0.2"
                opacity="0.3"
              />
            </pattern>
            <pattern
              id="bigGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect width="20" height="20" fill="url(#smallGrid)" />
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="red"
                strokeWidth="0.8"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bigGrid)" />
        </svg>
      </div>

      {/* ECG Waveform */}
      <div className="absolute inset-0 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="x"
              hide
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis domain={[-2, 5]} hide />
            <Line
              type="linear"
              dataKey="y"
              stroke="#00ff00"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status indicator */}
      <div className="absolute top-2 right-2 text-xs text-green-400 bg-black/50 px-2 py-1 rounded">
        {animationStateRef.current.isRunning ? '⚡ Live' : '⏸️ Paused'}
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
          Points: {pointsRef.current.length} | Mode: {mode} | Rate: {rate}
        </div>
      )}
    </div>
  );
};

export default ECGVisualizer;