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

  // ✅ SIMPLIFIED LOGIC: If no currentStep passed, it's QUIZ phase
  const isQuizPhase = !currentStep;
  console.log("📋 Phase:", isQuizPhase ? "QUIZ" : "STEP");

  if (isQuizPhase) {
    // ✅ QUIZ PHASE: Always use the same simple bradycardia pattern
    console.log("📝 Generating QUIZ phase bradycardia...");

    const numberOfComplexes = 4;
    const complexSpacing = 300; // Slow bradycardia spacing

    // Use a consistent, simple bradycardia complex
    const simpleComplex: Point[] = [
      { x: 0, y: 0 },      // Baseline
      { x: 20, y: 0 },     // Baseline
      { x: 25, y: 0.1 },   // P wave start
      { x: 27, y: 0.2 },   // P wave peak
      { x: 29, y: 0.1 },   // P wave end
      { x: 35, y: 0 },     // PR segment
      { x: 40, y: -0.2 },  // Q wave
      { x: 42, y: 1.5 },   // R wave peak
      { x: 44, y: -0.3 },  // S wave
      { x: 46, y: 0 },     // J point
      { x: 50, y: 0 },     // ST segment
      { x: 55, y: 0.1 },   // T wave start
      { x: 58, y: 0.3 },   // T wave peak
      { x: 61, y: 0.1 },   // T wave end
      { x: 65, y: 0 },     // Baseline
      { x: 80, y: 0 },     // Extended baseline
    ];

    // Generate multiple complexes
    for (let i = 0; i < numberOfComplexes; i++) {
      const offset = i * complexSpacing;

      for (const pt of simpleComplex) {
        points.push({
          x: offset + pt.x,
          y: pt.y,
        });
      }
    }

    console.log("✅ QUIZ bradycardia generated:", points.length, "points");
    console.log("- First point:", points[0]);
    console.log("- Last point:", points[points.length - 1]);
    console.log("- Sample middle:", points[Math.floor(points.length / 2)]);

    return points;
  }

  // ✅ STEP PHASE: Use step-aware logic that changes based on current step
  console.log("🎯 Generating STEP phase bradycardia...");
  
  // For now, return the same simple pattern to test the fix
  // You can add the step-specific logic later once this works
  const numberOfComplexes = 4;
  const complexSpacing = 300;

  const stepComplex: Point[] = [
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 25, y: 0.1 },
    { x: 27, y: 0.2 },
    { x: 29, y: 0.1 },
    { x: 35, y: 0 },
    { x: 40, y: -0.2 },
    { x: 42, y: 1.5 },
    { x: 44, y: -0.3 },
    { x: 46, y: 0 },
    { x: 50, y: 0 },
    { x: 55, y: 0.1 },
    { x: 58, y: 0.3 },
    { x: 61, y: 0.1 },
    { x: 65, y: 0 },
    { x: 80, y: 0 },
  ];

  for (let i = 0; i < numberOfComplexes; i++) {
    const offset = i * complexSpacing;
    for (const pt of stepComplex) {
      points.push({
        x: offset + pt.x,
        y: pt.y,
      });
    }
  }

  console.log("✅ STEP bradycardia generated:", points.length, "points");
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
    
    // Create simple third degree block pattern for quiz
    const numberOfComplexes = 4;
    const complexSpacing = 300;
    
    const blockComplex: Point[] = [
      { x: 0, y: 0 },
      { x: 15, y: 0 },
      { x: 20, y: 0.15 },   // P wave (atrial)
      { x: 22, y: 0.15 },
      { x: 24, y: 0 },
      { x: 45, y: 0 },      // No QRS following P
      { x: 70, y: 0.12 },   // Another P wave
      { x: 72, y: 0.12 },
      { x: 74, y: 0 },
      { x: 95, y: 0 },
      { x: 100, y: -0.2 },  // Independent ventricular escape
      { x: 102, y: 1.2 },   // Wider QRS
      { x: 105, y: -0.2 },
      { x: 108, y: 0 },
      { x: 120, y: 0 },
    ];

    for (let i = 0; i < numberOfComplexes; i++) {
      const offset = i * complexSpacing;
      for (const pt of blockComplex) {
        points.push({
          x: offset + pt.x,
          y: pt.y,
        });
      }
    }
  } else {
    console.log("🎯 Generating STEP phase third degree block...");
    // Add step-specific logic here later
    // For now, use same pattern
    const numberOfComplexes = 4;
    const complexSpacing = 300;
    
    const stepBlockComplex: Point[] = [
      { x: 0, y: 0 },
      { x: 15, y: 0 },
      { x: 20, y: 0.15 },
      { x: 22, y: 0.15 },
      { x: 24, y: 0 },
      { x: 45, y: 0 },
      { x: 70, y: 0.12 },
      { x: 72, y: 0.12 },
      { x: 74, y: 0 },
      { x: 95, y: 0 },
      { x: 100, y: -0.2 },
      { x: 102, y: 1.2 },
      { x: 105, y: -0.2 },
      { x: 108, y: 0 },
      { x: 120, y: 0 },
    ];

    for (let i = 0; i < numberOfComplexes; i++) {
      const offset = i * complexSpacing;
      for (const pt of stepBlockComplex) {
        points.push({
          x: offset + pt.x,
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
    
    // Create simple A fib pattern for quiz
    const numberOfComplexes = 5;
    const baseSpacing = 250;
    
    for (let i = 0; i < numberOfComplexes; i++) {
      // Irregular spacing for A fib
      const irregularity = (Math.random() - 0.5) * 100;
      const offset = i * baseSpacing + irregularity;
      
      // Fibrillatory baseline
      for (let x = 0; x < 40; x += 2) {
        const fibWave = Math.sin(x * 0.5) * 0.05 + (Math.random() - 0.5) * 0.03;
        points.push({ x: offset + x, y: fibWave });
      }
      
      // Irregular QRS
      const qrsComplex: Point[] = [
        { x: 40, y: 0 },
        { x: 42, y: -0.1 },
        { x: 44, y: 1.3 },
        { x: 46, y: -0.2 },
        { x: 48, y: 0 },
        { x: 55, y: 0.2 },
        { x: 58, y: 0 },
      ];
      
      for (const pt of qrsComplex) {
        points.push({
          x: offset + pt.x,
          y: pt.y,
        });
      }
    }
  } else {
    console.log("🎯 Generating STEP phase atrial fibrillation...");
    // Add step-specific logic here later
    // For now, use same pattern as quiz
    const numberOfComplexes = 5;
    const baseSpacing = 250;
    
    for (let i = 0; i < numberOfComplexes; i++) {
      const irregularity = (Math.random() - 0.5) * 100;
      const offset = i * baseSpacing + irregularity;
      
      for (let x = 0; x < 40; x += 2) {
        const fibWave = Math.sin(x * 0.5) * 0.05 + (Math.random() - 0.5) * 0.03;
        points.push({ x: offset + x, y: fibWave });
      }
      
      const qrsComplex: Point[] = [
        { x: 40, y: 0 },
        { x: 42, y: -0.1 },
        { x: 44, y: 1.3 },
        { x: 46, y: -0.2 },
        { x: 48, y: 0 },
        { x: 55, y: 0.2 },
        { x: 58, y: 0 },
      ];
      
      for (const pt of qrsComplex) {
        points.push({
          x: offset + pt.x,
          y: pt.y,
        });
      }
    }
  }

  console.log("✅ Atrial fibrillation generated:", points.length, "points");
  return points;
};