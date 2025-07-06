// import { useEffect, useState, useMemo } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
// } from "recharts";

// interface ECGVisualizerProps {
//   rate?: number;
//   aOutput?: number;
//   vOutput?: number;
//   sensitivity?: number;
//   mode?: string;
// }

// type Point = { x: number; y: number };

// const ECGVisualizer = ({
//   rate = 40,
//   aOutput = 5,
//   vOutput = 5,
//   sensitivity = 1,
//   mode = "sensitivity",
// }: ECGVisualizerProps) => {
//   const [data, setData] = useState<Point[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // ✅ GENERATE PROPER BRADYCARDIA - MUCH WIDER SPACING
//   const generateBradycardiaECG = (): Point[] => {
//     const points: Point[] = [];

//     // For bradycardia (30-40 BPM): MUCH wider spacing between beats
//     // 40 BPM = 1.5 seconds between beats = ~300 points at our scale
//     const beatInterval = 300; // WIDE spacing for true bradycardia
//     const totalBeats = 6; // Fewer beats to fit screen properly

//     for (let beat = 0; beat < totalBeats; beat++) {
//       const beatStart = beat * beatInterval;

//       // Generate ONE normal cardiac complex (much smaller Y values)
//       const complex = [
//         // Long baseline before P wave
//         { x: beatStart + 0, y: 0 },
//         { x: beatStart + 20, y: 0 },
//         { x: beatStart + 40, y: 0 },

//         // P wave (small upward deflection)
//         { x: beatStart + 50, y: 0.05 },
//         { x: beatStart + 55, y: 0.15 },
//         { x: beatStart + 60, y: 0.05 },
//         { x: beatStart + 65, y: 0 },

//         // PR segment (flat)
//         { x: beatStart + 80, y: 0 },
//         { x: beatStart + 100, y: 0 },

//         // QRS complex (the main spike) - SMALLER
//         { x: beatStart + 110, y: -0.1 }, // Q wave
//         { x: beatStart + 115, y: 0.8 },  // R wave (main spike)
//         { x: beatStart + 120, y: -0.2 }, // S wave
//         { x: beatStart + 125, y: 0 },    // Back to baseline

//         // ST segment
//         { x: beatStart + 140, y: 0 },
//         { x: beatStart + 160, y: 0 },

//         // T wave (small upward bump)
//         { x: beatStart + 180, y: 0.05 },
//         { x: beatStart + 190, y: 0.2 },
//         { x: beatStart + 200, y: 0.05 },
//         { x: beatStart + 210, y: 0 },

//         // LONG flat baseline until next beat (TRUE BRADYCARDIA!)
//         { x: beatStart + 230, y: 0 },
//         { x: beatStart + 250, y: 0 },
//         { x: beatStart + 270, y: 0 },
//         { x: beatStart + 290, y: 0 },
//       ];

//       points.push(...complex);
//     }

//     return points;
//   };

//   const points = useMemo(() => {
//     const generated = generateBradycardiaECG();
//     console.log(`✅ Generated bradycardia ECG: ${generated.length} points`);
//     return generated;
//   }, [rate, aOutput, vOutput]);

//   // ✅ SIMPLE SMOOTH SCROLLING - SLOWER FOR BRADYCARDIA
//   useEffect(() => {
//     if (points.length === 0) return;

//     // Start with initial window - LARGER for bradycardia
//     const windowSize = 400; // Wider window to show the spacing
//     setData(points.slice(0, windowSize));
//     setCurrentIndex(0);

//     // Scroll SLOWER for bradycardia
//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => {
//         const newIndex = (prevIndex + 2) % points.length; // Move 2 points at a time

//         // Sliding window: always show consistent amount
//         const start = newIndex;
//         const end = (newIndex + windowSize) % points.length;

//         let windowData;
//         if (end > start) {
//           windowData = points.slice(start, end);
//         } else {
//           // Handle wrap-around
//           windowData = [...points.slice(start), ...points.slice(0, end)];
//         }

//         // Normalize X values for stable display
//         const normalizedData = windowData.map((point, index) => ({
//           x: index,
//           y: point.y
//         }));

//         setData(normalizedData);
//         return newIndex;
//       });
//     }, 120); // SLOWER scroll for bradycardia

//     return () => clearInterval(interval);
//   }, [points]);

//   return (
//     <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
//       {/* ECG Grid */}
//       <div className="absolute inset-0 z-0">
//         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
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

//       {/* ECG Trace */}
//       <div className="absolute inset-0 z-10">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={data}
//             margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
//           >
//             <XAxis
//               dataKey="x"
//               tick={false}
//               axisLine={false}
//               stroke="transparent"
//               domain={[0, 400]}
//             />
//             <YAxis
//               domain={[-0.5, 1.2]}
//               tick={false}
//               axisLine={false}
//               stroke="transparent"
//             />
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

//       {/* Status */}
//       <div className="absolute top-2 left-2 text-xs text-green-400 bg-black/70 px-2 py-1 rounded">
//         Bradycardia | Rate: {rate} BPM | Points: {points.length} | Showing: {data.length}
//       </div>
//     </div>
//   );
// };

// export default ECGVisualizer;

import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  generateNormalPacingPoints,
  generateBradycardiaPoints,
  generateOversensingPoints,
  generateUndersensingPoints,
  generateCaptureModulePoints,
  generateFailureToCapturePoints,
} from "@/components/ecgModes";
import type { ModuleStep } from "@/types/module";

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

  // Define the base complex with physiologically accurate wave morphology
  const baseComplex = [
    { x: 0, y: 0 }, // Baseline
    { x: 1, y: 0.1 }, // P wave start
    { x: 2, y: 0.25 }, // P wave peak
    { x: 3, y: 0.1 }, // P wave end
    { x: 4, y: 0 }, // PR segment
    { x: 5, y: -0.2 }, // Q wave
    { x: 6, y: 1.5 }, // R wave peak (normal amplitude around 1.5mV)
    { x: 7, y: -0.4 }, // S wave
    { x: 8, y: -0.1 }, // J point
    { x: 9, y: 0 }, // ST segment
    { x: 10, y: 0.1 }, // T wave start
    { x: 11, y: 0.4 }, // T wave peak
    { x: 12, y: 0.1 }, // T wave end
    { x: 13, y: 0 }, // Baseline
    { x: 14, y: 0 }, // Baseline
    { x: 15, y: 0 }, // Baseline
  ];

  // Generate multiple complexes with amplitude adjustments
  const generatePoints = (): Point[] => {
    console.log("🎯 ECG generatePoints called with:", {
      mode,
      rate,
      aOutput,
      vOutput,
      sensitivity,
    });

    let result: Point[] = [];

    switch (mode) {
      case "sensitivity":
        console.log("📊 Calling generateBradycardiaPoints...");
        result = generateBradycardiaPoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
        });
      break;

      case "oversensing":
        console.log("📊  thinks its oversensing...");
        result = generateOversensingPoints();
        break;

      case "undersensing":
        console.log("📊  thinks its undersesning ...");
        result = generateUndersensingPoints();
        break;

      case "capture_module":
        console.log("📊  thinks its capture module ...");
        result = generateCaptureModulePoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
        });
        break;

      case "failure_to_capture":
        console.log("📊  thinks its failure to capture ...");
        result = generateFailureToCapturePoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
        });
        break;
    }
    console.log("📈 Generated points:", {
      count: result.length,
      all: result,
      firstFew: result.slice(0, 3),
      lastFew: result.slice(-3),
    });

    return result;
  };

  const points = useMemo(
    () => generatePoints(),
    [rate, aOutput, vOutput, sensitivity, mode],
  );

  useEffect(() => {
    setData(points.slice(0, 100));
    const speedMultiplier = speedMultipliers[mode] || 1; // fallback = normal speed

    const updateInterval =
      (60000 / rate / baseComplex.length) * speedMultiplier;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % points.length;
        setData((prevData) => {
          const newData = [...prevData.slice(1), points[newIndex]];
          return newData;
        });
        return newIndex;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [points, rate, mode]);

  return (
    <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
      <div className="absolute inset-0 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Small 1mm grid */}
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

            {/* Big 5mm grid */}
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

          {/* Fill background */}
          <rect width="100%" height="100%" fill="url(#bigGrid)" />
        </svg>
      </div>

      <div className="absolute inset-0 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            key={`${rate}-${aOutput}-${vOutput}-${sensitivity}-${mode}`}
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
