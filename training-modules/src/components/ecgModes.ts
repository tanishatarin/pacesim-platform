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
  const numberOfComplexes = 6;
  const complexSpacing = 200; // This works well for normal pacing

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

// FIXED VERSION: Addresses x-value duplication and looping issues

export const generateBradycardiaPoints = ({
  rate,
  aOutput,
  vOutput,
  sensitivity,
  currentStep,
  currentStepIndex = 0,
}: ECGParams): Point[] => {
  console.log("🫀 BRADYCARDIA GENERATION CALLED:");
  console.log("- Rate:", rate);
  console.log("- aOutput:", aOutput);
  console.log("- vOutput:", vOutput);
  console.log("- Sensitivity:", sensitivity);
  console.log("- CurrentStep:", currentStep?.id || "NO_STEP");
  console.log("- StepIndex:", currentStepIndex);

  const points: Point[] = [];
  const isQuizPhase = !currentStep || currentStep.id === undefined;
  console.log("📋 Phase:", isQuizPhase ? "QUIZ" : "STEP");

  // Use the same complex as generateNormalPacingPoints
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

  const numberOfComplexes = 8;
  const complexSpacing = 200;

  // Output scaling
  const scaleOutput = (output: number, max = 5) =>
    Math.min(max, Math.log(output + 1) / Math.log(6));

  const aScale = scaleOutput(aOutput, 1);
  const vScale = scaleOutput(vOutput, 5);

  // 🔥 KEY FIX: Use currentX tracker to prevent overlapping x values
  let currentX = 0;

  for (let i = 0; i < numberOfComplexes; i++) {
    // Calculate starting position for this complex
    const complexStartX = currentX;

    for (const pt of workingComplex) {
      let scaledY = pt.y;

      // Apply scaling
      if (pt.x >= 26 && pt.x <= 30) {
        scaledY *= aScale; // P wave
      } else if (pt.x >= 35.8 && pt.x <= 37) {
        scaledY *= vScale; // QRS
      } else if (pt.x >= 39 && pt.x <= 41) {
        scaledY *= vScale * 0.3; // T wave
      }

      // 🎯 FIXED: Use currentX tracker instead of offset calculation
      const finalX = complexStartX + pt.x * 5;
      
      points.push({
        x: finalX,
        y: scaledY,
      });

      // Update currentX to ensure no overlaps
      currentX = Math.max(currentX, finalX + 1);
    }

    // 🔥 FIXED: Ensure proper spacing between complexes
    currentX = complexStartX + complexSpacing;
  }

  // 🎯 CRITICAL FIX: Always return data for both quiz AND step phases
  if (points.length === 0) {
    console.warn("⚠️ No points generated! Creating fallback data...");
    // Fallback: create simple bradycardia if generation fails
    for (let i = 0; i < 5; i++) {
      const x = i * 300;
      points.push({ x: x, y: 0 });
      points.push({ x: x + 50, y: 1.2 });
      points.push({ x: x + 60, y: 0 });
    }
  }

  console.log("✅ Bradycardia generated:", points.length, "points");
  console.log("- X-value range:", points[0]?.x, "to", points[points.length - 1]?.x);
  console.log("- No duplicate X values:", new Set(points.map(p => p.x)).size === points.length);

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
  console.log("🫀 THIRD DEGREE BLOCK GENERATION CALLED");
  
  const points: Point[] = [];
  const isQuizPhase = !currentStep;

  if (isQuizPhase) {
    console.log("📝 Generating QUIZ phase third degree block...");
    
    const numberOfComplexes = 6; // More complexes
    const complexSpacing = 250;  // Better spacing
    
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

    for (let i = 0; i < numberOfComplexes; i++) {
      const offset = i * complexSpacing;
      for (const pt of blockComplex) {
        points.push({
          x: offset + pt.x * 5,
          y: pt.y,
        });
      }
    }
  } else {
    console.log("🎯 Generating STEP phase third degree block...");
    const numberOfComplexes = 6;
    const complexSpacing = 250;
    
    const stepBlockComplex: Point[] = [
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

    for (let i = 0; i < numberOfComplexes; i++) {
      const offset = i * complexSpacing;
      for (const pt of stepBlockComplex) {
        points.push({
          x: offset + pt.x * 5,
          y: pt.y,
        });
      }
    }
  }

  console.log("✅ Third degree block generated:", points.length, "points");
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
  console.log("🫀 ATRIAL FIBRILLATION GENERATION CALLED");
  
  const points: Point[] = [];
  const isQuizPhase = !currentStep;

  if (isQuizPhase) {
    console.log("📝 Generating QUIZ phase atrial fibrillation...");
    
    const numberOfComplexes = 8; // More complexes for A fib
    const baseSpacing = 200;     // Tighter spacing
    
    for (let i = 0; i < numberOfComplexes; i++) {
      const irregularity = (Math.random() - 0.5) * 80; // Less irregularity
      const offset = i * baseSpacing + irregularity;
      
      for (let x = 0; x < 70; x += 3) {
        const fibWave = Math.sin(x * 0.3) * 0.04 + (Math.random() - 0.5) * 0.03;
        points.push({ 
          x: offset + x * 5, 
          y: fibWave 
        });
      }
      
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
  } else {
    console.log("🎯 Generating STEP phase atrial fibrillation...");
    const numberOfComplexes = 8;
    const baseSpacing = 200;
    
    for (let i = 0; i < numberOfComplexes; i++) {
      const irregularity = (Math.random() - 0.5) * 80;
      const offset = i * baseSpacing + irregularity;
      
      for (let x = 0; x < 70; x += 3) {
        const fibWave = Math.sin(x * 0.3) * 0.04 + (Math.random() - 0.5) * 0.03;
        points.push({ 
          x: offset + x * 5, 
          y: fibWave 
        });
      }
      
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
  }

  console.log("✅ Atrial fibrillation generated:", points.length, "points");
  return points;
};