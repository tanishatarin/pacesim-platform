// import { useEffect, useRef, useState, useMemo } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   generateNormalPacingPoints,
//   generateBradycardiaPoints,
//   generateOversensingPoints,
//   generateUndersensingPoints,
//   generateCaptureModulePoints,
//   generateFailureToCapturePoints,
// } from "@/components/ecgModes";

// interface ECGVisualizerProps {
//   rate?: number;
//   aOutput?: number;
//   vOutput?: number;
//   sensitivity?: number;
//   mode?: "sensitivity" | "oversensing" | "undersensing" | "capture_module" | "failure_to_capture";
// }

// const speedMultipliers: Record<string, number> = {
//   sensitivity: 1,
//   oversensing: 1,
//   undersensing: 1,
//   capture_module: 2.5,
//   failure_to_capture: 2,
// };

// const ECGVisualizer = ({
//   rate = 150,
//   aOutput = 5,
//   vOutput = 5,
//   sensitivity = 1,
//   mode = "sensitivity",
// }: ECGVisualizerProps) => {
//   const [data, setData] = useState<{ x: number; y: number }[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const pointsRef = useRef<{ x: number; y: number }[]>([]); // hold stable reference

//   // Only generate points when inputs change
//   const generatedPoints = useMemo(() => {
//     switch (mode) {
//       case "sensitivity":
//         return generateBradycardiaPoints({ rate, aOutput, vOutput, sensitivity });
//       case "oversensing":
//         return generateOversensingPoints();
//       case "undersensing":
//         return generateUndersensingPoints();
//       case "capture_module":
//         return generateCaptureModulePoints({ rate, aOutput, vOutput, sensitivity });
//       case "failure_to_capture":
//         return generateFailureToCapturePoints({ rate, aOutput, vOutput, sensitivity });
//       default:
//         return generateNormalPacingPoints({ rate, aOutput, vOutput, sensitivity });
//     }
//   }, [rate, aOutput, vOutput, sensitivity, mode]);

//   // Set the ref and reset state whenever the waveform changes
//   useEffect(() => {
//     pointsRef.current = generatedPoints;
//     setData(generatedPoints.slice(0, 100));
//     setCurrentIndex(100);
//   }, [generatedPoints]);

//   // Interval logic for animation
//   useEffect(() => {
//     const speedMultiplier = speedMultipliers[mode] || 1;
//     const updateInterval = (60000 / rate / 15) * speedMultiplier;

//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => {
//         const newIndex = (prevIndex + 1) % pointsRef.current.length;
//         setData((prevData) => [
//           ...prevData.slice(1),
//           pointsRef.current[newIndex],
//         ]);
//         return newIndex;
//       });
//     }, updateInterval);

//     return () => clearInterval(interval);
//   }, [rate, mode]);

//   return (
//     <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
//       <div className="absolute inset-0 z-0">
//         {/* Red ECG Grid */}
//         <svg width="100%" height="100%">
//           <defs>
//             <pattern id="smallGrid" width="4" height="4" patternUnits="userSpaceOnUse">
//               <path d="M 4 0 L 0 0 0 4" fill="none" stroke="red" strokeWidth="0.2" opacity="0.3" />
//             </pattern>
//             <pattern id="bigGrid" width="20" height="20" patternUnits="userSpaceOnUse">
//               <rect width="20" height="20" fill="url(#smallGrid)" />
//               <path d="M 20 0 L 0 0 0 20" fill="none" stroke="red" strokeWidth="0.8" opacity="0.5" />
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#bigGrid)" />
//         </svg>
//       </div>

//       <div className="absolute inset-0 z-10">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={data}
//             margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
//           >
//             <XAxis dataKey="x" hide />
//             <YAxis domain={[-2, 5]} hide />
//             <Line
//               type="linear"
//               dataKey="y"
//               stroke="#00ff00"
//               strokeWidth={2}
//               dot={false}
//               isAnimationActive={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default ECGVisualizer;

// import { useEffect, useRef, useState, useMemo } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   generateNormalPacingPoints,
//   generateBradycardiaPoints,
//   generateOversensingPoints,
//   generateUndersensingPoints,
//   generateCaptureModulePoints,
//   generateFailureToCapturePoints,
// } from "./ecgModes";

// interface ECGVisualizerProps {
//   rate?: number;
//   aOutput?: number;
//   vOutput?: number;
//   sensitivity?: number;
//   mode?: "sensitivity" | "oversensing" | "undersensing" | "capture_module" | "failure_to_capture";
// }

// const speedMultipliers: Record<string, number> = {
//   sensitivity: 1,
//   oversensing: 1,
//   undersensing: 1,
//   capture_module: 2.5,
//   failure_to_capture: 2,
// };

// const ECGVisualizer = ({
//   rate = 150,
//   aOutput = 5,
//   vOutput = 5,
//   sensitivity = 1,
//   mode = "sensitivity",
// }: ECGVisualizerProps) => {
//   const [data, setData] = useState<{ x: number; y: number }[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const pointsRef = useRef<{ x: number; y: number }[]>([]);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   // Generate points only when inputs actually change
//   const generatedPoints = useMemo(() => {
//     console.log('🔄 Regenerating ECG points for:', { mode, rate, aOutput, vOutput, sensitivity });

//     switch (mode) {
//       case "sensitivity":
//         return generateBradycardiaPoints({ rate, aOutput, vOutput, sensitivity });
//       case "oversensing":
//         return generateOversensingPoints();
//       case "undersensing":
//         return generateUndersensingPoints();
//       case "capture_module":
//         return generateCaptureModulePoints({ rate, aOutput, vOutput, sensitivity });
//       case "failure_to_capture":
//         return generateFailureToCapturePoints({ rate, aOutput, vOutput, sensitivity });
//       default:
//         return generateNormalPacingPoints({ rate, aOutput, vOutput, sensitivity });
//     }
//   }, [rate, aOutput, vOutput, sensitivity, mode]);

//   // Update ref and reset animation when points change
//   useEffect(() => {
//     console.log('📊 Updating ECG data, points length:', generatedPoints.length);

//     // Clear existing interval
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }

//     // Update points reference
//     pointsRef.current = generatedPoints;

//     // Reset display data
//     const initialData = generatedPoints.slice(0, 100);
//     setData(initialData);
//     setCurrentIndex(100);

//     // If we have enough points, start animation
//     if (generatedPoints.length > 100) {
//       const speedMultiplier = speedMultipliers[mode] || 1;
//       const baseInterval = 150; // Base update interval in ms
//       const updateInterval = Math.max(50, baseInterval * speedMultiplier);

//       console.log('⏱️  Starting ECG animation, interval:', updateInterval, 'ms');

//       const id = setInterval(() => {
//         setCurrentIndex((prevIndex) => {
//           const newIndex = (prevIndex + 1) % pointsRef.current.length;

//           setData((prevData) => {
//             // Keep last 99 points + add new point
//             const newData = [...prevData.slice(-99), pointsRef.current[newIndex]];
//             return newData;
//           });

//           return newIndex;
//         });
//       }, updateInterval);

//       intervalRef.current = id;
//     }

//     // Cleanup function
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };
//   }, [generatedPoints, mode]); // Only depend on generatedPoints and mode

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, []);

//   return (
//     <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
//       {/* ECG Grid Background */}
//       <div className="absolute inset-0 z-0">
//         <svg width="100%" height="100%">
//           <defs>
//             <pattern id="smallGrid" width="4" height="4" patternUnits="userSpaceOnUse">
//               <path d="M 4 0 L 0 0 0 4" fill="none" stroke="red" strokeWidth="0.2" opacity="0.3" />
//             </pattern>
//             <pattern id="bigGrid" width="20" height="20" patternUnits="userSpaceOnUse">
//               <rect width="20" height="20" fill="url(#smallGrid)" />
//               <path d="M 20 0 L 0 0 0 20" fill="none" stroke="red" strokeWidth="0.8" opacity="0.5" />
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#bigGrid)" />
//         </svg>
//       </div>

//       {/* ECG Waveform */}
//       <div className="absolute inset-0 z-10">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={data}
//             margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
//           >
//             <XAxis
//               dataKey="x"
//               hide
//               type="number"
//               domain={['dataMin', 'dataMax']}
//             />
//             <YAxis
//               domain={[-2, 5]}
//               hide
//             />
//             <Line
//               type="linear"
//               dataKey="y"
//               stroke="#00ff00"
//               strokeWidth={2}
//               dot={false}
//               isAnimationActive={false}
//               connectNulls={true}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Debug Info (remove in production) */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
//           Points: {pointsRef.current.length} | Index: {currentIndex} | Data: {data.length}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ECGVisualizer;

import { useEffect, useRef, useState, useMemo } from "react";
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
  mode?:
    | "sensitivity"
    | "oversensing"
    | "undersensing"
    | "capture_module"
    | "failure_to_capture";
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
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Generate points only when inputs actually change
  const generatedPoints = useMemo(() => {
    // Only log once, even in StrictMode
    if (!isInitializedRef.current) {
      console.log("🔄 Regenerating ECG points for:", {
        mode,
        rate,
        aOutput,
        vOutput,
        sensitivity,
      });
    }

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
        return generateNormalPacingPoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
        });
    }
  }, [rate, aOutput, vOutput, sensitivity, mode]);

  // Update ref and reset animation when points change
  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (isInitializedRef.current && pointsRef.current.length > 0) {
      return;
    }

    console.log("📊 Updating ECG data, points length:", generatedPoints.length);

    // Clear existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Update points reference
    pointsRef.current = generatedPoints;

    // Reset display data
    const initialData = generatedPoints.slice(0, 100);
    setData(initialData);
    setCurrentIndex(100);

    // Only start animation if we have enough points
    if (generatedPoints.length > 100) {
      const speedMultiplier = speedMultipliers[mode] || 1;
      const baseInterval = 150;
      const updateInterval = Math.max(50, baseInterval * speedMultiplier);

      console.log(
        "⏱️  Starting ECG animation, interval:",
        updateInterval,
        "ms",
      );

      const id = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % pointsRef.current.length;

          setData((prevData) => {
            const newData = [
              ...prevData.slice(-99),
              pointsRef.current[newIndex],
            ];
            return newData;
          });

          return newIndex;
        });
      }, updateInterval);

      intervalRef.current = id;
    }

    isInitializedRef.current = true;

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [generatedPoints, mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      isInitializedRef.current = false;
    };
  }, []);

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
              domain={["dataMin", "dataMax"]}
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
    </div>
  );
};

export default ECGVisualizer;
