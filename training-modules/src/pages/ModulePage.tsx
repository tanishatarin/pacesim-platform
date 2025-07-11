// july 10 -  hr & bp can chnage - but resume does nto work + these values are wrong right now ! 




 import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lightbulb,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import ECGVisualizer from "../components/ECGVisualizer";
import MultipleChoiceQuiz from "../components/MultipleChoiceQuiz";
import ResumeSessionBanner from "../components/ResumeSessionBanner";
import StepProgress from "../components/StepProgress";
import { useStepController } from "../hooks/useStepController";
import { useAuth } from "../hooks/useAuth";
import { useSession } from "../hooks/useSession";
import { usePacemakerData } from "../hooks/usePacemakerData";
// 🔥 NEW IMPORTS - Import from the enhanced moduleSteps
import { moduleConfigs } from "../data/moduleSteps";

// 🔥 NEW - Helper function for patient vitals
interface PatientVitals {
  intrinsicHeartRate: number;
  bloodPressure: string;
}

export const getCurrentPatientVitals = (
  moduleId: string,
  currentStepIndex: number,
  steps: any[],
  allStepsCompleted: boolean = false
): PatientVitals => {
  console.log("🏥 Getting patient vitals for:", {
    moduleId,
    currentStepIndex,
    totalSteps: steps.length,
    allStepsCompleted,
  });

  const moduleConfig = moduleConfigs[moduleId];
  
  if (!moduleConfig) {
    console.warn("⚠️ Module config not found, using defaults");
    return {
      intrinsicHeartRate: 60,
      bloodPressure: "120/80",
    };
  }

  // If no steps or steps not started, use module defaults
  if (!steps.length || currentStepIndex < 0) {
    console.log("📊 Using module default vitals");
    return moduleConfig.defaultPatientVitals;
  }

  // If all steps completed, use the last step's vitals
  if (allStepsCompleted && steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    const vitals = lastStep.patientVitals || moduleConfig.defaultPatientVitals;
    console.log("🏁 Using final step vitals:", vitals);
    return vitals;
  }

  // Get current step vitals
  const currentStep = steps[currentStepIndex];
  if (currentStep?.patientVitals) {
    console.log(`📈 Using step ${currentStepIndex + 1} vitals:`, currentStep.patientVitals);
    return currentStep.patientVitals;
  }

  // Fallback to module defaults
  console.log("🔄 Falling back to module default vitals");
  return moduleConfig.defaultPatientVitals;
};

// 🔥 SIMPLIFIED - Use the basic ModuleConfig interface for the local configs used for UI controls
interface SimpleModuleConfig {
  title: string;
  objective: string;
  mode: "sensitivity" | "third_degree_block" | "atrial_fibrillation";
  initialParams: {
    rate: number;
    aOutput: number;
    vOutput: number;
    aSensitivity: number;
    vSensitivity: number;
  };
  controlsNeeded: {
    rate: boolean;
    aOutput: boolean;
    vOutput: boolean;
    aSensitivity: boolean;
    vSensitivity: boolean;
  };
}

// 🔥 SIMPLIFIED - Just the UI-specific configs (no patient vitals here - those come from moduleSteps)
const simpleModuleConfigs: Record<string, SimpleModuleConfig> = {
  "1": {
    title: "Scenario 1: Bradycardia Management",
    objective:
      "Diagnose and correct a failure to sense condition. Complete the knowledge check and then adjust the pacemaker.\n\nScenario: You return to a patient's room and observe this ECG pattern. Their heart rate has dropped to 40 BPM and atrial leads are connected.",
    mode: "sensitivity",
    initialParams: {
      rate: 40,
      aOutput: 2,
      vOutput: 3,
      aSensitivity: 1,
      vSensitivity: 2,
    },
    controlsNeeded: {
      rate: true,
      aOutput: true,
      vOutput: false,
      aSensitivity: true,
      vSensitivity: false,
    },
  },

  "2": {
    title: "Scenario 2: Third Degree Heart Block",
    objective:
      "Diagnose and manage third degree heart block with appropriate VVI pacing settings.\n\nScenario: POD 3 MVR patient feeling 'funny'. HR is 30, BP is 85/50 MAP (62). You have 1V and 1 skin wire available.",
    mode: "third_degree_block",
    initialParams: {
      rate: 30,
      aOutput: 1,
      vOutput: 1,
      aSensitivity: 1,
      vSensitivity: 1,
    },
    controlsNeeded: {
      rate: true,
      aOutput: false,
      vOutput: true,
      aSensitivity: false,
      vSensitivity: true,
    },
  },

  "3": {
    title: "Scenario 3: Atrial Fibrillation with Bradycardia",
    objective:
      "Manage atrial fibrillation patient who developed bradycardia after rate control medications.\n\nScenario: POD 3 AVR patient developed A fib with rapid rate. After amiodarone and metoprolol, HR dropped to 38 with BP 77/43 MAP (54). Patient still in A fib.",
    mode: "atrial_fibrillation",
    initialParams: {
      rate: 38,
      aOutput: 5,
      vOutput: 1,
      aSensitivity: 2,
      vSensitivity: 2,
    },
    controlsNeeded: {
      rate: true,
      aOutput: true,
      vOutput: true,
      aSensitivity: true,
      vSensitivity: true,
    },
  },
};

// Custom slider component (unchanged)
const CustomSlider = ({
  label,
  value,
  onChange,
  type,
  onParameterChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type: "aOutput" | "vOutput" | "rate" | "aSensitivity" | "vSensitivity";
  onParameterChange: (
    param: string,
    oldValue: number,
    newValue: number,
  ) => void;
}) => {
  const getStepSize = (currentValue: number, type: string) => {
    switch (type) {
      case "aOutput":
        if (currentValue <= 0.4) return 0.1;
        if (currentValue <= 1.0) return 0.2;
        if (currentValue <= 5.0) return 0.5;
        return 1.0;
      case "vOutput":
        if (currentValue <= 0.4) return 0.1;
        if (currentValue <= 1.0) return 0.2;
        if (currentValue <= 5.0) return 0.5;
        return 1.0;
      case "rate":
        if (currentValue <= 50) return 5;
        if (currentValue <= 100) return 2;
        if (currentValue <= 170) return 5;
        return 6;
      case "aSensitivity":
        if (currentValue >= 3) return 1;
        if (currentValue >= 2) return 0.5;
        if (currentValue >= 0.8) return 0.2;
        return 0.1;
      case "vSensitivity":
        if (currentValue >= 10) return 2;
        if (currentValue >= 3) return 1;
        if (currentValue >= 1) return 0.5;
        return 0.2;
      default:
        return 0.1;
    }
  };

  const getRange = (type: string) => {
    switch (type) {
      case "aOutput":
        return { min: 0.1, max: 20.0 };
      case "vOutput":
        return { min: 0.1, max: 25.0 };
      case "rate":
        return { min: 30, max: 180 };
      case "aSensitivity":
        return { min: 0.4, max: 10 };
      case "vSensitivity":
        return { min: 0.8, max: 20 };
      default:
        return { min: 0, max: 100 };
    }
  };

  const range = getRange(type);
  const step = getStepSize(value, type);

  const handleChange = (newValue: number) => {
    const oldValue = value;
    const finalValue = parseFloat(newValue.toFixed(1));

    if (Math.abs(oldValue - finalValue) < 0.001) return;

    onParameterChange(type, oldValue, finalValue);
    onChange(finalValue);
  };

  const getUnit = (type: string) => {
    switch (type) {
      case "aOutput":
      case "vOutput":
        return "mA";
      case "rate":
        return "BPM";
      case "aSensitivity":
      case "vSensitivity":
        return "mV";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}:{" "}
        <span className="font-mono text-blue-600">
          {value} {getUnit(type)}
        </span>
      </label>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleChange(Math.max(range.min, value - step))}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
          disabled={value <= range.min}
        >
          −
        </button>
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={step}
          value={value}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <button
          onClick={() => handleChange(Math.min(range.max, value + step))}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
          disabled={value >= range.max}
        >
          +
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {range.min} {getUnit(type)}
        </span>
        <span>
          {range.max} {getUnit(type)}
        </span>
      </div>
    </div>
  );
};

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // Early validation - no fallbacks
  if (!moduleId) {
    console.error("❌ No moduleId in URL params");
    navigate("/modules");
    return null;
  }

  // 🔥 FIXED - Use the simple config for UI, enhanced config for steps
  const currentModule = simpleModuleConfigs[moduleId];
  if (!currentModule) {
    console.error("❌ Module not found:", moduleId);
    navigate("/modules");
    return null;
  }

  console.log("✅ Module loaded:", moduleId, currentModule.title);
  console.log("📊 Module initial params:", currentModule.initialParams);

  const { currentUser } = useAuth();
  const {
    startSession,
    endSession,
    updateSession,
    currentSession,
    getIncompleteSession,
    resumeSession,
    updateStepProgress,
  } = useSession(currentUser?.id);

  const {
    state: pacemakerState,
    isConnected: wsConnected,
    sendControlUpdate,
  } = usePacemakerData();

  // SIMPLIFIED STATE MANAGEMENT - ALWAYS START WITH MODULE INITIAL PARAMS
  const [pacemakerParams, setPacemakerParams] = useState(
    currentModule.initialParams,
  );
  
  // Separate state for quiz and UI
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [resumeBannerSession, setResumeBannerSession] = useState<any>(null);
  const [isPageReady, setIsPageReady] = useState(false);
  const [connectionMode] = useState(() => {
    return localStorage.getItem("connectionMode") || "simulated";
  });
  const [sensorStates, setSensorStates] = useState({
    left: false,
    right: false,
  });

  // CRITICAL FIX: Force reset to module params when module changes - this is the ECG baseline
  useEffect(() => {
    console.log("🔄 Module effect triggered:", moduleId);
    console.log("📊 FORCING RESET to module initial params:", currentModule.initialParams);
    setPacemakerParams(currentModule.initialParams);
  }, [moduleId, currentModule.initialParams]);

  // Computed values - ALWAYS use current pacemaker params for ECG (no fallback confusion)
  const isConnected = connectionMode === "pacemaker" && wsConnected;
  
  // FOR ECG: Always use pacemakerParams - this ensures ECG consistency
  const ecgParams = pacemakerParams;
  
  // FOR DISPLAY: Show hardware values if connected, otherwise show current params
  const displayRate = isConnected
    ? pacemakerState?.rate || pacemakerParams.rate
    : pacemakerParams.rate;
  const displayAOutput = isConnected
    ? pacemakerState?.a_output || pacemakerParams.aOutput
    : pacemakerParams.aOutput;
  const displayVOutput = isConnected
    ? pacemakerState?.v_output || pacemakerParams.vOutput
    : pacemakerParams.vOutput;

  // Debug log - verify params are correct
  useEffect(() => {
    console.log("🎯 CURRENT PACEMAKER PARAMS (for ECG):", ecgParams);
    console.log("📺 DISPLAY PARAMS:", {
      displayRate,
      displayAOutput,
      displayVOutput,
    });
  }, [ecgParams, displayRate, displayAOutput, displayVOutput]);

  // Callbacks - DEFINE THESE FIRST
  const handleParameterChange = useCallback(
    (param: string, oldValue: number, newValue: number) => {
      console.log("📊 Parameter changing:", param, oldValue, "→", newValue);
      if (!currentSession || Math.abs(oldValue - newValue) < 0.001) return;

      const parameterChange = {
        timestamp: new Date().toISOString(),
        parameter: param,
        oldValue,
        newValue,
      };

      try {
        updateSession(currentSession.id, {
          practiceState: {
            ...currentSession.practiceState,
            parameterChanges: [
              ...currentSession.practiceState.parameterChanges,
              parameterChange,
            ],
            currentParameters: {
              ...currentSession.practiceState.currentParameters,
              [param]: newValue,
            },
          },
        });
      } catch (error) {
        console.error("Error updating session:", error);
      }
    },
    [currentSession, updateSession],
  );

  const handleStepProgressUpdate = useCallback(
    (stepProgress: any) => {
      if (currentSession?.id && updateStepProgress) {
        updateStepProgress(currentSession.id, stepProgress);
      }
    },
    [currentSession?.id, updateStepProgress],
  );

  // Step controller - this will get the enhanced config with steps from moduleSteps
  const stepControllerProps = useMemo(() => {
    // For step completion checking, use hardware values if connected, otherwise use UI params
    const paramsForStepCheck = wsConnected && pacemakerState ? {
      rate: pacemakerState.rate || pacemakerParams.rate,
      aOutput: pacemakerState.a_output || pacemakerParams.aOutput,
      vOutput: pacemakerState.v_output || pacemakerParams.vOutput,
      aSensitivity: pacemakerState.aSensitivity || pacemakerParams.aSensitivity,
      vSensitivity: pacemakerState.vSensitivity || pacemakerParams.vSensitivity,
    } : pacemakerParams;

    console.log("🔧 Step controller props update:", {
      moduleId,
      sessionId: currentSession?.id?.slice(-8) || "none",
      isQuizCompleted: quizCompleted,
      isConnected: wsConnected,
      uiParams: pacemakerParams,
      hardwareParams: pacemakerState,
      paramsForStepCheck,
    });

    return {
      moduleId: moduleId,
      currentParams: paramsForStepCheck, // Use the correct params for step checking
      isQuizCompleted: quizCompleted,
      currentSession,
      updateStepProgress: handleStepProgressUpdate,
    };
  }, [
    moduleId,
    pacemakerParams,
    pacemakerState, // Add hardware state dependency
    wsConnected,    // Add connection status dependency
    quizCompleted,
    currentSession?.id,
    handleStepProgressUpdate, // Now it's defined above
  ]);

  const {
    steps,
    currentStep,
    currentStepIndex,
    completedSteps,
    allStepsCompleted,
    getProgressPercentage,
    getFlashingSensor,
    handleStepComplete,
    isInitialized: stepControllerInitialized,
  } = useStepController(stepControllerProps);

  // 🔥 NEW - Get dynamic patient vitals
  const currentPatientVitals = useMemo(() => {
    return getCurrentPatientVitals(
      moduleId,
      currentStepIndex,
      steps,
      allStepsCompleted
    );
  }, [moduleId, currentStepIndex, steps, allStepsCompleted]);

  const patientHeartRate = currentPatientVitals.intrinsicHeartRate;
  const bpValue = currentPatientVitals.bloodPressure;

  const handleResumeSession = useCallback(() => {
    if (resumeBannerSession) {
      console.log("▶️ RESUMING session:", resumeBannerSession.id.slice(-8));

      resumeSession(resumeBannerSession.id);
      setResumeBannerSession(null);

      console.log("✅ Session resumed - state will be restored");
    }
  }, [resumeBannerSession, resumeSession]);

  const handleDiscardSession = useCallback(() => {
    if (resumeBannerSession) {
      console.log(
        "🗑️ DISCARDING session and starting fresh:",
        resumeBannerSession.id.slice(-8),
      );

      endSession(resumeBannerSession.id, false, 0, 0);
      setResumeBannerSession(null);

      setIsPageReady(false);
      setQuizCompleted(false);
      setQuizPassed(false);
      setQuizScore({ score: 0, total: 0 });

      setTimeout(() => {
        if (currentModule && moduleId) {
          console.log("🚀 Starting FRESH session after discard for module:", moduleId);
          const sessionId = startSession(moduleId, currentModule.title);
          setPacemakerParams(currentModule.initialParams);
          console.log("✅ Fresh session created after discard:", sessionId);
        }
        setIsPageReady(true);
      }, 100);
    }
  }, [resumeBannerSession, endSession, currentModule, moduleId, startSession]);

  const handleQuizComplete = useCallback(
    (passed: boolean, score: number, totalQuestions: number) => {
      console.log("🎉 Quiz completed - FRESH START for steps:", {
        passed,
        score,
        totalQuestions,
      });

      setQuizCompleted(true);
      setQuizPassed(passed);
      setQuizScore({ score, total: totalQuestions });

      if (currentSession) {
        updateSession(currentSession.id, {
          currentStep: "practice",
          quizState: {
            ...currentSession.quizState,
            isCompleted: true,
            score,
            totalQuestions,
          },
        });
      }
    },
    [currentSession, updateSession],
  );

  const handleComplete = useCallback(
    (success: boolean) => {
      if (!currentSession) return;

      const actualSuccess = success;
      
      setIsSuccess(actualSuccess);
      setShowCompletion(true);

      setTimeout(() => {
        try {
          endSession(
            currentSession.id,
            actualSuccess,
            quizScore.score,
            quizScore.total,
          );
        } catch (error) {
          console.error("Error ending session:", error);
        }
      }, 100);
    },
    [currentSession, quizScore, endSession],
  );

  const handleModuleParameterChange = useCallback(
    (param: string, value: number) => {
      const oldValue = pacemakerParams[param as keyof typeof pacemakerParams];
      if (Math.abs(oldValue - value) < 0.001) return;

      console.log("🎛️ Module parameter change:", param, oldValue, "→", value);

      setPacemakerParams((prev) => ({
        ...prev,
        [param]: value,
      }));

      handleParameterChange(param, oldValue, value);

      // FIXED: Only send to hardware if connected, don't create loops
      if (isConnected) {
        const paramMap: Record<string, string> = {
          aOutput: "a_output",
          vOutput: "v_output",
          aSensitivity: "aSensitivity",
          vSensitivity: "vSensitivity",
          rate: "rate",
        };

        const wsParam = paramMap[param] || param;
        console.log("📡 Sending to hardware:", wsParam, "=", value);
        sendControlUpdate({ [wsParam]: value } as any);
      }
    },
    [pacemakerParams, isConnected, sendControlUpdate, handleParameterChange],
  );

  const handleTryAgain = useCallback(() => {
    console.log("🔄 TRY AGAIN - forcing complete reset");

    if (currentSession) {
      console.log("🗑️ Ending current session:", currentSession.id.slice(-8));
      endSession(currentSession.id, false, 0, 0);
    }

    setShowCompletion(false);
    setQuizCompleted(false);
    setQuizPassed(false);
    setQuizScore({ score: 0, total: 0 });
    setResumeBannerSession(null);
    setIsSuccess(false);

    if (currentModule) {
      console.log("🔄 Resetting to initial params:", currentModule.initialParams);
      setPacemakerParams(currentModule.initialParams);
    }

    setSensorStates({ left: false, right: false });

    setIsPageReady(false);

    setTimeout(() => {
      if (moduleId && currentModule) {
        console.log("🚀 Starting FRESH session for module:", moduleId);
        const sessionId = startSession(moduleId, currentModule.title);
        console.log("✅ Fresh session created:", sessionId);
      }
      setIsPageReady(true);
    }, 100);
  }, [currentSession, endSession, currentModule, moduleId, startSession]);

  useEffect(() => {
    setResumeBannerSession(null);
  }, [moduleId]);

  const getHint = useCallback(() => {
    const generalHints: Record<string, string> = {
      "1": "Try decreasing the pacing rate first to see the intrinsic rhythm, then adjust sensitivity.",
      "2": "Look for inappropriate sensing. Consider decreasing sensitivity or checking for interference.",
      "3": "The pacemaker isn't seeing the patient's beats. Try increasing sensitivity.",
      "4": "Gradually increase output until you see consistent capture after each pacing spike.",
      "5": "No capture despite pacing spikes. Increase the output or check lead connections.",
    };

    return (
      generalHints[moduleId] ||
      "Review the ECG pattern and think about what adjustments might help."
    );
  }, [moduleId]);

  const getConnectionStatusDisplay = useCallback(() => {
    if (isConnected && connectionMode === "pacemaker") {
      return {
        className: "bg-green-100 text-green-800",
        icon: <Wifi className="w-4 h-4 mr-2" />,
        text: "Hardware Connected",
      };
    } else if (connectionMode === "simulated") {
      return {
        className: "bg-blue-100 text-blue-800",
        icon: <WifiOff className="w-4 h-4 mr-2" />,
        text: "Simulation Mode",
      };
    } else {
      return {
        className: "bg-gray-100 text-gray-800",
        icon: <WifiOff className="w-4 h-4 mr-2" />,
        text: "Disconnected",
      };
    }
  }, [isConnected, connectionMode]);

  // Main initialization effect
  useEffect(() => {
    if (!currentUser || !currentModule) {
      setIsPageReady(false);
      return;
    }

    const initializeModule = async () => {
      console.log("🎬 Initializing module:", moduleId, currentModule.title);
      console.log("📊 With initial params:", currentModule.initialParams);

      try {
        const incompleteSession = getIncompleteSession(moduleId);

        if (incompleteSession) {
          console.log("📋 Found incomplete session - showing resume banner");
          setResumeBannerSession(incompleteSession);
        } else {
          console.log("🆕 No incomplete session - starting fresh");

          const sessionId = startSession(moduleId, currentModule.title);
          console.log("🚀 Started fresh session:", sessionId);

          console.log("📊 Setting initial params:", currentModule.initialParams);
          setPacemakerParams(currentModule.initialParams);
          setResumeBannerSession(null);
        }
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        setPacemakerParams(currentModule.initialParams);
      } finally {
        setIsPageReady(true);
      }
    };

    initializeModule();
  }, [
    currentUser?.id,
    moduleId,
    currentModule?.title,
    currentModule?.initialParams,
  ]);

  // SIMPLIFIED SESSION RESTORE - Only restore quiz state, NOT parameters that affect ECG
  useEffect(() => {
    if (!currentSession?.id || !isPageReady) {
      console.log("⏳ Waiting for session and page ready:", {
        hasSession: !!currentSession?.id,
        isReady: isPageReady,
      });
      return;
    }

    console.log("🔄 Restoring session state for:", currentSession.id);

    // ONLY restore quiz state - do NOT restore parameters that could mess up ECG
    if (currentSession.quizState.isCompleted && !quizCompleted) {
      console.log("📝 Restoring completed quiz state");
      setQuizCompleted(true);
      setQuizPassed(
        currentSession.quizState.score >=
          Math.ceil(currentSession.quizState.totalQuestions * 0.7),
      );
      setQuizScore({
        score: currentSession.quizState.score,
        total: currentSession.quizState.totalQuestions,
      });
    }

    // REMOVED: Parameter restoration logic - let ECG always use module initial params
    console.log("📊 Keeping ECG params at module initial values for consistency");
  }, [currentSession?.id, isPageReady, quizCompleted]);

  // Sensor state logic (unchanged)
  useEffect(() => {
    if (!currentModule) return;

    const leftShouldFlash =
      displayAOutput > 0 && pacemakerParams.aSensitivity > 0;
    const rightShouldFlash =
      displayVOutput > 0 && pacemakerParams.vSensitivity > 0;

    const stepFlashingSensor = getFlashingSensor();

    const shouldStopFlashingLeft = () => {
      if (completedSteps.has("step4") || completedSteps.has("step5")) {
        return true;
      }

      if (moduleId === "1") {
        if (currentStepIndex >= 6) {
          return pacemakerParams.aSensitivity >= 0.8;
        }
        if (currentStepIndex >= 3 && currentStepIndex <= 5) {
          return false;
        }
      }

      return false;
    };

    const shouldStopFlashingRight = () => {
      if (completedSteps.has("step4") || completedSteps.has("step5")) {
        return true;
      }

      if (moduleId === "1") {
        return currentStepIndex >= 6;
      }

      return false;
    };

    setSensorStates((prev) => {
      const newState = {
        left:
          (leftShouldFlash || stepFlashingSensor === "left") &&
          !shouldStopFlashingLeft(),
        right:
          (rightShouldFlash || stepFlashingSensor === "right") &&
          !shouldStopFlashingRight(),
      };

      if (prev.left === newState.left && prev.right === newState.right) {
        return prev;
      }

      return newState;
    });
  }, [
    currentModule,
    displayAOutput,
    displayVOutput,
    pacemakerParams.aSensitivity,
    pacemakerParams.vSensitivity,
    getFlashingSensor,
    currentStep,
    currentStepIndex,
    completedSteps,
    moduleId,
  ]);

  // Quiz completion effect (unchanged)
  useEffect(() => {
    if (quizCompleted && currentSession?.currentStep === "practice") {
      console.log("🎯 Quiz completed, ensuring steps are ready");
      const timer = setTimeout(() => {
        setIsPageReady(false);
        setTimeout(() => setIsPageReady(true), 50);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [quizCompleted, currentSession?.currentStep]);

  // Module change cleanup (unchanged)
  useEffect(() => {
    console.log("🔄 Module changed - clearing all state");
    setResumeBannerSession(null);
    setQuizCompleted(false);
    setQuizPassed(false);
    setQuizScore({ score: 0, total: 0 });
    setShowCompletion(false);
    setIsSuccess(false);
  }, [moduleId]);

  // Session change logging
  useEffect(() => {
    if (currentSession?.id) {
      console.log(
        "🔄 New session detected for step controller:",
        currentSession.id.slice(-8),
      );
    }
  }, [currentSession?.id]);

  // Computed values for render
  const connectionStatus = getConnectionStatusDisplay();

  if (!isPageReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading module {moduleId}...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {resumeBannerSession && (
        <ResumeSessionBanner
          session={{
            id: resumeBannerSession.id,
            moduleId: resumeBannerSession.moduleId,
            moduleName: resumeBannerSession.moduleName,
            currentStep:
              resumeBannerSession.currentStep === "quiz"
                ? "Knowledge Assessment"
                : "Hands-on Practice",
            lastActiveAt: resumeBannerSession.lastActiveAt,
          }}
          onResume={handleResumeSession}
          onTryAgain={handleDiscardSession}
        />
      )}

      {showCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-lg text-center">
            <div className="flex flex-col items-center justify-center py-6">
              {isSuccess ? (
                <>
                  <CheckCircle className="w-24 h-24 mb-6 text-green-500" />
                  <h2 className="mb-4 text-3xl font-bold">Module Completed!</h2>
                  <p className="mb-8 text-lg text-gray-600">
                    Excellent work! You've successfully completed{" "}
                    {currentModule.title}.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-800 text-sm">
                      <strong>Session Summary:</strong>
                      <br />
                      Quiz Score: {quizScore.score}/{quizScore.total} (
                      {Math.round((quizScore.score / quizScore.total) * 100)}%)
                      <br />
                      Connection Mode: {connectionMode}
                      <br />
                      Duration:{" "}
                      {Math.floor((Date.now() - sessionStartTime) / 60000)}{" "}
                      minutes
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-24 h-24 mb-6 text-red-500" />
                  <h2 className="mb-4 text-3xl font-bold">Session Ended</h2>
                  <p className="mb-8 text-lg text-gray-600">
                    Session ended. You can review your progress and try again
                    anytime.
                  </p>
                </>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate("/modules")}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Return to Modules
                </button>
                <button
                  onClick={handleTryAgain}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-8 py-8 bg-white shadow-lg rounded-3xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Module {moduleId}: {currentModule.title}
            </h2>

            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${connectionStatus.className}`}
            >
              {connectionStatus.icon}
              {connectionStatus.text}
            </div>

            {currentSession && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  Session Active • Module: {currentSession.moduleId} • Step:{" "}
                  {currentSession.currentStep}
                  {currentSession.practiceState.parameterChanges.length > 0 && (
                    <>
                      {" "}
                      • {
                        currentSession.practiceState.parameterChanges.length
                      }{" "}
                      adjustments
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const hint = getHint();
              alert(hint);
            }}
            className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center hover:bg-blue-200 ml-4"
            title="Get a hint"
          >
            <Lightbulb className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="bg-[#F0F6FE] rounded-xl p-6">
              <h3 className="mb-3 font-bold text-lg">Objective:</h3>
              <p className="whitespace-pre-line text-gray-700">
                {currentModule.objective}
              </p>
            </div>

            {quizCompleted && steps.length > 0 && stepControllerInitialized && (
              <StepProgress
                key={currentSession?.id}
                steps={steps}
                currentStepIndex={currentStepIndex}
                completedSteps={completedSteps}
                currentParams={pacemakerParams}
                onStepComplete={handleStepComplete}
                className="mb-6"
              />
            )}

            <div className="space-y-2">
              <h3 className="font-bold text-lg">ECG Monitor</h3>
              <ECGVisualizer
                rate={ecgParams.rate}
                aOutput={ecgParams.aOutput}
                vOutput={ecgParams.vOutput}
                sensitivity={ecgParams.aSensitivity}
                mode={currentModule.mode}
                currentStep={currentStep}
                currentStepIndex={currentStepIndex}
                quizCompleted={quizCompleted}
              />
            </div>

            {(!isConnected || connectionMode !== "pacemaker") && quizCompleted && (
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="font-bold text-lg mb-6 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
                  Pacemaker Controls
                  {quizPassed && (
                    <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Quiz Complete: {quizScore.score}/{quizScore.total}
                    </span>
                  )}
                  {steps.length > 0 && stepControllerInitialized && (
                    <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Step {currentStepIndex + 1}/{steps.length} •{" "}
                      {getProgressPercentage()}% Complete
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentModule.controlsNeeded.rate && (
                    <CustomSlider
                      label="Pacemaker Rate"
                      value={pacemakerParams.rate}
                      onChange={(value) =>
                        handleModuleParameterChange("rate", value)
                      }
                      type="rate"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.aOutput && (
                    <CustomSlider
                      label="Atrial Output"
                      value={pacemakerParams.aOutput}
                      onChange={(value) =>
                        handleModuleParameterChange("aOutput", value)
                      }
                      type="aOutput"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.vOutput && (
                    <CustomSlider
                      label="Ventricular Output"
                      value={pacemakerParams.vOutput}
                      onChange={(value) =>
                        handleModuleParameterChange("vOutput", value)
                      }
                      type="vOutput"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.aSensitivity && (
                    <CustomSlider
                      label="Atrial Sensitivity"
                      value={pacemakerParams.aSensitivity}
                      onChange={(value) =>
                        handleModuleParameterChange("aSensitivity", value)
                      }
                      type="aSensitivity"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.vSensitivity && (
                    <CustomSlider
                      label="Ventricular Sensitivity"
                      value={pacemakerParams.vSensitivity}
                      onChange={(value) =>
                        handleModuleParameterChange("vSensitivity", value)
                      }
                      type="vSensitivity"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-bold text-lg">Knowledge Assessment</h3>
              <MultipleChoiceQuiz
                moduleId={parseInt(moduleId)}
                onComplete={handleQuizComplete}
              />
            </div>
          </div>

          <div className="space-y-6">
            {currentSession && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="mb-3 font-bold text-blue-900">
                  Session Progress
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Quiz</span>
                    <span
                      className={
                        quizCompleted ? "text-green-600" : "text-gray-500"
                      }
                    >
                      {quizCompleted ? "✓ Complete" : "In Progress"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Practice Steps</span>
                    <span className="text-blue-600">
                      {completedSteps.size}/{steps.length} Complete
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Adjustments</span>
                    <span className="text-gray-700">
                      {currentSession.practiceState.parameterChanges.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Duration</span>
                    <span className="text-gray-700">
                      {Math.floor(
                        (Date.now() -
                          new Date(currentSession.startedAt).getTime()) /
                          60000,
                      )}
                      m
                    </span>
                  </div>
                  {steps.length > 0 && stepControllerInitialized && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage()}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">
                        {getProgressPercentage()}% Complete
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-4 font-bold">Sensing Status</h3>
              <div className="flex justify-around">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-full transition-all duration-300 ${
                      sensorStates.left
                        ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="mt-2 text-sm text-gray-600">Pace</span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-full transition-all duration-300 ${
                      sensorStates.right
                        ? "bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="mt-2 text-sm text-gray-600">Sense</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Patient's Intrinsic HR</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">
                  {patientHeartRate}
                </span>
                <span className="text-lg text-gray-500 ml-1">BPM</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Changes with scenario progress
              </p>
            </div>

            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Patient Blood Pressure</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">{bpValue}</span>
                <span className="text-lg text-gray-500 ml-1">mmHg</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Updates per step
              </p>
            </div>

            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Pacemaker Rate</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">
                  {displayRate}
                </span>
                <span className="text-lg text-gray-500 ml-1">BPM</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                {isConnected && connectionMode === "pacemaker"
                  ? "Live from device"
                  : "Device setting"}
              </p>
            </div>

            {quizCompleted && (
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => handleComplete(false)}
                  className="w-full py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  End Session
                </button>
                <button
                  onClick={() => handleComplete(true)}
                  disabled={
                    steps.length > 0 &&
                    (!allStepsCompleted || !stepControllerInitialized)
                  }
                  className={`w-full py-3 rounded-lg transition-colors ${
                    steps.length > 0 &&
                    (!allStepsCompleted || !stepControllerInitialized)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {steps.length > 0 &&
                  (!allStepsCompleted || !stepControllerInitialized)
                    ? `Complete All Steps (${completedSteps.size}/${steps.length})`
                    : "Complete Module"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/modules")}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Module List
          </button>
        </div>
      </div>

      <style>
        {`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        `}
      </style>
    </div>
  );
};

export default ModulePage;