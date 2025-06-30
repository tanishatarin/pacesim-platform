import { useState, useEffect, useCallback } from 'react';
import { moduleConfigs, type ModuleStep } from '../data/moduleSteps';

interface UseStepControllerProps {
  moduleId: string;
  currentParams: Record<string, any>;
  isQuizCompleted: boolean;
  onParameterChange?: (param: string, oldValue: number, newValue: number) => void;
}

export const useStepController = ({
  moduleId,
  currentParams,
  isQuizCompleted,
  onParameterChange
}: UseStepControllerProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);

  const moduleConfig = moduleConfigs[moduleId];
  const steps = moduleConfig?.steps || [];
  const currentStep = steps[currentStepIndex];

  // Reset when module changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setAllStepsCompleted(false);
  }, [moduleId]);

  // Check if current step should auto-complete (no target values)
  const shouldAutoComplete = useCallback((step: ModuleStep) => {
    return !step.targetValues || Object.keys(step.targetValues).length === 0;
  }, []);

  // Check if step is complete based on target values
  const isStepComplete = useCallback((step: ModuleStep, params: Record<string, any>) => {
    if (!step.targetValues) return true;

    return Object.entries(step.targetValues).every(([key, targetValue]) => {
      const currentValue = params[key];
      if (typeof targetValue === 'number' && typeof currentValue === 'number') {
        // Use appropriate tolerance based on parameter type
        const tolerance = getParameterTolerance(key, targetValue);
        return Math.abs(currentValue - targetValue) <= tolerance;
      }
      return currentValue === targetValue;
    });
  }, []);

  // Get appropriate tolerance for different parameter types
  const getParameterTolerance = (key: string, targetValue: number) => {
    switch (key) {
      case 'rate':
        return 2; // ±2 BPM
      case 'aOutput':
      case 'vOutput':
        return targetValue < 1 ? 0.1 : 0.2; // ±0.1mA for small values, ±0.2mA for larger
      case 'aSensitivity':
      case 'vSensitivity':
        return targetValue < 1 ? 0.1 : 0.2; // ±0.1mV for small values, ±0.2mV for larger
      case 'mode':
        return 0; // Exact match required
      default:
        return Math.max(0.1, Math.abs(targetValue) * 0.05); // 5% tolerance with minimum 0.1
    }
  };

  // Handle step completion
  const handleStepComplete = useCallback((stepId: string) => {
    console.log('🎯 Step completed:', stepId);
    
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepId);
      return newSet;
    });

    // Move to next step if available
    if (currentStepIndex < steps.length - 1) {
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 500); // Small delay for UX
    } else {
      // All steps completed
      setAllStepsCompleted(true);
      console.log('🎉 All module steps completed!');
    }
  }, [currentStepIndex, steps.length]);

  // Auto-complete steps that don't require parameter changes
  useEffect(() => {
    if (!isQuizCompleted || !currentStep) return;

    if (shouldAutoComplete(currentStep) && !completedSteps.has(currentStep.id)) {
      const timer = setTimeout(() => {
        handleStepComplete(currentStep.id);
      }, 3000); // 3 second delay for user to read

      return () => clearTimeout(timer);
    }
  }, [currentStep, isQuizCompleted, shouldAutoComplete, completedSteps, handleStepComplete]);

  // Check for step completion when parameters change
  useEffect(() => {
    if (!isQuizCompleted || !currentStep || completedSteps.has(currentStep.id)) return;

    if (isStepComplete(currentStep, currentParams)) {
      // Add small delay to prevent immediate completion
      const timer = setTimeout(() => {
        if (isStepComplete(currentStep, currentParams)) {
          handleStepComplete(currentStep.id);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentParams, currentStep, isQuizCompleted, isStepComplete, completedSteps, handleStepComplete]);

  // Get allowed controls for current step
  const getAllowedControls = useCallback(() => {
    if (!currentStep) return [];
    return currentStep.allowedControls || [];
  }, [currentStep]);

  // Check if a specific control is allowed
  const isControlAllowed = useCallback((controlName: string) => {
    const allowedControls = getAllowedControls();
    return allowedControls.length === 0 || allowedControls.includes(controlName);
  }, [getAllowedControls]);

  // Get flashing sensor for current step
  const getFlashingSensor = useCallback(() => {
    return currentStep?.flashingSensor || null;
  }, [currentStep]);

  // Get progress percentage
  const getProgressPercentage = useCallback(() => {
    if (steps.length === 0) return 0;
    return Math.round((completedSteps.size / steps.length) * 100);
  }, [steps.length, completedSteps.size]);

  // Manual step navigation (for debugging or review)
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
    }
  }, [steps.length]);

  // Get step summary for session tracking
  const getStepSummary = useCallback(() => {
    return {
      moduleId,
      totalSteps: steps.length,
      currentStepIndex,
      completedStepsCount: completedSteps.size,
      allStepsCompleted,
      progressPercentage: getProgressPercentage(),
      currentStepId: currentStep?.id || null,
      currentStepObjective: currentStep?.objective || null
    };
  }, [
    moduleId,
    steps.length,
    currentStepIndex,
    completedSteps.size,
    allStepsCompleted,
    getProgressPercentage,
    currentStep
  ]);

  return {
    // Current state
    steps,
    currentStep,
    currentStepIndex,
    completedSteps,
    allStepsCompleted,

    // Progress info
    getProgressPercentage,
    getStepSummary,

    // Control info
    getAllowedControls,
    isControlAllowed,
    getFlashingSensor,

    // Actions
    handleStepComplete,
    goToStep,

    // Utilities
    isStepComplete: (step: ModuleStep) => isStepComplete(step, currentParams)
  };
};