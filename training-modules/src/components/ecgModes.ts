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
