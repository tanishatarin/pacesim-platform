import type { ModuleStep } from "@/types/module";

export type Point = { x: number; y: number };

type ECGParams = {
  rate: number;
  aOutput: number;
  vOutput: number;
  sensitivity: number;
  currentStep?: ModuleStep | null; // ← ADD THIS LINE
  currentStepIndex?: number; // ← ADD THIS LINE
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

  // ✅ DETECT QUIZ PHASE vs STEP PHASE
  const isQuizPhase = !currentStep || currentStep.id === undefined;
  console.log("📋 Phase:", isQuizPhase ? "QUIZ" : "STEP");

  if (isQuizPhase) {
    // ✅ QUIZ PHASE: Use the EXACT original bradycardia pattern
    console.log("📝 Generating QUIZ phase bradycardia...");

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
          y: pt.y,
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

    console.log("✅ QUIZ bradycardia generated:", points.length, "points");
    console.log("- First point:", points[0]);
    console.log("- Last point:", points[points.length - 1]);
    console.log("- Sample middle:", points[Math.floor(points.length / 2)]);

    return points;
  }

  // ✅ STEP PHASE: Use step-aware logic (existing logic)
  console.log("🎯 Generating STEP phase bradycardia...");

  // Your existing step-aware logic here...
  // (Keep the rest of the function as it was)

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
  console.log("💔 THIRD DEGREE BLOCK GENERATION:", {
    rate,
    vOutput,
    sensitivity,
    currentStep: currentStep?.id || "NO_STEP",
  });

  const points: Point[] = [];

  // Determine if we're in quiz phase or step phase
  const isQuizPhase = !currentStep || currentStep.id === undefined;

  if (isQuizPhase) {
    // QUIZ PHASE: Show classic third degree block pattern
    console.log("📝 Generating QUIZ phase third degree block...");

    const numberOfComplexes = 6;
    const complexSpacing = 250; // Slow ventricular escape rhythm spacing

    // P waves occur regularly but are completely dissociated from QRS
    const pWaveInterval = 120; // Regular P wave timing (faster than QRS)
    const qrsInterval = complexSpacing; // Slow, regular ventricular escape

    let xCursor = 0;
    let pWaveTime = 0;
    let qrsTime = 0;

    // Generate for total duration
    const totalDuration = numberOfComplexes * complexSpacing;

    while (xCursor < totalDuration) {
      let y = 0;

      // Add P waves (regular, dissociated)
      if (Math.abs(xCursor - pWaveTime) < 5) {
        y += 0.15 * Math.sin((Math.PI * (xCursor - pWaveTime + 5)) / 10);
      }

      // Add QRS complexes (slow, regular escape rhythm)
      if (Math.abs(xCursor - qrsTime) < 10) {
        const qrsPosition = (xCursor - qrsTime + 10) / 20;
        if (qrsPosition >= 0 && qrsPosition <= 1) {
          // Wide, slow QRS complex (ventricular escape)
          if (qrsPosition < 0.3) {
            y -= 0.3; // Q wave
          } else if (qrsPosition < 0.6) {
            y += 1.2; // R wave (wider than normal)
          } else {
            y -= 0.4; // S wave
          }
        }
      }

      points.push({ x: xCursor, y });

      // Advance time cursors
      xCursor += 5;

      // Update P wave timing (regular, faster than QRS)
      if (xCursor >= pWaveTime + pWaveInterval) {
        pWaveTime += pWaveInterval;
      }

      // Update QRS timing (regular, slow escape)
      if (xCursor >= qrsTime + qrsInterval) {
        qrsTime += qrsInterval;
      }
    }

    console.log(
      "✅ Third degree block pattern generated:",
      points.length,
      "points",
    );
    return points;
  }

  // STEP PHASE: Modify pattern based on current step
  console.log("🎯 Generating STEP phase third degree block...");

  // For now, return the same pattern - you can modify based on pacing settings later
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
  console.log("🌊 ATRIAL FIBRILLATION GENERATION:", {
    rate,
    aOutput,
    vOutput,
    currentStep: currentStep?.id || "NO_STEP",
  });

  const points: Point[] = [];

  const isQuizPhase = !currentStep || currentStep.id === undefined;

  if (isQuizPhase) {
    // QUIZ PHASE: Show A fib with slow ventricular response
    console.log("📝 Generating QUIZ phase atrial fibrillation...");

    const totalDuration = 1500;
    const avgVentricularInterval = 400; // Slow ventricular response (38 BPM equivalent)

    let xCursor = 0;
    let nextQrsTime = 150;

    while (xCursor < totalDuration) {
      let y = 0;

      // Add fibrillatory waves (chaotic atrial activity)
      const fibrillationAmplitude =
        0.05 +
        0.03 * Math.sin(xCursor * 0.1) +
        0.02 * Math.sin(xCursor * 0.3) +
        0.015 * Math.sin(xCursor * 0.7);
      y += fibrillationAmplitude;

      // Add irregular QRS complexes
      if (Math.abs(xCursor - nextQrsTime) < 15) {
        const qrsPosition = (xCursor - nextQrsTime + 15) / 30;
        if (qrsPosition >= 0 && qrsPosition <= 1) {
          if (qrsPosition < 0.2) {
            y -= 0.2; // Q wave
          } else if (qrsPosition < 0.5) {
            y += 1.0; // R wave
          } else if (qrsPosition < 0.7) {
            y -= 0.3; // S wave
          } else {
            y += 0.2; // T wave
          }
        }

        // Set next QRS time (irregular intervals)
        if (xCursor >= nextQrsTime + 15) {
          const irregularity = (Math.random() - 0.5) * 100; // ±50ms variation
          nextQrsTime += avgVentricularInterval + irregularity;
        }
      }

      points.push({ x: xCursor, y });
      xCursor += 5;
    }

    console.log(
      "✅ Atrial fibrillation pattern generated:",
      points.length,
      "points",
    );
    return points;
  }

  // STEP PHASE: Show effects of pacing settings
  console.log("🎯 Generating STEP phase atrial fibrillation...");

  // Check if atrial pacing is disabled (step 2 and beyond)
  const atrialPacingOff =
    currentStep?.id &&
    (currentStep.id === "afib_step2" ||
      parseInt(currentStep.id.split("step")[1]) > 2);

  if (atrialPacingOff && aOutput === 0) {
    // Show A fib without atrial pacing artifacts
    console.log("🚫 Atrial pacing disabled - clean A fib pattern");
  } else if (aOutput > 0) {
    // Show inappropriate atrial pacing spikes in A fib
    console.log("⚠️ Inappropriate atrial pacing in A fib");
  }

  // Return the base A fib pattern for now
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
