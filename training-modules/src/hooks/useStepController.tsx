import { useState, useEffect, useCallback } from 'react';
import { moduleConfigs, type ModuleStep } from '../data/moduleSteps';

interface UseStepControllerProps {
  moduleId: string;
  currentParams: Record<string, any>;
  isQuizCompleted: boolean;
  currentSession?: any; // Add session to restore state
  onParameterChange?: (param: string, oldValue: number, newValue: number) => void;
}

export const useStepController = ({
  moduleId,
  currentParams,
  isQuizCompleted,
  currentSession,
  onParameterChange
}: UseStepControllerProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const moduleConfig = moduleConfigs[moduleId];
  const steps = moduleConfig?.steps || [];
  const currentStep = steps[currentStepIndex];

  // Reset when module changes, but restore from session if available
  useEffect(() => {
    if (!isInitialized) {
      // Try to restore state from session
      if (currentSession?.practiceState?.stepProgress) {
        const stepProgress = currentSession.practiceState.stepProgress;
        
        console.log('🔄 Restoring step progress from session:', stepProgress);
        
        setCurrentStepIndex(stepProgress.currentStepIndex || 0);
        setCompletedSteps(new Set(stepProgress.completedSteps || []));
        setAllStepsCompleted(stepProgress.allStepsCompleted || false);
      } else {
        // Fresh start
        console.log('🆕 Starting fresh step progress');
        setCurrentStepIndex(0);
        setCompletedSteps(new Set());
        setAllStepsCompleted(false);
      }
      
      setIsInitialized(true);
    }
  }, [moduleId, currentSession, isInitialized]);

  // Check if current step should auto-complete (no target values)
  const shouldAutoComplete = useCallback((step: ModuleStep) => {
    return !step.targetValues || Object.keys(step.targetValues).length === 0;
  }, []);

  // Check if step is complete based on target values
  const isStepComplete = useCallback((step: ModuleStep, params: Record<string, any>) => {
    if (!step.targetValues) return true;

    const isComplete = Object.entries(step.targetValues).every(([key, targetValue]) => {
      const currentValue = params[key];
      if (typeof targetValue === 'number' && typeof currentValue === 'number') {
        // Use appropriate tolerance based on parameter type
        const tolerance = getParameterTolerance(key, targetValue);
        const withinTolerance = Math.abs(currentValue - targetValue) <= tolerance;
        
        console.log(`🔍 Checking ${key}: current=${currentValue}, target=${targetValue}, tolerance=${tolerance}, within=${withinTolerance}`);
        
        return withinTolerance;
      }
      return currentValue === targetValue;
    });

    return isComplete;
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

  // Save step progress to session
  const saveStepProgress = useCallback((stepIndex: number, completed: Set<string>, allComplete: boolean) => {
    if (currentSession?.id && onParameterChange) {
      // Use a special parameter change to save step progress
      const stepProgress = {
        currentStepIndex: stepIndex,
        completedSteps: Array.from(completed),
        allStepsCompleted: allComplete
      };
      
      console.log('💾 Saving step progress:', stepProgress);
      
      // We'll handle this in the parent component through a special update
      if ((window as any).updateSessionStepProgress) {
        (window as any).updateSessionStepProgress(stepProgress);
      }
    }
  }, [currentSession, onParameterChange]);

  // Handle step completion
  const handleStepComplete = useCallback((stepId: string) => {
    console.log('🎯 Step completed:', stepId);
    
    // Prevent duplicate completions
    if (completedSteps.has(stepId)) {
      console.log('⚠️ Step already completed, skipping');
      return;
    }
    
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepId);
      
      // Check if this is the current step being completed
      const currentStepId = steps[currentStepIndex]?.id;
      if (stepId === currentStepId) {
        // Move to next step if available
        if (currentStepIndex < steps.length - 1) {
          const nextIndex = currentStepIndex + 1;
          console.log(`➡️ Moving to next step: ${nextIndex}`);
          
          setTimeout(() => {
            setCurrentStepIndex(nextIndex);
            saveStepProgress(nextIndex, newSet, false);
          }, 500); // Small delay for UX
        } else {
          // All steps completed
          console.log('🎉 All module steps completed!');
          setAllStepsCompleted(true);
          saveStepProgress(currentStepIndex, newSet, true);
        }
      }
      
      return newSet;
    });
  }, [currentStepIndex, steps, completedSteps, saveStepProgress]);

  // Auto-complete steps that don't require parameter changes
  useEffect(() => {
    if (!isQuizCompleted || !currentStep || !isInitialized) return;

    if (shouldAutoComplete(currentStep) && !completedSteps.has(currentStep.id)) {
      console.log('⏰ Auto-completing step:', currentStep.id);
      
      const timer = setTimeout(() => {
        handleStepComplete(currentStep.id);
      }, 3000); // 3 second delay for user to read

      return () => clearTimeout(timer);
    }
  }, [currentStep, isQuizCompleted, shouldAutoComplete, completedSteps, handleStepComplete, isInitialized]);

  // Check for step completion when parameters change - with debouncing
  useEffect(() => {
    if (!isQuizCompleted || !currentStep || completedSteps.has(currentStep.id) || !isInitialized) return;

    console.log('🔄 Checking step completion for:', currentStep.id);

    if (isStepComplete(currentStep, currentParams)) {
      console.log('✅ Step completion criteria met for:', currentStep.id);
      
      // Add delay to prevent immediate completion and ensure stability
      const timer = setTimeout(() => {
        // Double-check that conditions are still met
        if (isStepComplete(currentStep, currentParams) && !completedSteps.has(currentStep.id)) {
          console.log('✅ Step completion confirmed after delay:', currentStep.id);
          handleStepComplete(currentStep.id);
        }
      }, 1500); // Increased delay for stability

      return () => clearTimeout(timer);
    }
  }, [currentParams, currentStep, isQuizCompleted, isStepComplete, completedSteps, handleStepComplete, isInitialized]);

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
      saveStepProgress(stepIndex, completedSteps, allStepsCompleted);
    }
  }, [steps.length, completedSteps, allStepsCompleted, saveStepProgress]);

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
    isInitialized,

    // Progress info
    getProgressPercentage,
    getStepSummary,

    // Sensor flashing
    getFlashingSensor,

    // Actions
    handleStepComplete,
    goToStep,

    // Utilities
    isStepComplete: (step: ModuleStep) => isStepComplete(step, currentParams)
  };
};