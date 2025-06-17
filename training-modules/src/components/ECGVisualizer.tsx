import { useEffect, useRef, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  generateNormalPacingPoints,
  generateBradycardiaPoints,
  generateOversensingPoints,
  generateUndersensingPoints,
  generateCaptureModulePoints,
  generateFailureToCapturePoints,
} from "@/components/ecgModes";

interface ECGVisualizerProps {
  rate?: number;
  aOutput?: number;
  vOutput?: number;
  sensitivity?: number;
  mode?: "sensitivity" | "oversensing" | "undersensing" | "capture_module" | "failure_to_capture";
}

const speedMultipliers: Record<string, number> = {
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
  const [data, setData] = useState<{ x: number; y: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pointsRef = useRef<{ x: number; y: number }[]>([]); // hold stable reference

  // Only generate points when inputs change
  const generatedPoints = useMemo(() => {
    switch (mode) {
      case "sensitivity":
        return generateBradycardiaPoints({ rate, aOutput, vOutput, sensitivity });
      case "oversensing":
        return generateOversensingPoints();
      case "undersensing":
        return generateUndersensingPoints();
      case "capture_module":
        return generateCaptureModulePoints({ rate, aOutput, vOutput, sensitivity });
      case "failure_to_capture":
        return generateFailureToCapturePoints({ rate, aOutput, vOutput, sensitivity });
      default:
        return generateNormalPacingPoints({ rate, aOutput, vOutput, sensitivity });
    }
  }, [rate, aOutput, vOutput, sensitivity, mode]);

  // Set the ref and reset state whenever the waveform changes
  useEffect(() => {
    pointsRef.current = generatedPoints;
    setData(generatedPoints.slice(0, 100));
    setCurrentIndex(100);
  }, [generatedPoints]);

  // Interval logic for animation
  useEffect(() => {
    const speedMultiplier = speedMultipliers[mode] || 1;
    const updateInterval = (60000 / rate / 15) * speedMultiplier;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % pointsRef.current.length;
        setData((prevData) => [
          ...prevData.slice(1),
          pointsRef.current[newIndex],
        ]);
        return newIndex;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [rate, mode]);

  return (
    <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
      <div className="absolute inset-0 z-0">
        {/* Red ECG Grid */}
        <svg width="100%" height="100%">
          <defs>
            <pattern id="smallGrid" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 4 0 L 0 0 0 4" fill="none" stroke="red" strokeWidth="0.2" opacity="0.3" />
            </pattern>
            <pattern id="bigGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="url(#smallGrid)" />
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="red" strokeWidth="0.8" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bigGrid)" />
        </svg>
      </div>

      <div className="absolute inset-0 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis dataKey="x" hide />
            <YAxis domain={[-2, 5]} hide />
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
