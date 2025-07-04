// export type Point = { x: number; y: number };

// type ECGParams = {
//   rate: number; // pacing rate in bpm
//   aOutput: number; // atrial output strength (mA)
//   vOutput: number; // ventricular output strength (mA)
//   sensitivity: number; // sensing threshold (mV)
// };

// const lerp = (start: Point, end: Point, steps: number): Point[] => {
//   const pts: Point[] = [];
//   for (let i = 0; i <= steps; i++) {
//     const t = i / steps;
//     pts.push({
//       x: start.x + (end.x - start.x) * t,
//       y: start.y + (end.y - start.y) * t,
//     });
//   }
//   return pts;
// };

// export const generateNormalPacingPoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
// }: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const baseComplexLength = 16;
//   const numberOfComplexes = 6; // Match image length
//   const complexSpacing = 200; // Add gap between each beat to reach ~1.8 sec interval

//   const baseComplex: Point[] = [
//     { x: 5, y: 0 },
//     { x: 8, y: 0 },
//     { x: 15, y: 0 },
//     { x: 18, y: 0 },
//     { x: 22, y: 0 },
//     { x: 23, y: 0 },
//     { x: 26, y: 0.088 },
//     { x: 28, y: 0.176 },
//     { x: 30, y: 0.088 },
//     { x: 32, y: 0 },
//     { x: 34, y: 0.088 },
//     { x: 35.8, y: 0 },
//     { x: 36, y: 1.5 },
//     { x: 36.4, y: -0.3 },
//     { x: 37, y: 0 },
//     { x: 39, y: 0.353 },
//     { x: 41, y: 0 },
//     { x: 43, y: 0 },
//     { x: 45, y: 0 },
//     { x: 59, y: 0 },
//     { x: 60, y: 0 },
//     { x: 65, y: 0 },
//     { x: 67, y: 0 },
//     { x: 90, y: 0 },
//   ];

//   // Output scaling
//   const scaleOutput = (output: number, max = 5) =>
//     Math.min(max, Math.log(output + 1) / Math.log(6));

//   const aScale = scaleOutput(aOutput, 1);
//   const vScale = scaleOutput(vOutput, 5);

//   for (let i = 0; i < numberOfComplexes; i++) {
//     const offset = i * complexSpacing;

//     for (const pt of baseComplex) {
//       let scaledY = pt.y;

//       if (pt.x >= 1 && pt.x <= 3) {
//         scaledY *= aScale; // P wave
//       } else if (pt.x >= 5 && pt.x <= 7) {
//         scaledY *= vScale; // QRS
//       } else if (pt.x >= 10 && pt.x <= 12) {
//         scaledY *= vScale * 0.3; // T wave
//       }

//       points.push({
//         x: offset + pt.x * 5, // or 3, 4, etc. — to slow it down
//         y: scaledY,
//       });
//     }
//   }

//   return points;
// };

// export const generateBradycardiaPoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
// }: ECGParams): Point[] => {
//   const points: Point[] = [];

//   const baseSpacing = 400; // slower beat spacing
//   const fastSpacing = 200; // faster beat spacing

//   const complexSpacing = aOutput >= 4 ? fastSpacing : baseSpacing;
//   const numberOfComplexes = 4;

//   const baseComplex: Point[] = [
//     { x: 8, y: 0 },
//     { x: 15, y: 0 },
//     { x: 18, y: 0 },
//     { x: 22, y: 0 },
//     { x: 23, y: 0 },
//     { x: 26, y: 0.088 },
//     { x: 28, y: 0.176 },
//     { x: 30, y: 0.088 },
//     { x: 32, y: 0 },
//     { x: 34, y: 0.088 },
//     { x: 35.8, y: 0 },
//     { x: 36, y: 1.5 },
//     { x: 36.4, y: -0.3 },
//     { x: 37, y: 0 },
//     { x: 39, y: 0.353 },
//     { x: 41, y: 0 },
//     { x: 43, y: 0 },
//     { x: 45, y: 0 },
//     { x: 59, y: 0 },
//   ];

//   const scaleOutput = (output: number, max = 5) =>
//     Math.min(max, Math.log(output + 1) / Math.log(6));

//   const aScale = scaleOutput(aOutput, 1);
//   const vScale = scaleOutput(vOutput, 5);

//   let xCursor = 0;

//   for (let i = 0; i < numberOfComplexes; i++) {
//     // Add the base complex
//     for (const pt of baseComplex) {
//       let scaledY = pt.y;

//       if (pt.x >= 1 && pt.x <= 3) {
//         scaledY *= aScale; // P wave
//       } else if (pt.x >= 5 && pt.x <= 7) {
//         scaledY *= vScale; // QRS complex
//       } else if (pt.x >= 10 && pt.x <= 12) {
//         scaledY *= vScale * 0.3; // T wave
//       }

//       points.push({
//         x: xCursor + pt.x * 5,
//         y: scaledY,
//       });
//     }

//     // After each complex, insert a flatline segment to stretch to the next complex
//     const lastX = points[points.length - 1].x;
//     const targetNextX = (i + 1) * complexSpacing;

//     if (targetNextX > lastX) {
//       // Fill in with flatline points between end of complex and start of next
//       const gapLength = targetNextX - lastX;
//       const flatlinePoints = createFlatlineSegment(gapLength, lastX);

//       points.push(...flatlinePoints);
//       xCursor = points[points.length - 1].x; // move xCursor to end of flatline
//     } else {
//       // No flatline needed if complexSpacing is already small
//       xCursor = lastX;
//     }
//   }

//   return points;
// };

// export const generateOversensingPoints = (): Point[] => {
//   const points: Point[] = [];

//   // Define the shape of a normal complex
//   const complex: Point[] = [
//     { x: 0, y: 0 },
//     { x: 10, y: 0.3 }, // P wave
//     { x: 20, y: 0 },
//     { x: 30, y: -0.2 }, // Q
//     { x: 35, y: 1.2 }, // R
//     { x: 40, y: -0.3 }, // S
//     { x: 50, y: 0.2 }, // T wave
//     { x: 60, y: 0 },
//   ];

//   const numberOfBeats = 3;
//   const spacing = 300; // space between beats (~1.5 sec)
//   let xCursor = 0;

//   // 1. Add a few normal beats
//   for (let i = 0; i < numberOfBeats; i++) {
//     for (const pt of complex) {
//       points.push({ x: xCursor + pt.x, y: pt.y });
//     }
//     xCursor += spacing;
//   }

//   // 2. Simulate oversensing (flatline — no pacing)
//   const oversensedDuration = 600;
//   for (let i = 0; i < oversensedDuration; i += 5) {
//     points.push({ x: xCursor + i, y: 0 });
//   }
//   xCursor += oversensedDuration;

//   // 3. Resume pacing after oversensing
//   for (const pt of complex) {
//     points.push({ x: xCursor + pt.x, y: pt.y });
//   }

//   return points;
// };

// export const generateUndersensingPoints = (): Point[] => {
//   const points: Point[] = [];
//   return points;
// };

// export const generateCaptureModulePoints = ({
//   rate,
//   aOutput,
//   vOutput,
// }: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const totalLength = 160;

//   let lastQRS = -30;
//   const minInterval = 18;
//   const maxInterval = 35;

//   for (let i = 0; i < totalLength; i++) {
//     let y = (Math.random() - 0.5) * 0.6; // chaotic baseline

//     // Irregularly spaced QRS
//     if (
//       i - lastQRS >=
//       Math.floor(Math.random() * (maxInterval - minInterval)) + minInterval
//     ) {
//       y += 1.2 * Math.min(1, vOutput / 5); // ventricular spike (irregular timing)
//       lastQRS = i;
//     }

//     points.push({ x: i, y });
//   }

//   return points;
// };

// export const generateFailureToCapturePoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
// }: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const beatLength = 16;
//   const numberOfBeats = 10;

//   // Still show spikes at pacing interval, but no QRS
//   for (let i = 0; i < numberOfBeats; i++) {
//     const offset = i * beatLength;

//     // Atrial spike (optional based on aOutput)
//     if (aOutput > 0) {
//       points.push({ x: offset + 2, y: 4 });
//     }

//     // Ventricular spike
//     points.push({ x: offset + 5, y: 4 });

//     // No capture: flatline despite spike
//     for (let j = 0; j < beatLength; j++) {
//       if (j !== 2 && j !== 5) {
//         points.push({ x: offset + j, y: 0 });
//       }
//     }
//   }

//   return points;
// };

// const createFlatlineSegment = (length: number, startX: number): Point[] => {
//   const points: Point[] = [];
//   const step = 5; // adjust how dense the flatline is

//   for (let x = 0; x <= length; x += step) {
//     points.push({ x: startX + x, y: 0 });
//   }

//   return points;
// };






// import type { ModuleStep } from "../types/module";

// export type Point = { x: number; y: number };

// type ECGParams = {
//   rate: number;
//   aOutput: number;
//   vOutput: number;
//   sensitivity: number;
//   currentStep?: ModuleStep | null;
//   currentStepIndex?: number;
// };

// // ✅ ADD THIS - Critical for proper ECG morphology
// const lerp = (start: Point, end: Point, steps: number): Point[] => {
//   const pts: Point[] = [];
//   for (let i = 0; i <= steps; i++) {
//     const t = i / steps;
//     pts.push({
//       x: start.x + (end.x - start.x) * t,
//       y: start.y + (end.y - start.y) * t,
//     });
//   }
//   return pts;
// };

// export const generateNormalPacingPoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
// }: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const baseComplexLength = 16;
//   const numberOfComplexes = 6; // Match image length
//   const complexSpacing = 200; // Add gap between each beat to reach ~1.8 sec interval
  
//   // ✅ THIS IS THE EXACT SAME BASECOMPLEX FROM YOUR ORIGINAL
//   const baseComplex: Point[] = [
//     { x: 5, y: 0 },
//     { x: 8, y: 0 },
//     { x: 15, y: 0 },
//     { x: 18, y: 0 },
//     { x: 22, y: 0 },
//     { x: 23, y: 0 },
//     { x: 26, y: 0.088 },
//     { x: 28, y: 0.176 },
//     { x: 30, y: 0.088 },
//     { x: 32, y: 0 },
//     { x: 34, y: 0.088 },
//     { x: 35.8, y: 0 },
//     { x: 36, y: 1.5 },
//     { x: 36.4, y: -0.3 },
//     { x: 37, y: 0 },
//     { x: 39, y: 0.353 },
//     { x: 41, y: 0 },
//     { x: 43, y: 0 },
//     { x: 45, y: 0 },
//     { x: 59, y: 0 },
//     { x: 60, y: 0 },
//     { x: 65, y: 0 },
//     { x: 67, y: 0 },
//     { x: 90, y: 0 },
//   ];
  
//   // ✅ EXACT SAME OUTPUT SCALING FROM ORIGINAL
//   const scaleOutput = (output: number, max = 5) =>
//     Math.min(max, Math.log(output + 1) / Math.log(6));

//   const aScale = scaleOutput(aOutput, 1);
//   const vScale = scaleOutput(vOutput, 5);

//   for (let i = 0; i < numberOfComplexes; i++) {
//     const offset = i * complexSpacing;

//     for (const pt of baseComplex) {
//       let scaledY = pt.y;

//       // ✅ EXACT SAME SCALING LOGIC FROM ORIGINAL
//       if (pt.x >= 1 && pt.x <= 3) {
//         scaledY *= aScale; // P wave
//       } else if (pt.x >= 5 && pt.x <= 7) {
//         scaledY *= vScale; // QRS
//       } else if (pt.x >= 10 && pt.x <= 12) {
//         scaledY *= vScale * 0.3; // T wave
//       }

//       points.push({
//         x: offset + pt.x * 5, // ✅ SAME TIMING MULTIPLIER
//         y: scaledY,
//       });
//     }
//   }

//   return points;
// };

// export const generateBradycardiaPoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
//   currentStep,
//   currentStepIndex = 0,
// }: ECGParams): Point[] => {
//   const points: Point[] = [];

//   // ✅ STEP-AWARE SPACING - KEY DIFFERENCE FROM ORIGINAL
//   let baseSpacing = 400; // slower beat spacing
//   let fastSpacing = 200; // faster beat spacing

//   // ✅ THIS IS THE CRITICAL LOGIC FROM YOUR ORIGINAL APP
//   const complexSpacing = aOutput >= 4 ? fastSpacing : baseSpacing;
//   const numberOfComplexes = 4;

//   // ✅ EXACT SAME COMPLEX FROM ORIGINAL
//   const baseComplex: Point[] = [
//     { x: 8, y: 0 },
//     { x: 15, y: 0 },
//     { x: 18, y: 0 },
//     { x: 22, y: 0 },
//     { x: 23, y: 0 },
//     { x: 26, y: 0.088 },
//     { x: 28, y: 0.176 },
//     { x: 30, y: 0.088 },
//     { x: 32, y: 0 },
//     { x: 34, y: 0.088 },
//     { x: 35.8, y: 0 },
//     { x: 36, y: 1.5 },
//     { x: 36.4, y: -0.3 },
//     { x: 37, y: 0 },
//     { x: 39, y: 0.353 },
//     { x: 41, y: 0 },
//     { x: 43, y: 0 },
//     { x: 45, y: 0 },
//     { x: 59, y: 0 },
//   ];

//   const scaleOutput = (output: number, max = 5) =>
//     Math.min(max, Math.log(output + 1) / Math.log(6));

//   const aScale = scaleOutput(aOutput, 1);
//   const vScale = scaleOutput(vOutput, 5);

//   let xCursor = 0;

//   for (let i = 0; i < numberOfComplexes; i++) {
//     // Add the base complex
//     for (const pt of baseComplex) {
//       let scaledY = pt.y;

//       if (pt.x >= 1 && pt.x <= 3) {
//         scaledY *= aScale; // P wave
//       } else if (pt.x >= 5 && pt.x <= 7) {
//         scaledY *= vScale; // QRS complex
//       } else if (pt.x >= 10 && pt.x <= 12) {
//         scaledY *= vScale * 0.3; // T wave
//       }

//       points.push({
//         x: xCursor + pt.x * 5,
//         y: scaledY,
//       });
//     }

//     // ✅ CRITICAL: This flatline logic from original
//     const lastX = points[points.length - 1].x;
//     const targetNextX = (i + 1) * complexSpacing;

//     if (targetNextX > lastX) {
//       const gapLength = targetNextX - lastX;
//       const flatlinePoints = createFlatlineSegment(gapLength, lastX);

//       points.push(...flatlinePoints);
//       xCursor = points[points.length - 1].x;
//     } else {
//       xCursor = lastX;
//     }
//   }

//   return points;
// };

// export const generateOversensingPoints = (): Point[] => {
//   const points: Point[] = [];

//   // ✅ EXACT SAME FROM ORIGINAL
//   const complex: Point[] = [
//     { x: 0, y: 0 },
//     { x: 10, y: 0.3 },     // P wave
//     { x: 20, y: 0 },
//     { x: 30, y: -0.2 },    // Q
//     { x: 35, y: 1.2 },     // R
//     { x: 40, y: -0.3 },    // S
//     { x: 50, y: 0.2 },     // T wave
//     { x: 60, y: 0 },
//   ];

//   const numberOfBeats = 3;
//   const spacing = 300;
//   let xCursor = 0;

//   // 1. Add a few normal beats
//   for (let i = 0; i < numberOfBeats; i++) {
//     for (const pt of complex) {
//       points.push({ x: xCursor + pt.x, y: pt.y });
//     }
//     xCursor += spacing;
//   }

//   // 2. Simulate oversensing (flatline — no pacing)
//   const oversensedDuration = 600;
//   for (let i = 0; i < oversensedDuration; i += 5) {
//     points.push({ x: xCursor + i, y: 0 });
//   }
//   xCursor += oversensedDuration;

//   // 3. Resume pacing after oversensing
//   for (const pt of complex) {
//     points.push({ x: xCursor + pt.x, y: pt.y });
//   }

//   return points;
// };

// // ✅ THIS WAS EMPTY IN YOUR NEW VERSION - NEED TO IMPLEMENT
// export const generateUndersensingPoints = (): Point[] => {
//   const points: Point[] = [];

//   // Define normal complex
//   const complex: Point[] = [
//     { x: 0, y: 0 },
//     { x: 10, y: 0.3 },     // P wave
//     { x: 20, y: 0 },
//     { x: 30, y: -0.2 },    // Q
//     { x: 35, y: 1.2 },     // R
//     { x: 40, y: -0.3 },    // S
//     { x: 50, y: 0.2 },     // T wave
//     { x: 60, y: 0 },
//   ];

//   const spacing = 200;
//   let xCursor = 0;

//   // Show intrinsic beats with inappropriate pacing spikes
//   for (let i = 0; i < 5; i++) {
//     // Intrinsic beat
//     for (const pt of complex) {
//       points.push({ x: xCursor + pt.x, y: pt.y });
//     }
    
//     // Add inappropriate pacing spike shortly after
//     points.push({ x: xCursor + 80, y: 3.5 }); // Pacing spike
//     points.push({ x: xCursor + 81, y: 0 });
    
//     xCursor += spacing;
//   }

//   return points;
// };

// export const generateCaptureModulePoints = ({
//   rate,
//   aOutput,
//   vOutput,
// }: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const totalLength = 160;

//   let lastQRS = -30;
//   const minInterval = 18;
//   const maxInterval = 35;

//   for (let i = 0; i < totalLength; i++) {
//     let y = (Math.random() - 0.5) * 0.6; // chaotic baseline

//     // Irregularly spaced QRS
//     if (
//       i - lastQRS >=
//       Math.floor(Math.random() * (maxInterval - minInterval)) + minInterval
//     ) {
//       y += 1.2 * Math.min(1, vOutput / 5); // ventricular spike (irregular timing)
//       lastQRS = i;
//     }

//     points.push({ x: i, y });
//   }

//   return points;
// };

// export const generateFailureToCapturePoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
// }: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const beatLength = 16;
//   const numberOfBeats = 10;

//   // Still show spikes at pacing interval, but no QRS
//   for (let i = 0; i < numberOfBeats; i++) {
//     const offset = i * beatLength;

//     // Atrial spike (optional based on aOutput)
//     if (aOutput > 0) {
//       points.push({ x: offset + 2, y: 4 });
//     }

//     // Ventricular spike
//     points.push({ x: offset + 5, y: 4 });

//     // No capture: flatline despite spike
//     for (let j = 0; j < beatLength; j++) {
//       if (j !== 2 && j !== 5) {
//         points.push({ x: offset + j, y: 0 });
//       }
//     }
//   }

//   return points;
// };

// // ✅ CRITICAL HELPER FUNCTION FROM ORIGINAL
// const createFlatlineSegment = (length: number, startX: number): Point[] => {
//   const points: Point[] = [];
//   const step = 5; // adjust how dense the flatline is

//   for (let x = 0; x <= length; x += step) {
//     points.push({ x: startX + x, y: 0 });
//   }

//   return points;
// };









import type { ModuleStep } from "../types/module";

export type Point = { x: number; y: number };

type ECGParams = {
  rate: number; // pacing rate in bpm
  aOutput: number; // atrial output strength (mA)
  vOutput: number; // ventricular output strength (mA)
  sensitivity: number; // sensing threshold (mV)
};

const lerp = (start: Point, end: Point, steps: number): Point[] => {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    });
  }
  return pts;
};

export const generateNormalPacingPoints = ({
  rate,
  aOutput,
  vOutput,
  sensitivity,
}: ECGParams): Point[] => {
  const points: Point[] = [];
  const baseComplexLength = 16;
  const numberOfComplexes = 6; // Match image length
  const complexSpacing = 200; // Add gap between each beat to reach ~1.8 sec interval
  
  const baseComplex: Point[] = [
    { x: 5, y: 0 },
    { x: 8, y: 0 },
    { x: 15, y: 0 },
    { x: 18, y: 0 },
    { x: 22, y: 0 },
    { x: 23, y: 0 },
    { x: 26, y: 0.088 },
    { x: 28, y: 0.176 },
    { x: 30, y: 0.088 },
    { x: 32, y: 0 },
    { x: 34, y: 0.088 },
    { x: 35.8, y: 0 },
    { x: 36, y: 1.5 },
    { x: 36.4, y: -0.3 },
    { x: 37, y: 0 },
    { x: 39, y: 0.353 },
    { x: 41, y: 0 },
    { x: 43, y: 0 },
    { x: 45, y: 0 },

    { x: 59, y: 0 },
    { x: 60, y: 0 },
    { x: 65, y: 0 },
    { x: 67, y: 0 },
    { x: 90, y: 0 },
  ];
  
  
  
  // Output scaling
  const scaleOutput = (output: number, max = 5) =>
    Math.min(max, Math.log(output + 1) / Math.log(6));

  const aScale = scaleOutput(aOutput, 1);
  const vScale = scaleOutput(vOutput, 5);

  for (let i = 0; i < numberOfComplexes; i++) {
    const offset = i * complexSpacing;

    for (const pt of baseComplex) {
      let scaledY = pt.y;

      if (pt.x >= 1 && pt.x <= 3) {
        scaledY *= aScale; // P wave
      } else if (pt.x >= 5 && pt.x <= 7) {
        scaledY *= vScale; // QRS
      } else if (pt.x >= 10 && pt.x <= 12) {
        scaledY *= vScale * 0.3; // T wave
      }

      points.push({
        x: offset + pt.x * 5, // or 3, 4, etc. — to slow it down
        y: scaledY,
      });
    }
  }

  return points;
};

export const generateBradycardiaPoints = ({
  rate,
  aOutput,
  vOutput,
  sensitivity,
}: ECGParams & { currentStep?: ModuleStep | null; currentStepIndex?: number }): Point[] => {
  const points: Point[] = [];

  const baseSpacing = 400; // slower beat spacing
  const fastSpacing = 200; // faster beat spacing

  const complexSpacing = aOutput >= 4 ? fastSpacing : baseSpacing;
  const numberOfComplexes = 4;

  const baseComplex: Point[] = [
    { x: 8, y: 0 },
    { x: 15, y: 0 },
    { x: 18, y: 0 },
    { x: 22, y: 0 },
    { x: 23, y: 0 },
    { x: 26, y: 0.088 },
    { x: 28, y: 0.176 },
    { x: 30, y: 0.088 },
    { x: 32, y: 0 },
    { x: 34, y: 0.088 },
    { x: 35.8, y: 0 },
    { x: 36, y: 1.5 },
    { x: 36.4, y: -0.3 },
    { x: 37, y: 0 },
    { x: 39, y: 0.353 },
    { x: 41, y: 0 },
    { x: 43, y: 0 },
    { x: 45, y: 0 },
    { x: 59, y: 0 },
  ];

  const scaleOutput = (output: number, max = 5) =>
    Math.min(max, Math.log(output + 1) / Math.log(6));

  const aScale = scaleOutput(aOutput, 1);
  const vScale = scaleOutput(vOutput, 5);

  let xCursor = 0;

  for (let i = 0; i < numberOfComplexes; i++) {
    // Add the base complex
    for (const pt of baseComplex) {
      let scaledY = pt.y;

      if (pt.x >= 1 && pt.x <= 3) {
        scaledY *= aScale; // P wave
      } else if (pt.x >= 5 && pt.x <= 7) {
        scaledY *= vScale; // QRS complex
      } else if (pt.x >= 10 && pt.x <= 12) {
        scaledY *= vScale * 0.3; // T wave
      }

      points.push({
        x: xCursor + pt.x * 5,
        y: scaledY,
      });
    }

    // After each complex, insert a flatline segment to stretch to the next complex
    const lastX = points[points.length - 1].x;
    const targetNextX = (i + 1) * complexSpacing;

    if (targetNextX > lastX) {
      // Fill in with flatline points between end of complex and start of next
      const gapLength = targetNextX - lastX;
      const flatlinePoints = createFlatlineSegment(gapLength, lastX);

      points.push(...flatlinePoints);
      xCursor = points[points.length - 1].x; // move xCursor to end of flatline
    } else {
      // No flatline needed if complexSpacing is already small
      xCursor = lastX;
    }
  }

  return points;
};

export const generateOversensingPoints = (): Point[] => {
  const points: Point[] = [];

  // Define the shape of a normal complex
  const complex: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0.3 },     // P wave
    { x: 20, y: 0 },
    { x: 30, y: -0.2 },    // Q
    { x: 35, y: 1.2 },     // R
    { x: 40, y: -0.3 },    // S
    { x: 50, y: 0.2 },     // T wave
    { x: 60, y: 0 },
  ];

  const numberOfBeats = 3;
  const spacing = 300; // space between beats (~1.5 sec)
  let xCursor = 0;

  // 1. Add a few normal beats
  for (let i = 0; i < numberOfBeats; i++) {
    for (const pt of complex) {
      points.push({ x: xCursor + pt.x, y: pt.y });
    }
    xCursor += spacing;
  }

  // 2. Simulate oversensing (flatline — no pacing)
  const oversensedDuration = 600;
  for (let i = 0; i < oversensedDuration; i += 5) {
    points.push({ x: xCursor + i, y: 0 });
  }
  xCursor += oversensedDuration;

  // 3. Resume pacing after oversensing
  for (const pt of complex) {
    points.push({ x: xCursor + pt.x, y: pt.y });
  }

  return points;
};

export const generateUndersensingPoints = (): Point[] => {
  const points: Point[] = [];


  return points;
};

export const generateCaptureModulePoints = ({
  rate,
  aOutput,
  vOutput,
}: ECGParams): Point[] => {
  const points: Point[] = [];
  const totalLength = 160;

  let lastQRS = -30;
  const minInterval = 18;
  const maxInterval = 35;

  for (let i = 0; i < totalLength; i++) {
    let y = (Math.random() - 0.5) * 0.6; // chaotic baseline

    // Irregularly spaced QRS
    if (
      i - lastQRS >=
      Math.floor(Math.random() * (maxInterval - minInterval)) + minInterval
    ) {
      y += 1.2 * Math.min(1, vOutput / 5); // ventricular spike (irregular timing)
      lastQRS = i;
    }

    points.push({ x: i, y });
  }

  return points;
};

export const generateFailureToCapturePoints = ({
  rate,
  aOutput,
  vOutput,
  sensitivity,
}: ECGParams): Point[] => {
  const points: Point[] = [];
  const beatLength = 16;
  const numberOfBeats = 10;

  // Still show spikes at pacing interval, but no QRS
  for (let i = 0; i < numberOfBeats; i++) {
    const offset = i * beatLength;

    // Atrial spike (optional based on aOutput)
    if (aOutput > 0) {
      points.push({ x: offset + 2, y: 4 });
    }

    // Ventricular spike
    points.push({ x: offset + 5, y: 4 });

    // No capture: flatline despite spike
    for (let j = 0; j < beatLength; j++) {
      if (j !== 2 && j !== 5) {
        points.push({ x: offset + j, y: 0 });
      }
    }
  }

  return points;
};

const createFlatlineSegment = (length: number, startX: number): Point[] => {
  const points: Point[] = [];
  const step = 5; // adjust how dense the flatline is

  for (let x = 0; x <= length; x += step) {
    points.push({ x: startX + x, y: 0 });
  }

  return points;
};