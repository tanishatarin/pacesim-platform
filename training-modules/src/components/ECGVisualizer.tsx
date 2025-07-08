// import { useEffect, useState, useMemo } from "react";
// import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
// import {
//   generateNormalPacingPoints,
//   generateBradycardiaPoints,
//   generateAtrialFibrillationPoints,
//   generateThirdDegreeBlockPoints,
// } from "@/components/ecgModes";
// import type { ModuleStep } from "@/types/module";

// interface ECGVisualizerProps {
//   rate?: number;
//   aOutput?: number;
//   vOutput?: number;
//   sensitivity?: number;
//   mode?: "sensitivity" | "third_degree_block" | "atrial_fibrillation";
//   // ADD THESE PROPS TO FIX THE PHASE DETECTION:
//   currentStep?: ModuleStep | null;
//   currentStepIndex?: number;
//   quizCompleted?: boolean; // To force quiz mode when false
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
//   currentStep = null,
//   currentStepIndex = 0,
//   quizCompleted = false, // Default to quiz mode
// }: ECGVisualizerProps) => {
//   type Point = { x: number; y: number };

//   const [data, setData] = useState<Point[]>([]);
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

//   // Generate multiple complexes with amplitude adjustments
//   const generatePoints = (): Point[] => {
//     console.log("🎯 ECG generatePoints called with:", {
//       mode,
//       rate,
//       aOutput,
//       vOutput,
//       sensitivity,
//       currentStep: currentStep?.id || "none",
//       currentStepIndex,
//       quizCompleted,
//     });

//     let result: Point[] = [];

//     switch (mode) {
//       case "sensitivity":
//         console.log("📊 Calling generateBradycardiaPoints...");
//         result = generateBradycardiaPoints({
//           rate,
//           aOutput,
//           vOutput,
//           sensitivity,
//           // PASS THE STEP INFO TO FIX PHASE DETECTION:
//           currentStep: quizCompleted ? currentStep : null, // Force quiz mode if quiz not completed
//           currentStepIndex: quizCompleted ? currentStepIndex : 0,
//         });
//         break;

//       case "third_degree_block":
//         console.log("📊 Generating third degree block pattern...");
//         result = generateThirdDegreeBlockPoints({
//           rate,
//           aOutput,
//           vOutput,
//           sensitivity,
//           currentStep: quizCompleted ? currentStep : null,
//           currentStepIndex: quizCompleted ? currentStepIndex : 0,
//         });
//         break;

//       case "atrial_fibrillation":
//         console.log("📊 Generating atrial fibrillation pattern...");
//         result = generateAtrialFibrillationPoints({
//           rate,
//           aOutput,
//           vOutput,
//           sensitivity,
//           currentStep: quizCompleted ? currentStep : null,
//           currentStepIndex: quizCompleted ? currentStepIndex : 0,
//         });
//         break;

//       default:
//         console.log(
//           "⚠️ Unknown ECG mode:",
//           mode,
//           "- using bradycardia as fallback",
//         );
//         result = generateBradycardiaPoints({
//           rate,
//           aOutput,
//           vOutput,
//           sensitivity,
//           currentStep: quizCompleted ? currentStep : null,
//           currentStepIndex: quizCompleted ? currentStepIndex : 0,
//         });
//         break;
//     }

//     console.log("📈 Generated points:", {
//       count: result.length,
//       firstFew: result.slice(0, 3),
//       lastFew: result.slice(-3),
//     });

//     return result;
//   };

//   const points = useMemo(
//     () => generatePoints(),
//     [rate, aOutput, vOutput, sensitivity, mode, currentStep?.id, currentStepIndex, quizCompleted],
//   );

//   useEffect(() => {
//     setData(points.slice(0, 100));
//     const speedMultiplier = speedMultipliers[mode] || 1; // fallback = normal speed

//     const updateInterval =
//       (60000 / rate / baseComplex.length) * speedMultiplier;

//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => {
//         const newIndex = (prevIndex + 1) % points.length;
//         setData((prevData) => {
//           const newData = [...prevData.slice(1), points[newIndex]];
//           return newData;
//         });
//         return newIndex;
//       });
//     }, updateInterval);

//     return () => clearInterval(interval);
//   }, [points, rate, mode]);

//   return (
//     <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
//       <div className="absolute inset-0 z-0">
//         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             {/* Small 1mm grid */}
//             <pattern
//               id="smallGrid"
//               width="4"
//               height="4"
//               patternUnits="userSpaceOnUse"
//             >
//               <path
//                 d="M 4 0 L 0 0 0 4"
//                 fill="none"
//                 stroke="#333"
//                 strokeWidth="0.5"
//               />
//             </pattern>

//             {/* Large 5mm grid */}
//             <pattern
//               id="largeGrid"
//               width="20"
//               height="20"
//               patternUnits="userSpaceOnUse"
//             >
//               <rect width="20" height="20" fill="url(#smallGrid)" />
//               <path
//                 d="M 20 0 L 0 0 0 20"
//                 fill="none"
//                 stroke="#666"
//                 strokeWidth="1"
//               />
//             </pattern>
//           </defs>

//           <rect width="100%" height="100%" fill="url(#largeGrid)" />
//         </svg>
//       </div>

//       <div className="relative z-10 h-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
//             <XAxis hide />
//             <YAxis hide domain={[-2, 2]} />
//             <Line
//               type="linear"
//               dataKey="y"
//               stroke="#00ff00"
//               strokeWidth={2}
//               dot={false}
//               connectNulls={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default ECGVisualizer;












// debug version 


import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  generateNormalPacingPoints,
  generateBradycardiaPoints,
  generateAtrialFibrillationPoints,
  generateThirdDegreeBlockPoints,
} from "@/components/ecgModes";
import type { ModuleStep } from "@/types/module";

interface ECGVisualizerProps {
  rate?: number;
  aOutput?: number;
  vOutput?: number;
  sensitivity?: number;
  mode?: "sensitivity" | "third_degree_block" | "atrial_fibrillation";
  currentStep?: ModuleStep | null;
  currentStepIndex?: number;
  quizCompleted?: boolean;
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
  currentStep = null,
  currentStepIndex = 0,
  quizCompleted = false,
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
      currentStep: currentStep?.id || "none",
      currentStepIndex,
      quizCompleted,
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
          currentStep: quizCompleted ? currentStep : null,
          currentStepIndex: quizCompleted ? currentStepIndex : 0,
        });
        break;

      case "third_degree_block":
        console.log("📊 Generating third degree block pattern...");
        result = generateThirdDegreeBlockPoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
          currentStep: quizCompleted ? currentStep : null,
          currentStepIndex: quizCompleted ? currentStepIndex : 0,
        });
        break;

      case "atrial_fibrillation":
        console.log("📊 Generating atrial fibrillation pattern...");
        result = generateAtrialFibrillationPoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
          currentStep: quizCompleted ? currentStep : null,
          currentStepIndex: quizCompleted ? currentStepIndex : 0,
        });
        break;

      default:
        console.log(
          "⚠️ Unknown ECG mode:",
          mode,
          "- using bradycardia as fallback",
        );
        result = generateBradycardiaPoints({
          rate,
          aOutput,
          vOutput,
          sensitivity,
          currentStep: quizCompleted ? currentStep : null,
          currentStepIndex: quizCompleted ? currentStepIndex : 0,
        });
        break;
    }

    console.log("📈 Generated points:", {
      count: result.length,
      firstFew: result.slice(0, 3),
      lastFew: result.slice(-3),
    });

    return result;
  };

  const points = useMemo(
    () => generatePoints(),
    [rate, aOutput, vOutput, sensitivity, mode, currentStep?.id, currentStepIndex, quizCompleted],
  );

  useEffect(() => {
    // 🔥 FIX: Ensure we have enough points to avoid repetition
    const minRequiredPoints = 200; // Need enough points for smooth scrolling
    
    if (points.length < minRequiredPoints) {
      console.warn("⚠️ Not enough points generated:", points.length, "Need:", minRequiredPoints);
      // Extend the points by repeating the pattern
      const extendedPoints: Point[] = [];
      const originalLength = points.length;
      
      for (let i = 0; i < minRequiredPoints; i++) {
        const sourceIndex = i % originalLength;
        const sourcePoint = points[sourceIndex];
        extendedPoints.push({
          x: sourcePoint.x + Math.floor(i / originalLength) * 1600, // Offset repeated patterns
          y: sourcePoint.y
        });
      }
      
      console.log("✅ Extended points from", originalLength, "to", extendedPoints.length);
      setData(extendedPoints.slice(0, 100));
      
      // Use the extended points for animation
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % extendedPoints.length;
          setData((prevData) => {
            // 🔥 FIX: Ensure smooth scrolling without repetition
            const newData = [...prevData.slice(1), extendedPoints[newIndex]];
            return newData;
          });
          return newIndex;
        });
      }, 50); // Fixed fast animation speed
      
      return () => clearInterval(interval);
    } else {
      // Original logic for when we have enough points
      setData(points.slice(0, 100));
      const speedMultiplier = speedMultipliers[mode] || 1;
      const updateInterval = (60000 / rate / baseComplex.length) * speedMultiplier;

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
    }
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
                stroke="#333"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Large 5mm grid */}
            <pattern
              id="largeGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect width="20" height="20" fill="url(#smallGrid)" />
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#666"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#largeGrid)" />
        </svg>
      </div>

      <div className="relative z-10 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis hide />
            <YAxis hide domain={[-2, 2]} />
            <Line
              type="linear"
              dataKey="y"
              stroke="#00ff00"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ECGVisualizer;