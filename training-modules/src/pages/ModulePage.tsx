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

interface ModuleConfig {
  title: string;
  objective: string;
  mode:
    | "sensitivity"
    | "oversensing"
    | "undersensing"
    | "capture_module"
    | "failure_to_capture";
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

// Custom slider component
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
  onParameterChange: (param: string, oldValue: number, newValue: number) => void;
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
  // ============ ALL HOOKS FIRST - NEVER CONDITIONAL ============
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const overrideOnReconnect = useRef(false);

  const { currentUser } = useAuth();
  const {
    startSession,
    endSession,
    updateSession,
    currentSession,
    getIncompleteSession,
    resumeSession,
    updateStepProgress,
    endSessionForNavigation,
  } = useSession(currentUser?.id);

  const { 
    state: pacemakerState, 
    isConnected: wsConnected, 
    sendControlUpdate,
    lastKnownState 
  } = usePacemakerData();

  // ============ ALL STATE HOOKS ============
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [resumeBannerSession, setResumeBannerSession] = useState<any>(null);
  const [patientHeartRate] = useState(40);
  const [isPageReady, setIsPageReady] = useState(false);
  const [connectionMode] = useState(() => {
    return localStorage.getItem("connectionMode") || "simulated";
  });
  const [pacemakerParams, setPacemakerParams] = useState(() => {
    return {
      rate: 60,
      aOutput: 5,
      vOutput: 5,
      aSensitivity: 2,
      vSensitivity: 2,
    };
  });
  const [fallbackParams, setFallbackParams] = useState<typeof pacemakerParams | null>(null);
  const [sensorStates, setSensorStates] = useState({
    left: false,
    right: false,
  });

  // ============ MODULE CONFIG ============
  const moduleConfigs: Record<string, ModuleConfig> = {
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
      title: "Scenario 2: Oversensing Issues",
      objective:
        "Identify and correct oversensing problems that are causing inappropriate pacing inhibition.\n\nScenario: The pacemaker is detecting signals that shouldn't inhibit pacing.",
      mode: "oversensing",
      initialParams: {
        rate: 70,
        aOutput: 5,
        vOutput: 5,
        aSensitivity: 4,
        vSensitivity: 4,
      },
      controlsNeeded: {
        rate: true,
        aOutput: true,
        vOutput: true,
        aSensitivity: true,
        vSensitivity: true,
      },
    },
    "3": {
      title: "Scenario 3: Undersensing Problems",
      objective:
        "Correct undersensing issues where the pacemaker fails to detect intrinsic cardiac activity.\n\nScenario: The pacemaker is not sensing the patient's own heartbeats.",
      mode: "undersensing",
      initialParams: {
        rate: 60,
        aOutput: 5,
        vOutput: 5,
        aSensitivity: 0.5,
        vSensitivity: 0.8,
      },
      controlsNeeded: {
        rate: true,
        aOutput: false,
        vOutput: true,
        aSensitivity: true,
        vSensitivity: true,
      },
    },
    "4": {
      title: "Capture Calibration Module",
      objective:
        "Learn to establish and verify proper cardiac capture.\n\nScenario: Practice adjusting output levels to achieve consistent capture.",
      mode: "capture_module",
      initialParams: {
        rate: 80,
        aOutput: 3,
        vOutput: 2,
        aSensitivity: 2,
        vSensitivity: 2,
      },
      controlsNeeded: {
        rate: true,
        aOutput: true,
        vOutput: true,
        aSensitivity: false,
        vSensitivity: false,
      },
    },
    "5": {
      title: "Failure to Capture",
      objective:
        "Diagnose and correct failure to capture situations.\n\nScenario: Pacing spikes are present but not followed by cardiac depolarization.",
      mode: "failure_to_capture",
      initialParams: {
        rate: 70,
        aOutput: 1,
        vOutput: 1,
        aSensitivity: 2,
        vSensitivity: 2,
      },
      controlsNeeded: {
        rate: true,
        aOutput: true,
        vOutput: true,
        aSensitivity: false,
        vSensitivity: false,
      },
    },
  };

  // ============ COMPUTED VALUES ============
  const currentModule = moduleId ? moduleConfigs[moduleId] : undefined;
  const isConnected = connectionMode === "pacemaker" && wsConnected;
  const displayRate = isConnected ? pacemakerState?.rate || pacemakerParams.rate : pacemakerParams.rate;
  const displayAOutput = isConnected ? pacemakerState?.a_output || pacemakerParams.aOutput : pacemakerParams.aOutput;
  const displayVOutput = isConnected ? pacemakerState?.v_output || pacemakerParams.vOutput : pacemakerParams.vOutput;

  // ============ ALL CALLBACKS ============
  const handleParameterChange = useCallback(
    (param: string, oldValue: number, newValue: number) => {
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

  const handleStepProgressUpdate = useCallback((stepProgress: any) => {
    if (currentSession?.id && updateStepProgress) {
      updateStepProgress(currentSession.id, stepProgress);
    }
  }, [currentSession?.id, updateStepProgress]);

  const handleResumeSession = useCallback(() => {
    if (resumeBannerSession) {
      console.log("▶️ RESUMING session:", resumeBannerSession.id.slice(-8));
      
      // Resume the session
      resumeSession(resumeBannerSession.id);
      setResumeBannerSession(null);
      
      // The session state will be restored by the step controller
      console.log("✅ Session resumed - state will be restored");
    }
  }, [resumeBannerSession, resumeSession]);

  const handleDiscardSession = useCallback(() => {
    if (resumeBannerSession) {
      console.log("🗑️ DISCARDING session and starting fresh:", resumeBannerSession.id.slice(-8));
      
      // End the old session
      endSession(resumeBannerSession.id, false, 0, 0);
      setResumeBannerSession(null);
      
      // Force page reset
      setIsPageReady(false);
      setQuizCompleted(false);
      setQuizPassed(false);
      setQuizScore({ score: 0, total: 0 });
      
      setTimeout(() => {
        // Start completely fresh session
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


  // const handleQuizComplete = useCallback(
  //   (passed: boolean, score: number, totalQuestions: number) => {
  //     console.log("🎉 Quiz completed:", { passed, score, totalQuestions });
  //     setQuizCompleted(true);
  //     setQuizPassed(passed);
  //     setQuizScore({ score, total: totalQuestions });

  //     if (currentSession) {
  //       updateSession(currentSession.id, {
  //         currentStep: "practice",
  //         quizState: {
  //           ...currentSession.quizState,
  //           isCompleted: true,
  //           score,
  //           totalQuestions,
  //         },
  //       });
  //     }
  //   },
  //   [currentSession, updateSession],
  // );

  const handleQuizComplete = useCallback(
    (passed: boolean, score: number, totalQuestions: number) => {
      console.log("🎉 Quiz completed - FRESH START for steps:", { passed, score, totalQuestions });
      
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
      
      // Steps will auto-reset due to the new step controller logic
    },
    [currentSession, updateSession],
  );

  const handleComplete = useCallback(
    (success: boolean) => {
      if (!currentSession) return;

      const actualSuccess = success;
      const finalScore = actualSuccess ? Math.round((quizScore.score / quizScore.total) * 100) : 0;

      setIsSuccess(actualSuccess);
      setShowCompletion(true);

      setTimeout(() => {
        try {
          endSession(currentSession.id, actualSuccess, finalScore, quizScore.total);
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

      setPacemakerParams((prev) => ({
        ...prev,
        [param]: value,
      }));

      handleParameterChange(param, oldValue, value);

      if (isConnected) {
        const paramMap: Record<string, string> = {
          'aOutput': 'a_output',
          'vOutput': 'v_output',
          'aSensitivity': 'aSensitivity', 
          'vSensitivity': 'vSensitivity',
          'rate': 'rate'
        };
        
        const wsParam = paramMap[param] || param;
        sendControlUpdate({ [wsParam]: value } as any);
      }
    },
    [pacemakerParams, isConnected, sendControlUpdate, handleParameterChange],
  );

  const handleTryAgain = useCallback(() => {
    console.log("🔄 TRY AGAIN - forcing complete reset");
    
    // End current session completely
    if (currentSession) {
      console.log("🗑️ Ending current session:", currentSession.id.slice(-8));
      endSession(currentSession.id, false, 0, 0);
    }

    // Clear ALL state completely
    setShowCompletion(false);
    setQuizCompleted(false);
    setQuizPassed(false);
    setQuizScore({ score: 0, total: 0 });
    setResumeBannerSession(null);
    setIsSuccess(false);

    // Reset parameters to module initial state
    if (currentModule) {
      console.log("🔄 Resetting to initial params:", currentModule.initialParams);
      setPacemakerParams(currentModule.initialParams);
    }

    setSensorStates({ left: false, right: false });
    
    // Force page reinitialize
    setIsPageReady(false);
    
    setTimeout(() => {
      // Start completely fresh session
      if (moduleId && currentModule) {
        console.log("🚀 Starting FRESH session for module:", moduleId);
        const sessionId = startSession(moduleId, currentModule.title);
        console.log("✅ Fresh session created:", sessionId);
      }
      setIsPageReady(true);
    }, 100);
  }, [currentSession, endSession, currentModule, moduleId, startSession]);


  useEffect(() => {
    // When moduleId changes, clear any resume banner for previous module
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
      generalHints[moduleId || ""] ||
      "Review the ECG pattern and think about what adjustments might help."
    );
  }, [moduleId]);

  const getConnectionStatusDisplay = useCallback(() => {
    if (isConnected && connectionMode === 'pacemaker') {
      return {
        className: "bg-green-100 text-green-800",
        icon: <Wifi className="w-4 h-4 mr-2" />,
        text: "Hardware Connected"
      };
    } else if (connectionMode === 'simulated') {
      const usingFallback = fallbackParams !== null;
      return {
        className: usingFallback ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800",
        icon: <WifiOff className="w-4 h-4 mr-2" />,
        text: usingFallback ? "Simulation (Last HW Values)" : "Simulation Mode"
      };
    } else {
      return {
        className: "bg-gray-100 text-gray-800",
        icon: <WifiOff className="w-4 h-4 mr-2" />,
        text: "Disconnected"
      };
    }
  }, [isConnected, connectionMode, fallbackParams]);

  // ============ STEP CONTROLLER - ALWAYS CALLED ============
  const stepControllerProps = useMemo(() => {
    const props = {
      moduleId: moduleId || "1",
      currentParams: pacemakerParams,
      isQuizCompleted: quizCompleted,
      currentSession,
      updateStepProgress: handleStepProgressUpdate,
    };
    
    console.log("🔧 Step controller props:", {
      moduleId: props.moduleId,
      sessionId: currentSession?.id?.slice(-8) || 'none',
      isQuizCompleted: quizCompleted,
      paramsRate: pacemakerParams.rate
    });
    
    return props;
  }, [moduleId, pacemakerParams, quizCompleted, currentSession?.id, handleStepProgressUpdate]);

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

  // ============ ALL EFFECTS ============
  // Main initialization effect
  useEffect(() => {
    if (!currentUser || !moduleId || !currentModule) {
      setIsPageReady(false);
      return;
    }

    const initializeModule = async () => {
      console.log("🎬 Initializing module:", moduleId);
      
      try {
        // Check for incomplete session
        const incompleteSession = getIncompleteSession(moduleId);
        
        if (incompleteSession) {
          console.log("📋 Found incomplete session - showing resume banner");
          setResumeBannerSession(incompleteSession);
          // Don't auto-resume, let user choose
        } else {
          console.log("🆕 No incomplete session - starting fresh");
          
          // Always start fresh session
          const sessionId = startSession(moduleId, currentModule.title);
          console.log("🚀 Started fresh session:", sessionId);
          
          // Reset to initial parameters
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
  }, [currentUser?.id, moduleId, currentModule?.title]);


  // FIXED: Separate effect for restoring session state AFTER page is ready
  useEffect(() => {
    if (!currentSession?.id || !isPageReady) {
      console.log("⏳ Waiting for session and page ready:", { 
        hasSession: !!currentSession?.id, 
        isReady: isPageReady 
      });
      return;
    }

    console.log("🔄 Restoring session state for:", currentSession.id);

    // Restore quiz state
    if (currentSession.quizState.isCompleted && !quizCompleted) {
      console.log("📝 Restoring completed quiz state");
      setQuizCompleted(true);
      setQuizPassed(
        currentSession.quizState.score >= Math.ceil(currentSession.quizState.totalQuestions * 0.7)
      );
      setQuizScore({
        score: currentSession.quizState.score,
        total: currentSession.quizState.totalQuestions,
      });
    }

    // Restore parameters from session (only if different from current)
    if (currentSession.practiceState.currentParameters) {
      const sessionParams = currentSession.practiceState.currentParameters;
      console.log("📊 Session parameters:", sessionParams);
      console.log("📊 Current parameters:", pacemakerParams);
      
      const isDifferent = Object.keys(sessionParams).some(
        key => pacemakerParams[key as keyof typeof pacemakerParams] !== 
               sessionParams[key as keyof typeof sessionParams]
      );
      
      if (isDifferent) {
        console.log("📊 Restoring different parameters from session");
        setPacemakerParams(sessionParams);
      } else {
        console.log("📊 Parameters already match session, no update needed");
      }
    }
  }, [
    currentSession?.id, 
    isPageReady
    // Removed pacemakerParams dependency to prevent loops
  ]);

  useEffect(() => {
    console.log("📍 ModulePage mounted for module:", moduleId);
    
    return () => {
      console.log("📍 ModulePage unmounting for module:", moduleId);
      // DON'T automatically end sessions on navigation
      // Let them persist until explicitly ended by user action
    };
  }, [moduleId]);

  useEffect(() => {
    if (isConnected && pacemakerState) {
      const newParams = {
        rate: pacemakerState.rate,
        aOutput: pacemakerState.a_output,
        vOutput: pacemakerState.v_output,
        aSensitivity: pacemakerState.aSensitivity,
        vSensitivity: pacemakerState.vSensitivity,
      };

      if (overrideOnReconnect.current) {
        overrideOnReconnect.current = false;
        console.log("🛑 Skipping param overwrite after reconnect");
        return;
      }

      setPacemakerParams((prev) => {
        const isSame = Object.keys(newParams).every(
          key => prev[key as keyof typeof prev] === newParams[key as keyof typeof newParams]
        );
        return isSame ? prev : newParams;
      });

      setFallbackParams(newParams);
    }
    else if (!isConnected && connectionMode === "simulated" && lastKnownState && !fallbackParams) {
      const fallbackValues = {
        rate: lastKnownState.rate,
        aOutput: lastKnownState.a_output,
        vOutput: lastKnownState.v_output,
        aSensitivity: lastKnownState.aSensitivity,
        vSensitivity: lastKnownState.vSensitivity,
      };

      setPacemakerParams(fallbackValues);
      setFallbackParams(fallbackValues);
    }
  }, [pacemakerState, isConnected, connectionMode, lastKnownState, fallbackParams]);

  useEffect(() => {
    if (!currentModule) return;

    const leftShouldFlash = displayAOutput > 0 && pacemakerParams.aSensitivity > 0;
    const rightShouldFlash = displayVOutput > 0 && pacemakerParams.vSensitivity > 0;
    
    const stepFlashingSensor = getFlashingSensor();
    
    const shouldStopFlashingLeft = () => {
      if (completedSteps.has('step4') || completedSteps.has('step5')) {
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
      if (completedSteps.has('step4') || completedSteps.has('step5')) {
        return true;
      }
      
      if (moduleId === "1") {
        return currentStepIndex >= 6;
      }
      
      return false;
    };
    
    setSensorStates((prev) => {
      const newState = { 
        left: (leftShouldFlash || stepFlashingSensor === "left") && !shouldStopFlashingLeft(),
        right: (rightShouldFlash || stepFlashingSensor === "right") && !shouldStopFlashingRight()
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
    moduleId
  ]);

  useEffect(() => {
    if (quizCompleted && currentSession?.currentStep === "practice") {
      console.log("🎯 Quiz completed, ensuring steps are ready");
      // Force a small delay to ensure step controller can reinitialize
      const timer = setTimeout(() => {
        setIsPageReady(false);
        setTimeout(() => setIsPageReady(true), 50);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [quizCompleted, currentSession?.currentStep]);

  // force resets when module changes:
  useEffect(() => {
    console.log("🔄 Module changed - clearing all state");
    setResumeBannerSession(null);
    setQuizCompleted(false);
    setQuizPassed(false);
    setQuizScore({ score: 0, total: 0 });
    setShowCompletion(false);
    setIsSuccess(false);
  }, [moduleId]);

  // force step controller reset on new sessions:
  useEffect(() => {
    if (currentSession?.id) {
      console.log("🔄 New session detected for step controller:", currentSession.id.slice(-8));
    }
  }, [currentSession?.id]);


  // ============ COMPUTED VALUES FOR RENDER ============
  const connectionStatus = getConnectionStatusDisplay();

  // ============ EARLY RETURNS - AFTER ALL HOOKS ============
  if (!currentModule || !moduleId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Module Not Found</h2>
          <p className="text-gray-600 mb-4">The requested module could not be found.</p>
          <button
            onClick={() => navigate("/modules")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Modules
          </button>
        </div>
      </div>
    );
  }

  if (!isPageReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  // ============ RENDER ============
  return (
    <div>
      {/* Resume Session Banner */}
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

      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-lg text-center">
            <div className="flex flex-col items-center justify-center py-6">
              {isSuccess ? (
                <>
                  <CheckCircle className="w-24 h-24 mb-6 text-green-500" />
                  <h2 className="mb-4 text-3xl font-bold">Module Completed!</h2>
                  <p className="mb-8 text-lg text-gray-600">
                    Excellent work! You've successfully completed {currentModule.title}.
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
                      Duration: {Math.floor((Date.now() - sessionStartTime) / 60000)} minutes
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-24 h-24 mb-6 text-red-500" />
                  <h2 className="mb-4 text-3xl font-bold">Session Ended</h2>
                  <p className="mb-8 text-lg text-gray-600">
                    Session ended. You can review your progress and try again anytime.
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

      {/* Main Module Content */}
      <div className="w-full px-8 py-8 bg-white shadow-lg rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Module {moduleId}: {currentModule.title}
            </h2>

            {/* Connection Status */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${connectionStatus.className}`}>
              {connectionStatus.icon}
              {connectionStatus.text}
            </div>

            {/* Session Status */}
            {currentSession && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  Session Active • Module: {currentSession.moduleId} • Step: {currentSession.currentStep}
                  {currentSession.practiceState.parameterChanges.length > 0 && (
                    <> • {currentSession.practiceState.parameterChanges.length} adjustments</>
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
          {/* Main Content Area */}
          <div className="col-span-2 space-y-6">
            {/* Objective */}
            <div className="bg-[#F0F6FE] rounded-xl p-6">
              <h3 className="mb-3 font-bold text-lg">Objective:</h3>
              <p className="whitespace-pre-line text-gray-700">
                {currentModule.objective}
              </p>
            </div>

            {/* Step Progress Component - Show after quiz completion */}
            {quizCompleted && steps.length > 0 && stepControllerInitialized && (
              <StepProgress
                key={currentSession?.id} // ✅ Force reset on new session
                steps={steps}
                currentStepIndex={currentStepIndex}
                completedSteps={completedSteps}
                currentParams={pacemakerParams}
                onStepComplete={handleStepComplete}
                className="mb-6"
              />
            )}

            {/* ECG Display */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">ECG Monitor</h3>
              <ECGVisualizer
                rate={displayRate}
                aOutput={displayAOutput}
                vOutput={displayVOutput}
                sensitivity={pacemakerParams.aSensitivity}
                mode={currentModule.mode}
              />
            </div>

            {/* Hardware Connected - Live Data */}
            {isConnected && connectionMode === 'pacemaker' && quizCompleted && (
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                  Hardware Connected - Live Data
                  <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Quiz Complete: {quizScore.score}/{quizScore.total}
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500">Rate</div>
                    <div className="font-mono text-lg">{displayRate} BPM</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500">A Output</div>
                    <div className="font-mono text-lg">{displayAOutput} mA</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500">V Output</div>
                    <div className="font-mono text-lg">{displayVOutput} mA</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500">A Sensitivity</div>
                    <div className="font-mono text-lg">{pacemakerParams.aSensitivity} mV</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500">V Sensitivity</div>
                    <div className="font-mono text-lg">{pacemakerParams.vSensitivity} mV</div>
                  </div>
                  {pacemakerState?.batteryLevel && (
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-gray-500">Battery</div>
                      <div className="font-mono text-lg">{pacemakerState.batteryLevel}%</div>
                    </div>
                  )}
                </div>
                <p className="text-green-800 mt-3">
                  ✅ Real-time data from hardware pacemaker device
                </p>
              </div>
            )}

            {/* Fallback simulation section */}
            {connectionMode === 'simulated' && fallbackParams && quizCompleted && (
              <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></span>
                  Simulation Mode - Using Last Hardware Values
                  <span className="ml-3 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    Connection Lost
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500">Rate (Last HW)</div>
                    <div className="font-mono text-lg">{fallbackParams.rate} BPM</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500">A Output (Last HW)</div>
                    <div className="font-mono text-lg">{fallbackParams.aOutput} mA</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500">V Output (Last HW)</div>
                    <div className="font-mono text-lg">{fallbackParams.vOutput} mA</div>
                  </div>
                </div>
                
                {/* Show simulation controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentModule.controlsNeeded.rate && (
                    <CustomSlider
                      label="Pacemaker Rate"
                      value={pacemakerParams.rate}
                      onChange={(value) => handleModuleParameterChange("rate", value)}
                      type="rate"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.aOutput && (
                    <CustomSlider
                      label="Atrial Output"
                      value={pacemakerParams.aOutput}
                      onChange={(value) => handleModuleParameterChange("aOutput", value)}
                      type="aOutput"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.vOutput && (
                    <CustomSlider
                      label="Ventricular Output"
                      value={pacemakerParams.vOutput}
                      onChange={(value) => handleModuleParameterChange("vOutput", value)}
                      type="vOutput"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.aSensitivity && (
                    <CustomSlider
                      label="Atrial Sensitivity"
                      value={pacemakerParams.aSensitivity}
                      onChange={(value) => handleModuleParameterChange("aSensitivity", value)}
                      type="aSensitivity"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.vSensitivity && (
                    <CustomSlider
                      label="Ventricular Sensitivity"
                      value={pacemakerParams.vSensitivity}
                      onChange={(value) => handleModuleParameterChange("vSensitivity", value)}
                      type="vSensitivity"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                </div>
                
                <p className="text-orange-800 mt-3">
                  ⚠️ Hardware temporarily disconnected. Using simulation with last known values. Will auto-reconnect when available.
                </p>
              </div>
            )}

            {/* Regular Simulation Controls */}
            {connectionMode === 'simulated' && !fallbackParams && quizCompleted && (
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
                    <span className="ml-3 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Step {currentStepIndex + 1}/{steps.length} • {getProgressPercentage()}% Complete
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentModule.controlsNeeded.rate && (
                    <CustomSlider
                      label="Pacemaker Rate"
                      value={pacemakerParams.rate}
                      onChange={(value) => handleModuleParameterChange("rate", value)}
                      type="rate"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.aOutput && (
                    <CustomSlider
                      label="Atrial Output"
                      value={pacemakerParams.aOutput}
                      onChange={(value) => handleModuleParameterChange("aOutput", value)}
                      type="aOutput"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.vOutput && (
                    <CustomSlider
                      label="Ventricular Output"
                      value={pacemakerParams.vOutput}
                      onChange={(value) => handleModuleParameterChange("vOutput", value)}
                      type="vOutput"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.aSensitivity && (
                    <CustomSlider
                      label="Atrial Sensitivity"
                      value={pacemakerParams.aSensitivity}
                      onChange={(value) => handleModuleParameterChange("aSensitivity", value)}
                      type="aSensitivity"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.vSensitivity && (
                    <CustomSlider
                      label="Ventricular Sensitivity"
                      value={pacemakerParams.vSensitivity}
                      onChange={(value) => handleModuleParameterChange("vSensitivity", value)}
                      type="vSensitivity"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Quiz Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Knowledge Assessment</h3>
              <MultipleChoiceQuiz
                moduleId={parseInt(moduleId || "1")}
                onComplete={handleQuizComplete}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Session Progress Indicator */}
            {currentSession && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="mb-3 font-bold text-blue-900">Session Progress</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Quiz</span>
                    <span className={quizCompleted ? "text-green-600" : "text-gray-500"}>
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
                      {Math.floor((Date.now() - new Date(currentSession.startedAt).getTime()) / 60000)}m
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

            {/* Sensing Lights */}
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
                  <span className="mt-2 text-sm text-gray-600">Atrial</span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-full transition-all duration-300 ${
                      sensorStates.right
                        ? "bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="mt-2 text-sm text-gray-600">Ventricular</span>
                </div>
              </div>
            </div>

            {/* Patient's Intrinsic Heart Rate */}
            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Patient's Intrinsic HR</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">{patientHeartRate}</span>
                <span className="text-lg text-gray-500 ml-1">BPM</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">Baseline rhythm</p>
            </div>

            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Blood Pressure</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">120/80</span>
                <span className="text-lg text-gray-500 ml-1">mmHg</span>
              </div>
            </div>

            {/* Pacemaker Rate */}
            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Pacemaker Rate</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">{displayRate}</span>
                <span className="text-lg text-gray-500 ml-1">BPM</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                {isConnected && connectionMode === 'pacemaker' ? 'Live from device' : 
                 fallbackParams ? 'Last known value' : 'Device setting'}
              </p>
            </div>

            {/* Action Buttons */}
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
                  disabled={steps.length > 0 && (!allStepsCompleted || !stepControllerInitialized)}
                  className={`w-full py-3 rounded-lg transition-colors ${
                    steps.length > 0 && (!allStepsCompleted || !stepControllerInitialized)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {steps.length > 0 && (!allStepsCompleted || !stepControllerInitialized)
                    ? `Complete All Steps (${completedSteps.size}/${steps.length})`
                    : 'Complete Module'
                  }
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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

      {/* Custom CSS for sliders */}
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