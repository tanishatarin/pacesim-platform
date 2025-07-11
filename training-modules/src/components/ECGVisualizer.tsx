// made it work, got rid of recharts bc it was nto working. now is html - little old lookign, but works and look scorrect! 


import { useEffect, useState, useMemo, useRef } from "react";
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
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationRef = useRef<number>(0);
  const dataWindowRef = useRef<number[]>([]);

  // Generate points
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
        console.log("⚠️ Unknown ECG mode:", mode, "- using bradycardia as fallback");
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

  // Draw the ECG
  const drawECG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    
    // Small grid (1mm)
    for (let x = 0; x < canvas.width; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Large grid (5mm)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw ECG line
    if (dataWindowRef.current.length > 1) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const xStep = canvas.width / 100; // 100 points across the width
      const yCenter = canvas.height / 2;
      const yScale = canvas.height / 4; // Scale to use full height (-2 to 2 range)
      
      dataWindowRef.current.forEach((y, i) => {
        const x = i * xStep;
        const scaledY = yCenter - (y * yScale);
        
        if (i === 0) {
          ctx.moveTo(x, scaledY);
        } else {
          ctx.lineTo(x, scaledY);
        }
      });
      
      ctx.stroke();
    }
  };

  // Animation loop
  useEffect(() => {
    if (!points || points.length === 0) {
      console.error("❌ No points generated!");
      return;
    }

    // Initialize data window
    const windowSize = 100;
    dataWindowRef.current = [];
    
    // Fill initial window
    for (let i = 0; i < windowSize; i++) {
      dataWindowRef.current.push(points[i % points.length].y);
    }

    let pointIndex = windowSize;
    const speedMultiplier = speedMultipliers[mode] || 1;
    const baseInterval = 50; // Base update rate in ms
    
    // Calculate how many points to advance per frame
    const pointsPerSecond = rate / 60; // Convert BPM to beats per second
    const updatesPerSecond = 1000 / baseInterval;
    const pointsPerUpdate = pointsPerSecond / updatesPerSecond * speedMultiplier;
    
    let accumulator = 0;

    const animate = () => {
      accumulator += pointsPerUpdate;
      
      while (accumulator >= 1) {
        // Shift window and add new point
        dataWindowRef.current.shift();
        dataWindowRef.current.push(points[pointIndex % points.length].y);
        pointIndex++;
        accumulator -= 1;
        
        setCurrentIndex(pointIndex);
      }
      
      drawECG();
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [points, rate, mode]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawECG();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-64 overflow-hidden bg-black relative rounded-lg">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />    
    </div>
  );
};

export default ECGVisualizer;