// export type Point = { x: number; y: number };

// type ECGParams = {
//   rate: number; // pacing rate in bpm
//   aOutput: number; // atrial output strength (mA)
//   vOutput: number; // ventricular output strength (mA)
//   sensitivity: number; // sensing threshold (mV)
// };

// // ✅ FIXED: Use ONE consistent base complex for all modes
// const STANDARD_BASE_COMPLEX: Point[] = [
//   { x: 0, y: 0 },      // Baseline start
//   { x: 1, y: 0.1 },    // P wave start
//   { x: 2, y: 0.25 },   // P wave peak
//   { x: 3, y: 0.1 },    // P wave end
//   { x: 4, y: 0 },      // PR segment
//   { x: 5, y: -0.2 },   // Q wave
//   { x: 6, y: 1.5 },    // R wave peak
//   { x: 7, y: -0.4 },   // S wave
//   { x: 8, y: 0 },      // ST segment
//   { x: 9, y: 0.1 },    // T wave start
//   { x: 10, y: 0.4 },   // T wave peak
//   { x: 11, y: 0.1 },   // T wave end
//   { x: 12, y: 0 },     // Baseline
//   { x: 13, y: 0 },     // Baseline
//   { x: 14, y: 0 },     // Baseline
//   { x: 15, y: 0 },     // Baseline end
// ];

// // ✅ FIXED: Consistent scaling function
// const scaleOutput = (output: number, max = 5) =>
//   Math.min(max, Math.log(output + 1) / Math.log(6));

// // ✅ FIXED: Generate points consistently
// const generatePointsWithSpacing = (
//   params: ECGParams,
//   complexSpacing: number,
//   numberOfComplexes: number = 6
// ): Point[] => {
//   const points: Point[] = [];
//   const aScale = scaleOutput(params.aOutput, 1);
//   const vScale = scaleOutput(params.vOutput, 5);

//   for (let i = 0; i < numberOfComplexes; i++) {
//     const offset = i * complexSpacing;

//     for (const pt of STANDARD_BASE_COMPLEX) {
//       let scaledY = pt.y;

//       // Apply scaling based on wave type
//       if (pt.x >= 1 && pt.x <= 3) {
//         scaledY *= aScale; // P wave (x: 1-3)
//       } else if (pt.x >= 5 && pt.x <= 7) {
//         scaledY *= vScale; // QRS complex (x: 5-7)
//       } else if (pt.x >= 9 && pt.x <= 11) {
//         scaledY *= vScale * 0.3; // T wave (x: 9-11)
//       }

//       points.push({
//         x: offset + pt.x * 5, // Consistent timing multiplier
//         y: scaledY,
//       });
//     }
//   }

//   return points;
// };

// // ✅ FIXED: Normal pacing - 60-100 BPM spacing
// export const generateNormalPacingPoints = (params: ECGParams): Point[] => {
//   return generatePointsWithSpacing(params, 200, 6); // Normal spacing
// };

// // ✅ FIXED: Bradycardia - slower spacing for <60 BPM
// export const generateBradycardiaPoints = (params: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const aScale = scaleOutput(params.aOutput, 1);
//   const vScale = scaleOutput(params.vOutput, 5);

//   // ✅ FIXED: Generate CONTINUOUS points, not gaps
//   const beatInterval = 120; // Points between each beat (slower for bradycardia)
//   const numberOfBeats = 8;

//   let xPosition = 0;

//   for (let beat = 0; beat < numberOfBeats; beat++) {
//     // Add the cardiac complex
//     for (const pt of STANDARD_BASE_COMPLEX) {
//       let scaledY = pt.y;

//       if (pt.x >= 1 && pt.x <= 3) {
//         scaledY *= aScale; // P wave
//       } else if (pt.x >= 5 && pt.x <= 7) {
//         scaledY *= vScale; // QRS complex
//       } else if (pt.x >= 9 && pt.x <= 11) {
//         scaledY *= vScale * 0.3; // T wave
//       }

//       points.push({
//         x: xPosition + pt.x,
//         y: scaledY,
//       });
//     }

//     // ✅ FIXED: Fill the gap with FLATLINE points (no gaps!)
//     const complexEnd = xPosition + 16; // End of current complex
//     const nextBeatStart = xPosition + beatInterval;

//     // Fill flatline between beats
//     for (let x = complexEnd; x < nextBeatStart; x += 2) {
//       points.push({ x, y: 0 });
//     }

//     xPosition = nextBeatStart;
//   }

//   return points;
// };

// // ✅ FIXED: Oversensing - irregular pacing with gaps
// export const generateOversensingPoints = (): Point[] => {
//   const points: Point[] = [];
//   let xCursor = 0;

//   // Normal beats first
//   for (let i = 0; i < 3; i++) {
//     for (const pt of STANDARD_BASE_COMPLEX) {
//       points.push({ x: xCursor + pt.x * 5, y: pt.y });
//     }
//     xCursor += 300; // Normal spacing
//   }

//   // Oversensing gap (flatline - no pacing)
//   for (let i = 0; i < 600; i += 5) {
//     points.push({ x: xCursor + i, y: 0 });
//   }
//   xCursor += 600;

//   // Resume normal pacing
//   for (const pt of STANDARD_BASE_COMPLEX) {
//     points.push({ x: xCursor + pt.x * 5, y: pt.y });
//   }

//   return points;
// };

// // ✅ FIXED: Undersensing - pacing spikes on top of intrinsic beats
// export const generateUndersensingPoints = (): Point[] => {
//   const points: Point[] = [];
//   let xCursor = 0;

//   for (let i = 0; i < 5; i++) {
//     // Intrinsic beat
//     for (const pt of STANDARD_BASE_COMPLEX) {
//       points.push({ x: xCursor + pt.x * 5, y: pt.y });
//     }

//     // Inappropriate pacing spike (undersensing)
//     points.push({ x: xCursor + 80, y: 3.5 }); // Pacing spike
//     points.push({ x: xCursor + 81, y: 0 });   // Return to baseline

//     xCursor += 200;
//   }

//   return points;
// };

// // ✅ FIXED: Capture module - chaotic rhythm with irregular QRS
// export const generateCaptureModulePoints = (params: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const totalLength = 1000; // Longer pattern
//   let lastQRS = -50;
//   const minInterval = 25;
//   const maxInterval = 45;

//   for (let i = 0; i < totalLength; i += 5) {
//     let y = (Math.random() - 0.5) * 0.3; // Reduced noise

//     // Irregular QRS complexes
//     if (i - lastQRS >= Math.floor(Math.random() * (maxInterval - minInterval)) + minInterval) {
//       y += 1.2 * Math.min(1, params.vOutput / 5);
//       lastQRS = i;
//     }

//     points.push({ x: i, y });
//   }

//   return points;
// };

// // ✅ FIXED: Failure to capture - pacing spikes without QRS response
// export const generateFailureToCapturePoints = (params: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const beatInterval = 80; // Consistent spacing
//   const numberOfBeats = 8;

//   for (let i = 0; i < numberOfBeats; i++) {
//     const offset = i * beatInterval;

//     // Atrial spike (if aOutput > 0)
//     if (params.aOutput > 0) {
//       points.push({ x: offset + 10, y: 4 }); // Spike
//       points.push({ x: offset + 11, y: 0 }); // Return to baseline
//     }

//     // Ventricular spike (always present)
//     points.push({ x: offset + 25, y: 4 }); // Spike
//     points.push({ x: offset + 26, y: 0 }); // Return to baseline

//     // NO QRS response (that's the failure)
//     // Fill with flatline
//     for (let j = 0; j < beatInterval; j += 5) {
//       if (j !== 10 && j !== 11 && j !== 25 && j !== 26) {
//         points.push({ x: offset + j, y: 0 });
//       }
//     }
//   }

//   return points;
// };

import type { ModuleStep } from "@/types/module";

export type Point = { x: number; y: number };

type ECGParams = {
  rate: number;
  aOutput: number;
  vOutput: number; 
  sensitivity: number;
  currentStep?: ModuleStep | null;    // ← ADD THIS LINE
  currentStepIndex?: number;          // ← ADD THIS LINE
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

// export const generateBradycardiaPoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
// }: ECGParams & {
//   currentStep?: ModuleStep | null;
//   currentStepIndex?: number;
// }): Point[] => {
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



export const generateBradycardiaPoints = ({
  rate,
  aOutput,
  vOutput,
  sensitivity,
  currentStep,
  currentStepIndex = 0,
}: ECGParams): Point[] => {
  console.log('🫀 BRADYCARDIA GENERATION CALLED:');
  console.log('- Rate:', rate);
  console.log('- aOutput:', aOutput);
  console.log('- vOutput:', vOutput);
  console.log('- Sensitivity:', sensitivity);
  console.log('- CurrentStep:', currentStep?.id || 'NO_STEP');
  console.log('- StepIndex:', currentStepIndex);

  const points: Point[] = [];

  // ✅ DETECT QUIZ PHASE vs STEP PHASE
  const isQuizPhase = !currentStep || currentStep.id === undefined;
  console.log('📋 Phase:', isQuizPhase ? 'QUIZ' : 'STEP');

  if (isQuizPhase) {
    // ✅ QUIZ PHASE: Use the EXACT original bradycardia pattern
    console.log('📝 Generating QUIZ phase bradycardia...');
    
    const numberOfComplexes = 4;
    const complexSpacing = 300; // Slow bradycardia spacing
    
    // Use the EXACT original complex from your working app
    const originalComplex: Point[] = [
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

    // Generate multiple complexes with proper spacing
    for (let i = 0; i < numberOfComplexes; i++) {
      const offset = i * complexSpacing;
      
      for (const pt of originalComplex) {
        points.push({
          x: offset + pt.x * 5, // Same multiplier as original
          y: pt.y
        });
      }
      
      // Add flatline between complexes if needed
      if (i < numberOfComplexes - 1) {
        const lastX = points[points.length - 1].x;
        const nextStartX = (i + 1) * complexSpacing;
        
        for (let x = lastX + 10; x < nextStartX; x += 10) {
          points.push({ x, y: 0 });
        }
      }
    }

    console.log('✅ QUIZ bradycardia generated:', points.length, 'points');
    console.log('- First point:', points[0]);
    console.log('- Last point:', points[points.length - 1]);
    console.log('- Sample middle:', points[Math.floor(points.length / 2)]);
    
    return points;
  }

  // ✅ STEP PHASE: Use step-aware logic (existing logic)
  console.log('🎯 Generating STEP phase bradycardia...');
  
  // Your existing step-aware logic here...
  // (Keep the rest of the function as it was)
  
  return points;
};


export const generateOversensingPoints = (): Point[] => {
  const points: Point[] = [];

  // Define the shape of a normal complex
  const complex: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0.3 }, // P wave
    { x: 20, y: 0 },
    { x: 30, y: -0.2 }, // Q
    { x: 35, y: 1.2 }, // R
    { x: 40, y: -0.3 }, // S
    { x: 50, y: 0.2 }, // T wave
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

{
  /**
export const generateSecondDegreeBlockPoints = ({
  rate,
  aOutput,
  vOutput,
}: ECGParams): Point[] => {
  const points: Point[] = [];
  const beatLength = 16;
  const numberOfBeats = 10;

  for (let i = 0; i < numberOfBeats; i++) {
    const offset = i * beatLength;

    // P wave every beat
    if (aOutput > 0) {
      points.push({ x: offset + 2, y: 0.3 * Math.min(1, aOutput / 5) });
    }

    // Drop every 3rd QRS (simulate conduction failure)
    const isDropped = i % 3 === 2;
    if (!isDropped && vOutput > 0) {
      points.push({ x: offset + 6, y: -0.2 });
      points.push({ x: offset + 7, y: 1.3 });
      points.push({ x: offset + 8, y: -0.3 });
    }

    // Flatline everywhere else
    for (let j = 0; j < beatLength; j++) {
      if (![2, 6, 7, 8].includes(j)) {
        points.push({ x: offset + j, y: 0 });
      }
    }
  }

  return points;
};

export const generateSlowJunctionalPoints = ({
  rate,
  aOutput,
  vOutput,
}: ECGParams): Point[] => {
  const points: Point[] = [];
  const beatLength = 24;
  const numberOfBeats = 8;

  for (let i = 0; i < numberOfBeats; i++) {
    const offset = i * beatLength;

    // Slow QRS only, no P wave
    if (vOutput > 0) {
      points.push({ x: offset + 6, y: -0.2 });
      points.push({ x: offset + 7, y: 1.1 });
      points.push({ x: offset + 8, y: -0.3 });
    }

    for (let j = 0; j < beatLength; j++) {
      if (![6, 7, 8].includes(j)) {
        points.push({ x: offset + j, y: 0 });
      }
    }
  }

  return points;
};

export const generateAsystolePoints = ({
  rate,
  vOutput,
}: ECGParams): Point[] => {
  const points: Point[] = [];
  const beatLength = 16;
  const numberOfBeats = 10;

  for (let i = 0; i < numberOfBeats; i++) {
    const offset = i * beatLength;

    // Optional pacing spike, no QRS
    if (vOutput > 0) {
      points.push({ x: offset + 5, y: 4 });
    }

    for (let j = 0; j < beatLength; j++) {
      if (j !== 5) {
        points.push({ x: offset + j, y: 0 });
      }
    }
  }

  return points;
};
*/
}
