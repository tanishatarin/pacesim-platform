import { useState, useEffect, useCallback, useRef } from "react";
import { moduleConfigs, type ModuleStep } from "../data/moduleSteps";

interface UseStepControllerProps {
  moduleId: string;
  currentParams: Record<string, any>;
  isQuizCompleted: boolean;
  currentSession?: any;
  updateStepProgress?: (stepProgress: any) => void;
}

export const useStepController = ({
  moduleId,
  currentParams,
  isQuizCompleted,
  currentSession,
  updateStepProgress,
}: UseStepControllerProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track the session we've initialized for
  const initializedSessionId = useRef<string | null>(null);
  const pendingSaveRef = useRef<NodeJS.Timeout | null>(null);

  const moduleConfig = moduleConfigs[moduleId];
  const steps = moduleConfig?.steps || [];
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    const sessionId = currentSession?.id;

    if (!sessionId) {
      console.log("🔄 No session - resetting step controller");
      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
      setAllStepsCompleted(false);
      setIsInitialized(false);
      initializedSessionId.current = null;
      return;
    }

    // If this is a NEW session (different from what we initialized)
    if (initializedSessionId.current !== sessionId) {
      console.log("🆕 Session detected:", sessionId.slice(-8));

      const stepProgress = currentSession?.practiceState?.stepProgress;
      
      if (stepProgress && typeof stepProgress.currentStepIndex === 'number') {
        console.log("📂 Restoring step progress from session:", stepProgress);
        
        setCurrentStepIndex(stepProgress.currentStepIndex);
        setCompletedSteps(new Set(stepProgress.completedSteps || []));
        setAllStepsCompleted(stepProgress.allStepsCompleted || false);
      } else {
        console.log("🆕 No step progress found - starting fresh");
        setCurrentStepIndex(0);
        setCompletedSteps(new Set());
        setAllStepsCompleted(false);
      }

      setIsInitialized(true);
      initializedSessionId.current = sessionId;

      // Save initial state if this is truly a fresh session
      if (!stepProgress) {
        const freshStepProgress = {
          currentStepIndex: 0,
          completedSteps: [],
          allStepsCompleted: false,
          lastUpdated: new Date().toISOString(),
        };

        if (updateStepProgress) {
          console.log("💾 Saving fresh step progress to new session");
          updateStepProgress(freshStepProgress);
        }
      }
    }
  }, [currentSession?.id, moduleId, updateStepProgress, currentSession?.practiceState?.stepProgress]);

  // 🔥 RESET EVERYTHING WHEN MODULE CHANGES
  useEffect(() => {
    console.log("🔄 Module changed to:", moduleId, "- forcing complete reset");
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setAllStepsCompleted(false);
    setIsInitialized(false);
    initializedSessionId.current = null;

    if (pendingSaveRef.current) {
      clearTimeout(pendingSaveRef.current);
      pendingSaveRef.current = null;
    }
  }, [moduleId]);

  // Debounced save to prevent race conditions
  const saveStepProgress = useCallback(
    (stepIndex: number, completed: Set<string>, allComplete: boolean) => {
      if (!updateStepProgress || !isInitialized || !currentSession?.id) {
        return;
      }

      // Clear any existing pending save
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }

      // Debounce the save operation
      pendingSaveRef.current = setTimeout(() => {
        const stepProgress = {
          currentStepIndex: stepIndex,
          completedSteps: Array.from(completed),
          allStepsCompleted: allComplete,
        };

        console.log("💾 Saving step progress:", stepProgress);
        updateStepProgress(stepProgress);
        pendingSaveRef.current = null;
      }, 300);
    },
    [updateStepProgress, isInitialized, currentSession?.id],
  );

  // Check if step is complete
  const isStepComplete = useCallback(
    (step: ModuleStep, params: Record<string, any>) => {
      if (!step.targetValues) return true;

      if (step.completionCriteria) {
        return step.completionCriteria(params, step.targetValues);
      }

      return Object.entries(step.targetValues).every(([key, targetValue]) => {
        const currentValue = params[key];
        if (
          typeof targetValue === "number" &&
          typeof currentValue === "number"
        ) {
          const tolerance = getParameterTolerance(key, targetValue);
          return Math.abs(currentValue - targetValue) <= tolerance;
        }
        return currentValue === targetValue;
      });
    },
    [],
  );

  const getParameterTolerance = (key: string, targetValue: number) => {
    switch (key) {
      case "rate":
        return 2;
      case "aOutput":
      case "vOutput":
        return targetValue < 1 ? 0.1 : 0.2;
      case "aSensitivity":
      case "vSensitivity":
        return targetValue < 1 ? 0.1 : 0.2;
      case "mode":
        return 0;
      default:
        return Math.max(0.1, Math.abs(targetValue) * 0.05);
    }
  };

  // Handle step completion
  const handleStepComplete = useCallback(
    (stepId: string) => {
      if (!isInitialized || !steps.length) {
        console.log("⚠️ Cannot complete step - not initialized or no steps");
        return;
      }

      console.log("🎯 Step completion for:", stepId);

      // Prevent duplicate completions
      if (completedSteps.has(stepId)) {
        console.log("⚠️ Step already completed, skipping:", stepId);
        return;
      }

      const stepExists = steps.some((step) => step.id === stepId);
      if (!stepExists) {
        console.log("⚠️ Step not found in current module:", stepId);
        return;
      }

      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(stepId);

      const currentStepId = steps[currentStepIndex]?.id;
      if (stepId === currentStepId) {
        if (currentStepIndex < steps.length - 1) {
          const nextIndex = currentStepIndex + 1;
          console.log(`➡️ Moving to step ${nextIndex + 1}/${steps.length}`);

          setCurrentStepIndex(nextIndex);
          setCompletedSteps(newCompletedSteps);
          saveStepProgress(nextIndex, newCompletedSteps, false);
        } else {
          console.log("🎉 All steps completed!");
          setCompletedSteps(newCompletedSteps);
          setAllStepsCompleted(true);
          saveStepProgress(currentStepIndex, newCompletedSteps, true);
        }
      } else {
        setCompletedSteps(newCompletedSteps);
        saveStepProgress(
          currentStepIndex,
          newCompletedSteps,
          allStepsCompleted,
        );
      }
    },
    [
      currentStepIndex,
      steps,
      completedSteps,
      allStepsCompleted,
      saveStepProgress,
      isInitialized,
    ],
  );

  // Auto-complete steps without parameters
  useEffect(() => {
    if (!isQuizCompleted || !currentStep || !isInitialized) return;

    const shouldAutoComplete =
      !currentStep.targetValues ||
      Object.keys(currentStep.targetValues).length === 0;

    if (shouldAutoComplete && !completedSteps.has(currentStep.id)) {
      console.log("⏰ Auto-completing step:", currentStep.id);
      handleStepComplete(currentStep.id);
    }
  }, [
    currentStep,
    isQuizCompleted,
    completedSteps,
    handleStepComplete,
    isInitialized,
  ]);

  // Check for step completion when parameters change
  useEffect(() => {
    if (
      !isQuizCompleted ||
      !currentStep ||
      completedSteps.has(currentStep.id) ||
      !isInitialized
    )
      return;

    if (isStepComplete(currentStep, currentParams)) {
      console.log("✅ Step completion criteria met:", currentStep.id);
      handleStepComplete(currentStep.id);
    }
  }, [
    currentParams,
    currentStep,
    isQuizCompleted,
    isStepComplete,
    completedSteps,
    handleStepComplete,
    isInitialized,
  ]);

  const getFlashingSensor = useCallback(() => {
    return currentStep?.flashingSensor || null;
  }, [currentStep]);

  const getProgressPercentage = useCallback(() => {
    if (steps.length === 0) return 0;
    return Math.round((completedSteps.size / steps.length) * 100);
  }, [steps.length, completedSteps.size]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (!isInitialized || stepIndex < 0 || stepIndex >= steps.length) return;

      console.log("🧭 Manual navigation to step:", stepIndex);
      setCurrentStepIndex(stepIndex);
      saveStepProgress(stepIndex, completedSteps, allStepsCompleted);
    },
    [
      steps.length,
      completedSteps,
      allStepsCompleted,
      saveStepProgress,
      isInitialized,
    ],
  );

  const getStepSummary = useCallback(() => {
    return {
      moduleId,
      totalSteps: steps.length,
      currentStepIndex,
      completedStepsCount: completedSteps.size,
      allStepsCompleted,
      progressPercentage: getProgressPercentage(),
      currentStepId: currentStep?.id || null,
      currentStepObjective: currentStep?.objective || null,
      isInitialized,
      sessionId: currentSession?.id?.slice(-8) || "none",
    };
  }, [
    moduleId,
    steps.length,
    currentStepIndex,
    completedSteps.size,
    allStepsCompleted,
    getProgressPercentage,
    currentStep,
    isInitialized,
    currentSession?.id,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
    };
  }, []);

  return {
    steps,
    currentStep,
    currentStepIndex,
    completedSteps,
    allStepsCompleted,
    isInitialized,
    getProgressPercentage,
    getStepSummary,
    getFlashingSensor,
    handleStepComplete,
    goToStep,
    isStepComplete: (step: ModuleStep) => isStepComplete(step, currentParams),
  };
};
