import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  generateBradycardiaPoints,
  generateOversensingPoints,
  generateUndersensingPoints,
  generateCaptureModulePoints,
  generateFailureToCapturePoints,
} from "../components/ecgModes";

interface ECGVisualizerProps {
  rate?: number;
  aOutput?: number;
  vOutput?: number;
  sensitivity?: number;
  mode?:
  | "sensitivity"
  | "oversensing"
  | "undersensing"
  | "capture_module"
  | "failure_to_capture";
}

const speedMultipliers: Record<string, number> = {
  initial: 1,
  sensitivity: 1,
  oversensing: 1,
  undersensing: 1,
  capture_module: 2.5,
  failure_to_capture: 2,
};

const ECGVisualizer = ({
  rate = 150,
  aOutput = 5,
  vOutput = 5,
  sensitivity = 1,
  mode = "sensitivity",
}: ECGVisualizerProps) => {
  type Point = { x: number; y: number };

  const [data, setData] = useState<Point[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate multiple complexes with amplitude adjustments
  const generatePoints = (): Point[] => {
    switch (mode) {
      case "sensitivity":
        return generateBradycardiaPoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
        });

      case "oversensing":
        return generateOversensingPoints();

      case "undersensing":
        return generateUndersensingPoints();
        
      case "capture_module":
        return generateCaptureModulePoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
        });

      case "failure_to_capture":
        return generateFailureToCapturePoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
        });
      
      default:
        return generateBradycardiaPoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
        });
    }
  };

  const points = useMemo(() => 
    generatePoints(), 
    [rate, aOutput, vOutput, sensitivity, mode]
  );

  useEffect(() => {
    // Initialize with first 100 points
    setData(points.slice(0, 100));
    setCurrentIndex(100);
  }, [points]);

  useEffect(() => {
    const speedMultiplier = speedMultipliers[mode] || 1;
    const updateInterval = 50; // Update every 50ms for smooth animation
  
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % points.length;
        setData((prevData) => {
          // Keep last 100 points for display
          const newData = [...prevData.slice(-99), points[newIndex]];
          return newData;
        });
        return newIndex;
      });
    }, updateInterval * speedMultiplier);
  
    return () => clearInterval(interval);
  }, [points, mode]);

  return (
    <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
      <div className="absolute inset-0 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Small 1mm grid */}
            <pattern id="smallGrid" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 4 0 L 0 0 0 4" fill="none" stroke="red" strokeWidth="0.2" opacity="0.3" />
            </pattern>

            {/* Big 5mm grid */}
            <pattern id="bigGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="url(#smallGrid)" />
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="red" strokeWidth="0.8" opacity="0.5" />
            </pattern>
          </defs>

          {/* Fill background */}
          <rect width="100%" height="100%" fill="url(#bigGrid)" />
        </svg>
      </div>

      <div className="absolute inset-0 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="x"
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={false}
              axisLine={false}
              stroke="transparent"
            />
            <YAxis
              domain={[-2, 5]}
              tick={false}
              axisLine={false}
              stroke="transparent"
            />
            <Line
              type="linear"
              dataKey="y"
              stroke="#00ff00"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ECGVisualizer;