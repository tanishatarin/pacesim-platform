// import { useEffect, useState, useMemo } from "react";
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
//   initial: 1,
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

//   // Define the base complex with physiologically accurate wave morphology
//   const baseComplex = [
//     { x: 0, y: 0 }, // Baseline
//     { x: 1, y: 0.1 }, // P wave start
//     { x: 2, y: 0.25 }, // P wave peak
//     { x: 3, y: 0.1 }, // P wave end
//     { x: 4, y: 0 }, // PR segment
//     { x: 5, y: -0.2 }, // Q wave
//     { x: 6, y: 1.5 }, // R wave peak (normal amplitude around 1.5mV)
//     { x: 7, y: -0.4 }, // S wave
//     { x: 8, y: -0.1 }, // J point
//     { x: 9, y: 0 }, // ST segment
//     { x: 10, y: 0.1 }, // T wave start
//     { x: 11, y: 0.4 }, // T wave peak
//     { x: 12, y: 0.1 }, // T wave end
//     { x: 13, y: 0 }, // Baseline
//     { x: 14, y: 0 }, // Baseline
//     { x: 15, y: 0 }, // Baseline
//   ];

//   // Generate points with stable dependencies and better error handling
//   const generatedPoints = useMemo(() => {
//     try {
//       console.log('🔄 Regenerating ECG points for:', { mode, rate, aOutput, vOutput, sensitivity });

//       let points: { x: number; y: number }[] = [];

//       switch (mode) {
//         case "sensitivity":
//           points = generateBradycardiaPoints({ rate, aOutput, vOutput, sensitivity });
//           break;
//         case "oversensing":
//           points = generateOversensingPoints();
//           break;
//         case "undersensing":
//           points = generateUndersensingPoints();
//           break;
//         case "capture_module":
//           points = generateCaptureModulePoints({ rate, aOutput, vOutput, sensitivity });
//           break;
//         case "failure_to_capture":
//           points = generateFailureToCapturePoints({ rate, aOutput, vOutput, sensitivity });
//           break;
//         default:
//           points = generateNormalPacingPoints({ rate, aOutput, vOutput, sensitivity });
//           break;
//       }

//       // Ensure we have enough points for smooth animation
//       if (points.length < 300) {
//         const originalPoints = [...points];
//         const lastX = points[points.length - 1]?.x || 0;
        
//         // Extend the waveform by repeating the pattern
//         for (let i = 0; i < 3; i++) {
//           originalPoints.forEach((point, index) => {
//             points.push({
//               x: lastX + (i + 1) * 400 + point.x,
//               y: point.y
//             });
//           });
//         }
//       }

//       return points;
//     } catch (error) {
//       console.error('Error generating ECG points:', error);
//       // Return fallback pattern
//       return Array.from({ length: 200 }, (_, i) => ({
//         x: i * 2,
//         y: Math.sin(i * 0.1) * 0.1
//       }));
//     }
//   }, [rate, aOutput, vOutput, sensitivity, mode]);

//   // Simple animation effect - back to basics like original
//   useEffect(() => {
//     if (generatedPoints.length === 0) return;

//     // Initialize with first 100 points
//     setData(generatedPoints.slice(0, 100));
//     setCurrentIndex(100);

//     const speedMultiplier = speedMultipliers[mode] || 1;
//     const updateInterval = Math.max(40, (60000 / rate / baseComplex.length) * speedMultiplier);

//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => {
//         const newIndex = (prevIndex + 1) % generatedPoints.length;
//         setData((prevData) => {
//           const newData = [...prevData.slice(1), generatedPoints[newIndex]];
//           return newData;
//         });
//         return newIndex;
//       });
//     }, updateInterval);

//     return () => clearInterval(interval);
//   }, [generatedPoints, rate, mode, baseComplex.length]);

//   return (
//     <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
//       {/* ECG Grid Background */}
//       <div className="absolute inset-0 z-0">
//         <svg width="100%" height="100%">
//           <defs>
//             <pattern
//               id="smallGrid"
//               width="4"
//               height="4"
//               patternUnits="userSpaceOnUse"
//             >
//               <path
//                 d="M 4 0 L 0 0 0 4"
//                 fill="none"
//                 stroke="red"
//                 strokeWidth="0.2"
//                 opacity="0.3"
//               />
//             </pattern>
//             <pattern
//               id="bigGrid"
//               width="20"
//               height="20"
//               patternUnits="userSpaceOnUse"
//             >
//               <rect width="20" height="20" fill="url(#smallGrid)" />
//               <path
//                 d="M 20 0 L 0 0 0 20"
//                 fill="none"
//                 stroke="red"
//                 strokeWidth="0.8"
//                 opacity="0.5"
//               />
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
//             <YAxis domain={[-2, 5]} hide />
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
//     </div>
//   );
// };

// export default ECGVisualizer;

import { useEffect, useState, useMemo } from "react";
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
} from "./ecgModes";

interface ECGVisualizerProps {
  rate?: number;
  aOutput?: number;
  vOutput?: number;
  sensitivity?: number;
  mode?: "sensitivity" | "oversensing" | "undersensing" | "capture_module" | "failure_to_capture";
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
  // 🔥 BACK TO ORIGINAL SIMPLE STATE - NO REFS, NO COMPLEX LOGIC
  const [data, setData] = useState<{ x: number; y: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ SAME AS ORIGINAL - Stable points generation
  const points = useMemo(() => {
    console.log('🔄 Regenerating ECG points for:', { mode, rate, aOutput, vOutput, sensitivity });
    
    let generatedPoints: { x: number; y: number }[] = [];

    switch (mode) {
      case "sensitivity":
        generatedPoints = generateBradycardiaPoints({ rate, aOutput, vOutput, sensitivity });
        break;
      case "oversensing":
        generatedPoints = generateOversensingPoints();
        break;
      case "undersensing":
        generatedPoints = generateUndersensingPoints();
        break;
      case "capture_module":
        generatedPoints = generateCaptureModulePoints({ rate, aOutput, vOutput, sensitivity });
        break;
      case "failure_to_capture":
        generatedPoints = generateFailureToCapturePoints({ rate, aOutput, vOutput, sensitivity });
        break;
      default:
        generatedPoints = generateNormalPacingPoints({ rate, aOutput, vOutput, sensitivity });
        break;
    }

    // Ensure we have enough points for smooth animation
    if (generatedPoints.length < 300) {
      const originalPoints = [...generatedPoints];
      const lastX = generatedPoints[generatedPoints.length - 1]?.x || 0;
      
      for (let i = 0; i < 3; i++) {
        originalPoints.forEach((point) => {
          generatedPoints.push({
            x: lastX + (i + 1) * 400 + point.x,
            y: point.y
          });
        });
      }
    }

    return generatedPoints;
  }, [rate, aOutput, vOutput, sensitivity, mode]);

  // 🔥 BACK TO ORIGINAL SIMPLE ANIMATION - EXACTLY LIKE YOUR OLD APP
  useEffect(() => {
    if (points.length === 0) return;

    // Initialize with first 100 points (same as original)
    setData(points.slice(0, 100));
    setCurrentIndex(100);

    const speedMultiplier = speedMultipliers[mode] || 1;
    
    // ✅ SAME CALCULATION AS ORIGINAL
    const updateInterval = Math.max(40, (60000 / rate / 16) * speedMultiplier);

    // 🔥 SIMPLE INTERVAL - EXACTLY LIKE ORIGINAL
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % points.length;
        
        setData((prevData) => {
          // ✅ SAME SLIDING WINDOW LOGIC AS ORIGINAL
          const newData = [...prevData.slice(1), points[newIndex]];
          return newData;
        });
        
        return newIndex;
      });
    }, updateInterval);

    // ✅ SAME CLEANUP AS ORIGINAL
    return () => clearInterval(interval);
  }, [points, rate, mode]);

  return (
    <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
      {/* ✅ SAME GRID BACKGROUND AS ORIGINAL */}
      <div className="absolute inset-0 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
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

      {/* ✅ SAME RECHARTS SETUP AS ORIGINAL */}
      <div className="absolute inset-0 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="x"
              tick={false}
              axisLine={false}
              stroke="transparent"
              allowDataOverflow={true}
              interval={0}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis
              domain={[-2, 5]}
              tick={false}
              axisLine={false}
              stroke="transparent"
              allowDataOverflow={true}
              padding={{ top: 0, bottom: 0 }}
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