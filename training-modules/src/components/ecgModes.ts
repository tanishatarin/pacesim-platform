import type { ModuleStep } from "@/types/module";

export type Point = { x: number; y: number };

type ECGParams = {
  rate: number;
  aOutput: number;
  vOutput: number;
  sensitivity: number;
  currentStep?: ModuleStep | null;
  currentStepIndex?: number;
};

export const generateBradycardiaPoints = ({
  rate,
  aOutput,
  vOutput,
  sensitivity,
  currentStep,
  currentStepIndex = 0,
}: ECGParams): Point[] => {
  console.log("🫀 BRADYCARDIA GENERATION CALLED (FIXED VERSION):");
  console.log("- Rate:", rate);
  console.log("- aOutput:", aOutput);
  console.log("- vOutput:", vOutput);
  console.log("- Sensitivity:", sensitivity);
  console.log("- CurrentStep:", currentStep?.id || "NO_STEP");
  console.log("- StepIndex:", currentStepIndex);

  const points: Point[] = [];
  const isQuizPhase = !currentStep || currentStep.id === undefined;
  console.log("📋 Phase:", isQuizPhase ? "QUIZ" : "STEP");

  // 🎯 FIXED: Use the same complex definition but generate MORE of them
  const workingComplex: Point[] = [
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

  // 🔥 CRITICAL FIX: Generate MANY more complexes to get 400+ points
  const numberOfComplexes = 16; // Increased from 8 to 16!
  const complexSpacing = 200;

  // Output scaling
  const scaleOutput = (output: number, max = 5) =>
    Math.min(max, Math.log(output + 1) / Math.log(6));

  const aScale = scaleOutput(aOutput, 1);
  const vScale = scaleOutput(vOutput, 5);

  // Generate complexes with proper X tracking
  let currentX = 0;

  for (let i = 0; i < numberOfComplexes; i++) {
    const complexStartX = currentX;

    for (const pt of workingComplex) {
      let scaledY = pt.y;

      // Apply scaling based on wave type
      if (pt.x >= 26 && pt.x <= 30) {
        scaledY *= aScale; // P wave
      } else if (pt.x >= 35.8 && pt.x <= 37) {
        scaledY *= vScale; // QRS
      } else if (pt.x >= 39 && pt.x <= 41) {
        scaledY *= vScale * 0.3; // T wave
      }

      const finalX = complexStartX + pt.x * 5;
      
      points.push({
        x: finalX,
        y: scaledY,
      });

      currentX = Math.max(currentX, finalX + 1);
    }

    // Ensure proper spacing between complexes
    currentX = complexStartX + complexSpacing;
  }

  // 🔥 FALLBACK: If still not enough points, add more baseline
  const targetMinPoints = 350;
  if (points.length < targetMinPoints) {
    console.log(`🔧 Adding baseline points to reach ${targetMinPoints} total`);
    const lastX = points[points.length - 1]?.x || 0;
    
    // Add baseline points to fill the gap
    for (let i = points.length; i < targetMinPoints; i++) {
      points.push({
        x: lastX + (i - points.length + 1) * 10,
        y: 0
      });
    }
  }

  console.log("✅ Bradycardia generated:", points.length, "points (FIXED VERSION)");
  console.log("- X-value range:", points[0]?.x, "to", points[points.length - 1]?.x);
  console.log("- Unique X values:", new Set(points.map(p => p.x)).size === points.length);

  return points;
};

export const generateThirdDegreeBlockPoints = ({
  rate,
  aOutput,
  vOutput,
  sensitivity,
  currentStep,
  currentStepIndex = 0,
}: ECGParams): Point[] => {
  console.log("🫀 THIRD DEGREE BLOCK GENERATION (FIXED VERSION)");
  
  const points: Point[] = [];
  const isQuizPhase = !currentStep;

  const blockComplex: Point[] = [
    { x: 0, y: 0 },
    { x: 15, y: 0 },
    { x: 20, y: 0.088 },
    { x: 22, y: 0.176 },
    { x: 24, y: 0.088 },
    { x: 45, y: 0 },
    { x: 70, y: 0.088 },
    { x: 72, y: 0.176 },
    { x: 74, y: 0.088 },
    { x: 95, y: 0 },
    { x: 100, y: -0.2 },
    { x: 102, y: 1.2 },
    { x: 105, y: -0.2 },
    { x: 108, y: 0 },
    { x: 115, y: 0.25 },
    { x: 120, y: 0 },
  ];

  // 🔥 GENERATE MORE COMPLEXES
  const numberOfComplexes = 20; // Increased significantly
  const complexSpacing = 250;

  for (let i = 0; i < numberOfComplexes; i++) {
    const offset = i * complexSpacing;
    for (const pt of blockComplex) {
      points.push({
        x: offset + pt.x * 5,
        y: pt.y,
      });
    }
  }

  console.log("✅ Third degree block generated:", points.length, "points (FIXED)");
  return points;
};

export const generateAtrialFibrillationPoints = ({
  rate,
  aOutput,
  vOutput,
  sensitivity,
  currentStep,
  currentStepIndex = 0,
}: ECGParams): Point[] => {
  console.log("🫀 ATRIAL FIBRILLATION GENERATION (FIXED VERSION)");
  
  const points: Point[] = [];
  const isQuizPhase = !currentStep;

  // 🔥 GENERATE MORE COMPLEXES
  const numberOfComplexes = 24; // Increased significantly
  const baseSpacing = 200;

  for (let i = 0; i < numberOfComplexes; i++) {
    const irregularity = (Math.random() - 0.5) * 80;
    const offset = i * baseSpacing + irregularity;
    
    // Generate fibrillation waves
    for (let x = 0; x < 70; x += 3) {
      const fibWave = Math.sin(x * 0.3) * 0.04 + (Math.random() - 0.5) * 0.03;
      points.push({ 
        x: offset + x * 5, 
        y: fibWave 
      });
    }
    
    // Generate irregular QRS
    const irregularQRS: Point[] = [
      { x: 70, y: 0 },
      { x: 72, y: -0.15 },
      { x: 74, y: 1.3 },
      { x: 76, y: -0.25 },
      { x: 78, y: 0 },
      { x: 85, y: 0.2 },
      { x: 88, y: 0 },
    ];
    
    for (const pt of irregularQRS) {
      points.push({
        x: offset + pt.x * 5,
        y: pt.y,
      });
    }
  }

  console.log("✅ Atrial fibrillation generated:", points.length, "points (FIXED)");
  return points;
};

export const generateNormalPacingPoints = ({
  rate,
  aOutput,
  vOutput,
  sensitivity,
}: ECGParams): Point[] => {
  const points: Point[] = [];
  const numberOfComplexes = 12; // Increased
  const complexSpacing = 200;

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

  const scaleOutput = (output: number, max = 5) =>
    Math.min(max, Math.log(output + 1) / Math.log(6));

  const aScale = scaleOutput(aOutput, 1);
  const vScale = scaleOutput(vOutput, 5);

  for (let i = 0; i < numberOfComplexes; i++) {
    const offset = i * complexSpacing;

    for (const pt of baseComplex) {
      let scaledY = pt.y;

      if (pt.x >= 1 && pt.x <= 3) {
        scaledY *= aScale;
      } else if (pt.x >= 5 && pt.x <= 7) {
        scaledY *= vScale;
      } else if (pt.x >= 10 && pt.x <= 12) {
        scaledY *= vScale * 0.3;
      }

      points.push({
        x: offset + pt.x * 5,
        y: scaledY,
      });
    }
  }

  return points;
};






// has versions of the code with pacing spikes - but the diagrams look super super wrong 


// import type { ModuleStep } from "@/types/module";

// export type Point = { x: number; y: number };

// type ECGParams = {
//   rate: number;
//   aOutput: number;
//   vOutput: number;
//   sensitivity: number;
//   currentStep?: ModuleStep | null;
//   currentStepIndex?: number;
// };

// export const generateBradycardiaPoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
//   currentStep,
//   currentStepIndex = 0,
// }: ECGParams): Point[] => {
//   console.log("🫀 BRADYCARDIA GENERATION CALLED:");
//   console.log("- Rate:", rate);
//   console.log("- aOutput:", aOutput);
//   console.log("- vOutput:", vOutput);
//   console.log("- Sensitivity:", sensitivity);
//   console.log("- CurrentStep:", currentStep?.id || "NO_STEP");
//   console.log("- StepIndex:", currentStepIndex);

//   const points: Point[] = [];
//   const isQuizPhase = !currentStep || currentStep.id === undefined;

//   // Determine pacing state based on step progression and output levels
//   // Show atrial pacing when we reach capture threshold (4mA) and are on capture-related steps
//   const shouldShowAtrialPacing = currentStep && (
//     currentStep.id === "step7" || // Find capture threshold - should show pacing spikes at 4mA+
//     currentStep.id === "step8" || // Set output to 2x threshold - definitely pacing at 8mA
//     currentStep.id === "step9"    // Final rate - still pacing
//   ) && aOutput >= 4; // Capture threshold

//   console.log("🔥 MODULE 1 PACING STATE:", { shouldShowAtrialPacing, currentStepId: currentStep?.id, aOutput });

//   if (shouldShowAtrialPacing) {
//     // Generate ATRIAL PACED rhythm
//     return generateAtrialPacedRhythm(rate, aOutput, vOutput);
//   } else {
//     // Generate intrinsic bradycardia rhythm
//     return generateIntrinsicBradycardia(rate, aOutput, vOutput, sensitivity);
//   }
// };

// // NEW: Generate atrial paced rhythm for Module 1
// const generateAtrialPacedRhythm = (rate: number, aOutput: number, vOutput: number): Point[] => {
//   console.log("💓 Generating ATRIAL PACED rhythm");
//   const points: Point[] = [];
//   const numberOfComplexes = 16;
//   const complexSpacing = 200;

//   // Atrial paced complex with prominent pacing spike
//   const atrialPacedComplex: Point[] = [
//     // Atrial pacing spike - MADE MORE PROMINENT
//     { x: 20, y: 0 },
//     { x: 21, y: -1.2 }, // Sharper, deeper downward spike
//     { x: 22, y: 3.0 },  // Taller upward spike  
//     { x: 23, y: -0.5 }, // Return down
//     { x: 24, y: 0 },
    
//     // Paced P wave (slightly different morphology)
//     { x: 28, y: 0.15 },
//     { x: 30, y: 0.22 },
//     { x: 32, y: 0.15 },
//     { x: 34, y: 0 },
    
//     // Normal QRS (intrinsic conduction)
//     { x: 50, y: 0 },
//     { x: 52, y: -0.2 },
//     { x: 54, y: 1.3 },
//     { x: 56, y: -0.25 },
//     { x: 58, y: 0 },
    
//     // T wave
//     { x: 65, y: 0.25 },
//     { x: 70, y: 0 },
//     { x: 90, y: 0 },
//   ];

//   let currentX = 0;
//   for (let i = 0; i < numberOfComplexes; i++) {
//     const complexStartX = currentX;
//     for (const pt of atrialPacedComplex) {
//       points.push({
//         x: complexStartX + pt.x * 5,
//         y: pt.y,
//       });
//     }
//     currentX = complexStartX + complexSpacing;
//   }

//   console.log("✅ Atrial paced rhythm generated:", points.length, "points");
//   return points;
// };

// // Intrinsic bradycardia rhythm (original)
// const generateIntrinsicBradycardia = (rate: number, aOutput: number, vOutput: number, sensitivity: number): Point[] => {
//   const points: Point[] = [];
//   const workingComplex: Point[] = [
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

//   const numberOfComplexes = 16;
//   const complexSpacing = 200;
//   const scaleOutput = (output: number, max = 5) =>
//     Math.min(max, Math.log(output + 1) / Math.log(6));
//   const aScale = scaleOutput(aOutput, 1);
//   const vScale = scaleOutput(vOutput, 5);

//   let currentX = 0;
//   for (let i = 0; i < numberOfComplexes; i++) {
//     const complexStartX = currentX;
//     for (const pt of workingComplex) {
//       let scaledY = pt.y;
//       if (pt.x >= 26 && pt.x <= 30) {
//         scaledY *= aScale; // P wave
//       } else if (pt.x >= 35.8 && pt.x <= 37) {
//         scaledY *= vScale; // QRS
//       } else if (pt.x >= 39 && pt.x <= 41) {
//         scaledY *= vScale * 0.3; // T wave
//       }

//       points.push({
//         x: complexStartX + pt.x * 5,
//         y: scaledY,
//       });
//     }
//     currentX = complexStartX + complexSpacing;
//   }

//   const targetMinPoints = 350;
//   if (points.length < targetMinPoints) {
//     const lastX = points[points.length - 1]?.x || 0;
//     for (let i = points.length; i < targetMinPoints; i++) {
//       points.push({
//         x: lastX + (i - points.length + 1) * 10,
//         y: 0
//       });
//     }
//   }

//   return points;
// };

// export const generateThirdDegreeBlockPoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
//   currentStep,
//   currentStepIndex = 0,
// }: ECGParams): Point[] => {
//   console.log("🫀 THIRD DEGREE BLOCK GENERATION");
  
//   const points: Point[] = [];
  
//   // Determine pacing state based on step progression and output levels
//   // Atrial capture occurs at 12mA (step td_step7), safety margin at 20mA (step td_step8)
//   const shouldShowAtrialPacing = currentStep && (
//     currentStep.id === "td_step7" || // Full A capture at 12mA
//     currentStep.id === "td_step8"    // A safety margin at 20mA
//   ) && aOutput >= 12; // Full capture threshold

//   // Ventricular capture occurs at 10mA (step td_step15), safety margin at 20mA (step td_step16)
//   const shouldShowVentricularPacing = currentStep && (
//     currentStep.id === "td_step15" || // Full V capture at 10mA
//     currentStep.id === "td_step16"    // V safety margin at 20mA
//   ) && vOutput >= 10; // Full capture threshold

//   // Final VVI pacing for A fib patient (step td_step17)
//   const shouldShowVVIPacing = currentStep && (
//     currentStep.id === "td_step17" // VVI pacing after A fib
//   ) && vOutput >= 10; // Need adequate V output

//   console.log("🔥 MODULE 2 PACING STATE:", { 
//     shouldShowAtrialPacing, 
//     shouldShowVentricularPacing,
//     shouldShowVVIPacing,
//     currentStepId: currentStep?.id, 
//     aOutput, 
//     vOutput 
//   });

//   if (shouldShowVVIPacing) {
//     return generateVentricularPacedRhythm(rate, aOutput, vOutput);
//   } else if (shouldShowVentricularPacing) {
//     return generateVentricularPacedRhythm(rate, aOutput, vOutput);
//   } else if (shouldShowAtrialPacing) {
//     return generateAtrialPacedThirdDegree(rate, aOutput, vOutput);
//   } else {
//     return generateIntrinsicThirdDegreeBlock(rate, aOutput, vOutput);
//   }
// };

// // NEW: Generate atrial paced rhythm for third degree block
// const generateAtrialPacedThirdDegree = (rate: number, aOutput: number, vOutput: number): Point[] => {
//   console.log("💓 Generating ATRIAL PACED third degree block");
//   const points: Point[] = [];
//   const numberOfComplexes = 20;
//   const complexSpacing = 250;

//   // Atrial paced with third degree block - P waves paced but QRS still escape
//   const atrialPacedBlockComplex: Point[] = [
//     // Atrial pacing spike - MADE MORE PROMINENT
//     { x: 15, y: 0 },
//     { x: 16, y: -1.0 },
//     { x: 17, y: 2.8 },  
//     { x: 18, y: -0.4 },
//     { x: 19, y: 0 },
    
//     // Paced P wave
//     { x: 22, y: 0.15 },
//     { x: 24, y: 0.22 },
//     { x: 26, y: 0.15 },
//     { x: 28, y: 0 },

//     // Independent ventricular escape (no relationship to P waves)
//     { x: 70, y: 0.088 },
//     { x: 72, y: 0.176 },
//     { x: 74, y: 0.088 },
//     { x: 95, y: 0 },
//     { x: 100, y: -0.2 },
//     { x: 102, y: 1.2 },
//     { x: 105, y: -0.2 },
//     { x: 108, y: 0 },
//     { x: 115, y: 0.25 },
//     { x: 120, y: 0 },
//   ];

//   for (let i = 0; i < numberOfComplexes; i++) {
//     const offset = i * complexSpacing;
//     for (const pt of atrialPacedBlockComplex) {
//       points.push({
//         x: offset + pt.x * 5,
//         y: pt.y,
//       });
//     }
//   }

//   console.log("✅ Atrial paced third degree block generated:", points.length, "points");
//   return points;
// };

// // NEW: Generate ventricular paced rhythm 
// const generateVentricularPacedRhythm = (rate: number, aOutput: number, vOutput: number): Point[] => {
//   console.log("💓 Generating VENTRICULAR PACED rhythm");
//   const points: Point[] = [];
//   const numberOfComplexes = 20;
//   const complexSpacing = 200;

//   // Ventricular paced complex
//   const ventricularPacedComplex: Point[] = [
//     // Baseline
//     { x: 0, y: 0 },
//     { x: 15, y: 0 },
    
//     // Ventricular pacing spike - MADE MORE PROMINENT
//     { x: 18, y: 0 },
//     { x: 19, y: -1.4 }, // Sharper, deeper downward spike
//     { x: 20, y: 3.2 },  // Taller upward spike
//     { x: 21, y: -0.6 }, // Return
//     { x: 22, y: 0 },
    
//     // Paced QRS (wide and different morphology)
//     { x: 25, y: 0 },
//     { x: 27, y: -0.3 },
//     { x: 30, y: 1.8 },   // Wider, taller QRS
//     { x: 35, y: -0.4 },
//     { x: 40, y: 0 },
    
//     // T wave (often inverted with pacing)
//     { x: 50, y: -0.3 },
//     { x: 55, y: 0 },
//     { x: 90, y: 0 },
//   ];

//   for (let i = 0; i < numberOfComplexes; i++) {
//     const offset = i * complexSpacing;
//     for (const pt of ventricularPacedComplex) {
//       points.push({
//         x: offset + pt.x * 5,
//         y: pt.y,
//       });
//     }
//   }

//   console.log("✅ Ventricular paced rhythm generated:", points.length, "points");
//   return points;
// };

// // Intrinsic third degree block (original)
// const generateIntrinsicThirdDegreeBlock = (rate: number, aOutput: number, vOutput: number): Point[] => {
//   const points: Point[] = [];
//   const blockComplex: Point[] = [
//     { x: 0, y: 0 },
//     { x: 15, y: 0 },
//     { x: 20, y: 0.088 },
//     { x: 22, y: 0.176 },
//     { x: 24, y: 0.088 },
//     { x: 45, y: 0 },
//     { x: 70, y: 0.088 },
//     { x: 72, y: 0.176 },
//     { x: 74, y: 0.088 },
//     { x: 95, y: 0 },
//     { x: 100, y: -0.2 },
//     { x: 102, y: 1.2 },
//     { x: 105, y: -0.2 },
//     { x: 108, y: 0 },
//     { x: 115, y: 0.25 },
//     { x: 120, y: 0 },
//   ];

//   const numberOfComplexes = 20;
//   const complexSpacing = 250;

//   for (let i = 0; i < numberOfComplexes; i++) {
//     const offset = i * complexSpacing;
//     for (const pt of blockComplex) {
//       points.push({
//         x: offset + pt.x * 5,
//         y: pt.y,
//       });
//     }
//   }

//   return points;
// };

// export const generateAtrialFibrillationPoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
//   currentStep,
//   currentStepIndex = 0,
// }: ECGParams): Point[] => {
//   console.log("🫀 ATRIAL FIBRILLATION GENERATION");
  
//   const points: Point[] = [];
  
//   // Determine pacing state based on step progression and output levels
//   // V capture occurs at 7mA (step afib_step8), safety margin at 14mA (step afib_step9)
//   const shouldShowVentricularPacing = currentStep && (
//     currentStep.id === "afib_step8" || // Full V capture at 7mA
//     currentStep.id === "afib_step9" || // Safety margin at 14mA
//     currentStep.id === "afib_step10"   // Final rate - still pacing
//   ) && vOutput >= 7; // Full capture threshold

//   console.log("🔥 MODULE 3 A FIB PACING STATE:", { 
//     shouldShowVentricularPacing,
//     currentStepId: currentStep?.id, 
//     vOutput 
//   });

//   if (shouldShowVentricularPacing) {
//     return generateAFibWithVentricularPacing(rate, aOutput, vOutput);
//   } else {
//     return generateIntrinsicAtrialFibrillation(rate, aOutput, vOutput);
//   }
// };

// // NEW: Generate A fib with ventricular pacing
// const generateAFibWithVentricularPacing = (rate: number, aOutput: number, vOutput: number): Point[] => {
//   console.log("💓 Generating A FIB with VENTRICULAR PACING");
//   const points: Point[] = [];
//   const numberOfComplexes = 24;
//   const baseSpacing = 200;

//   for (let i = 0; i < numberOfComplexes; i++) {
//     const offset = i * baseSpacing;
    
//     // Generate fibrillation waves (chaotic atrial activity)
//     for (let x = 0; x < 60; x += 3) {
//       const fibWave = Math.sin(x * 0.3) * 0.04 + (Math.random() - 0.5) * 0.03;
//       points.push({ 
//         x: offset + x * 5, 
//         y: fibWave 
//       });
//     }
    
//     // Add ventricular pacing spike and paced QRS - MADE MORE PROMINENT
//     const ventricularPacedComplex: Point[] = [
//       // V pacing spike
//       { x: 60, y: 0 },
//       { x: 61, y: -1.3 },
//       { x: 62, y: 3.0 },  
//       { x: 63, y: -0.5 },
//       { x: 64, y: 0 },
      
//       // Paced QRS (wide morphology)
//       { x: 67, y: 0 },
//       { x: 69, y: -0.2 },
//       { x: 72, y: 1.6 },
//       { x: 77, y: -0.3 },
//       { x: 82, y: 0 },
      
//       // T wave
//       { x: 90, y: -0.25 },
//       { x: 95, y: 0 },
//     ];
    
//     for (const pt of ventricularPacedComplex) {
//       points.push({
//         x: offset + pt.x * 5,
//         y: pt.y,
//       });
//     }
//   }

//   console.log("✅ A fib with ventricular pacing generated:", points.length, "points");
//   return points;
// };

// // Intrinsic atrial fibrillation (original)
// const generateIntrinsicAtrialFibrillation = (rate: number, aOutput: number, vOutput: number): Point[] => {
//   const points: Point[] = [];
//   const numberOfComplexes = 24;
//   const baseSpacing = 200;

//   for (let i = 0; i < numberOfComplexes; i++) {
//     const irregularity = (Math.random() - 0.5) * 80;
//     const offset = i * baseSpacing + irregularity;
    
//     // Generate fibrillation waves
//     for (let x = 0; x < 70; x += 3) {
//       const fibWave = Math.sin(x * 0.3) * 0.04 + (Math.random() - 0.5) * 0.03;
//       points.push({ 
//         x: offset + x * 5, 
//         y: fibWave 
//       });
//     }
    
//     // Generate irregular QRS (intrinsic conduction)
//     const irregularQRS: Point[] = [
//       { x: 70, y: 0 },
//       { x: 72, y: -0.15 },
//       { x: 74, y: 1.3 },
//       { x: 76, y: -0.25 },
//       { x: 78, y: 0 },
//       { x: 85, y: 0.2 },
//       { x: 88, y: 0 },
//     ];
    
//     for (const pt of irregularQRS) {
//       points.push({
//         x: offset + pt.x * 5,
//         y: pt.y,
//       });
//     }
//   }

//   return points;
// };

// export const generateNormalPacingPoints = ({
//   rate,
//   aOutput,
//   vOutput,
//   sensitivity,
// }: ECGParams): Point[] => {
//   const points: Point[] = [];
//   const numberOfComplexes = 12;
//   const complexSpacing = 200;

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

//   const scaleOutput = (output: number, max = 5) =>
//     Math.min(max, Math.log(output + 1) / Math.log(6));

//   const aScale = scaleOutput(aOutput, 1);
//   const vScale = scaleOutput(vOutput, 5);

//   for (let i = 0; i < numberOfComplexes; i++) {
//     const offset = i * complexSpacing;

//     for (const pt of baseComplex) {
//       let scaledY = pt.y;

//       if (pt.x >= 1 && pt.x <= 3) {
//         scaledY *= aScale;
//       } else if (pt.x >= 5 && pt.x <= 7) {
//         scaledY *= vScale;
//       } else if (pt.x >= 10 && pt.x <= 12) {
//         scaledY *= vScale * 0.3;
//       }

//       points.push({
//         x: offset + pt.x * 5,
//         y: scaledY,
//       });
//     }
//   }

//   return points;
// };






