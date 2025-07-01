// import { useState, useEffect, useCallback, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Lightbulb,
//   CheckCircle,
//   XCircle,
//   Wifi,
//   WifiOff,
// } from "lucide-react";
// import ECGVisualizer from "../components/ECGVisualizer";
// import MultipleChoiceQuiz from "../components/MultipleChoiceQuiz";
// import ResumeSessionBanner from "../components/ResumeSessionBanner";
// import { useAuth } from "../hooks/useAuth";
// import { useSession } from "../hooks/useSession";
// import { usePacemakerData } from "../hooks/usePacemakerData";

// interface ModuleConfig {
//   title: string;
//   objective: string;
//   mode:
//     | "sensitivity"
//     | "oversensing"
//     | "undersensing"
//     | "capture_module"
//     | "failure_to_capture";
//   initialParams: {
//     rate: number;
//     aOutput: number;
//     vOutput: number;
//     aSensitivity: number;
//     vSensitivity: number;
//   };
//   controlsNeeded: {
//     rate: boolean;
//     aOutput: boolean;
//     vOutput: boolean;
//     aSensitivity: boolean;
//     vSensitivity: boolean;
//   };
// }

// // Custom slider component
// const CustomSlider = ({
//   label,
//   value,
//   onChange,
//   type,
//   onParameterChange,
// }: {
//   label: string;
//   value: number;
//   onChange: (value: number) => void;
//   type: "aOutput" | "vOutput" | "rate" | "aSensitivity" | "vSensitivity";
//   onParameterChange: (
//     param: string,
//     oldValue: number,
//     newValue: number,
//   ) => void;
// }) => {
//   const getStepSize = (currentValue: number, type: string) => {
//     switch (type) {
//       case "aOutput":
//         if (currentValue <= 0.4) return 0.1;
//         if (currentValue <= 1.0) return 0.2;
//         if (currentValue <= 5.0) return 0.5;
//         return 1.0;
//       case "vOutput":
//         if (currentValue <= 0.4) return 0.1;
//         if (currentValue <= 1.0) return 0.2;
//         if (currentValue <= 5.0) return 0.5;
//         return 1.0;
//       case "rate":
//         if (currentValue <= 50) return 5;
//         if (currentValue <= 100) return 2;
//         if (currentValue <= 170) return 5;
//         return 6;
//       case "aSensitivity":
//         if (currentValue >= 3) return 1;
//         if (currentValue >= 2) return 0.5;
//         if (currentValue >= 0.8) return 0.2;
//         return 0.1;
//       case "vSensitivity":
//         if (currentValue >= 10) return 2;
//         if (currentValue >= 3) return 1;
//         if (currentValue >= 1) return 0.5;
//         return 0.2;
//       default:
//         return 0.1;
//     }
//   };

//   const getRange = (type: string) => {
//     switch (type) {
//       case "aOutput":
//         return { min: 0.1, max: 20.0 };
//       case "vOutput":
//         return { min: 0.1, max: 25.0 };
//       case "rate":
//         return { min: 30, max: 180 };
//       case "aSensitivity":
//         return { min: 0.4, max: 10 };
//       case "vSensitivity":
//         return { min: 0.8, max: 20 };
//       default:
//         return { min: 0, max: 100 };
//     }
//   };

//   const range = getRange(type);
//   const step = getStepSize(value, type);

//   const handleChange = (newValue: number) => {
//     const oldValue = value;
//     const finalValue = parseFloat(newValue.toFixed(1));

//     if (Math.abs(oldValue - finalValue) < 0.001) return;

//     onParameterChange(type, oldValue, finalValue);
//     onChange(finalValue);
//   };

//   const getUnit = (type: string) => {
//     switch (type) {
//       case "aOutput":
//       case "vOutput":
//         return "mA";
//       case "rate":
//         return "BPM";
//       case "aSensitivity":
//       case "vSensitivity":
//         return "mV";
//       default:
//         return "";
//     }
//   };

//   return (
//     <div className="space-y-3">
//       <label className="block text-sm font-medium text-gray-700">
//         {label}:{" "}
//         <span className="font-mono text-blue-600">
//           {value} {getUnit(type)}
//         </span>
//       </label>
//       <div className="flex items-center space-x-3">
//         <button
//           onClick={() => handleChange(Math.max(range.min, value - step))}
//           className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
//           disabled={value <= range.min}
//         >
//           −
//         </button>
//         <input
//           type="range"
//           min={range.min}
//           max={range.max}
//           step={step}
//           value={value}
//           onChange={(e) => handleChange(parseFloat(e.target.value))}
//           className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
//         />
//         <button
//           onClick={() => handleChange(Math.min(range.max, value + step))}
//           className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
//           disabled={value >= range.max}
//         >
//           +
//         </button>
//       </div>
//       <div className="flex justify-between text-xs text-gray-500">
//         <span>
//           {range.min} {getUnit(type)}
//         </span>
//         <span>
//           {range.max} {getUnit(type)}
//         </span>
//       </div>
//     </div>
//   );
// };

// const ModulePage = () => {
//   const { moduleId } = useParams();
//   const navigate = useNavigate();
//   const overrideOnReconnect = useRef(false);


//   const { currentUser } = useAuth();
//   const {
//     startSession,
//     endSession,
//     updateSession,
//     currentSession,
//     getIncompleteSession,
//     resumeSession,
//   } = useSession(currentUser?.id);

//   const { 
//     state: pacemakerState, 
//     isConnected: wsConnected, 
//     sendControlUpdate,
//     lastKnownState 
//   } = usePacemakerData();

//   // Reset key for forcing re-render
//   const [resetKey, setResetKey] = useState(0);

//   const [quizCompleted, setQuizCompleted] = useState(false);
//   const [quizPassed, setQuizPassed] = useState(false);
//   const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
//   const [showCompletion, setShowCompletion] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [sessionStartTime] = useState(Date.now());
//   const [resumeBannerSession, setResumeBannerSession] = useState<any>(null);

//   const [patientHeartRate] = useState(40);

//   // Simple connection mode - no auto-switching to prevent loops
//   const [connectionMode, setConnectionMode] = useState(() => {
//     return localStorage.getItem("connectionMode") || "simulated";
//   });

//   const isConnected = connectionMode === "pacemaker" && wsConnected;
//   const isSimulated = connectionMode === "simulated";

//   const moduleConfigs: Record<string, ModuleConfig> = {
//     "1": {
//       title: "Scenario 1: Bradycardia Management",
//       objective:
//         "Diagnose and correct a failure to sense condition. Complete the knowledge check and then adjust the pacemaker.\n\nScenario: You return to a patient's room and observe this ECG pattern. Their heart rate has dropped to 40 BPM and atrial leads are connected.",
//       mode: "sensitivity",
//       initialParams: {
//         rate: 40,
//         aOutput: 2,
//         vOutput: 3,
//         aSensitivity: 1,
//         vSensitivity: 2,
//       },
//       controlsNeeded: {
//         rate: true,
//         aOutput: true,
//         vOutput: false,
//         aSensitivity: true,
//         vSensitivity: false,
//       },
//     },
//     "2": {
//       title: "Scenario 2: Oversensing Issues",
//       objective:
//         "Identify and correct oversensing problems that are causing inappropriate pacing inhibition.\n\nScenario: The pacemaker is detecting signals that shouldn't inhibit pacing.",
//       mode: "oversensing",
//       initialParams: {
//         rate: 70,
//         aOutput: 5,
//         vOutput: 5,
//         aSensitivity: 4,
//         vSensitivity: 4,
//       },
//       controlsNeeded: {
//         rate: true,
//         aOutput: true,
//         vOutput: true,
//         aSensitivity: true,
//         vSensitivity: true,
//       },
//     },
//     "3": {
//       title: "Scenario 3: Undersensing Problems",
//       objective:
//         "Correct undersensing issues where the pacemaker fails to detect intrinsic cardiac activity.\n\nScenario: The pacemaker is not sensing the patient's own heartbeats.",
//       mode: "undersensing",
//       initialParams: {
//         rate: 60,
//         aOutput: 5,
//         vOutput: 5,
//         aSensitivity: 0.5,
//         vSensitivity: 0.8,
//       },
//       controlsNeeded: {
//         rate: true,
//         aOutput: false,
//         vOutput: true,
//         aSensitivity: true,
//         vSensitivity: true,
//       },
//     },
//     "4": {
//       title: "Capture Calibration Module",
//       objective:
//         "Learn to establish and verify proper cardiac capture.\n\nScenario: Practice adjusting output levels to achieve consistent capture.",
//       mode: "capture_module",
//       initialParams: {
//         rate: 80,
//         aOutput: 3,
//         vOutput: 2,
//         aSensitivity: 2,
//         vSensitivity: 2,
//       },
//       controlsNeeded: {
//         rate: true,
//         aOutput: true,
//         vOutput: true,
//         aSensitivity: false,
//         vSensitivity: false,
//       },
//     },
//     "5": {
//       title: "Failure to Capture",
//       objective:
//         "Diagnose and correct failure to capture situations.\n\nScenario: Pacing spikes are present but not followed by cardiac depolarization.",
//       mode: "failure_to_capture",
//       initialParams: {
//         rate: 70,
//         aOutput: 1,
//         vOutput: 1,
//         aSensitivity: 2,
//         vSensitivity: 2,
//       },
//       controlsNeeded: {
//         rate: true,
//         aOutput: true,
//         vOutput: true,
//         aSensitivity: false,
//         vSensitivity: false,
//       },
//     },
//   };

//   const currentModule = moduleId ? moduleConfigs[moduleId] : undefined;

//   const [pacemakerParams, setPacemakerParams] = useState(() => {
//     return (
//       currentModule?.initialParams || {
//         rate: 60,
//         aOutput: 5,
//         vOutput: 5,
//         aSensitivity: 2,
//         vSensitivity: 2,
//       }
//     );
//   });

//   const [sensorStates, setSensorStates] = useState({
//     left: false,
//     right: false,
//   });

//   // Simple initialization tracking
//   const initialized = useRef(false);

//   const [fallbackParams, setFallbackParams] = useState<typeof pacemakerParams | null>(null);

//   useEffect(() => {
//     if (isConnected && pacemakerState) {
//       const newParams = {
//         rate: pacemakerState.rate,
//         aOutput: pacemakerState.a_output,
//         vOutput: pacemakerState.v_output,
//         aSensitivity: pacemakerState.aSensitivity,
//         vSensitivity: pacemakerState.vSensitivity,
//       };

//       // Skip updating params if we just reconnected + pushed values ourselves
//       if (overrideOnReconnect.current) {
//         overrideOnReconnect.current = false; // Reset the flag
//         console.log("🛑 Skipping param overwrite after reconnect — frontend already pushed values.");
//         return;
//       }

//       // Compare with existing state to prevent unnecessary updates
//       setPacemakerParams((prev) => {
//         const isSame =
//           prev.rate === newParams.rate &&
//           prev.aOutput === newParams.aOutput &&
//           prev.vOutput === newParams.vOutput &&
//           prev.aSensitivity === newParams.aSensitivity &&
//           prev.vSensitivity === newParams.vSensitivity;

//         if (isSame) return prev; // no change — avoid render

//         return newParams;
//       });

//       setFallbackParams((prev) => {
//         const isSame =
//           prev &&
//           prev.rate === newParams.rate &&
//           prev.aOutput === newParams.aOutput &&
//           prev.vOutput === newParams.vOutput &&
//           prev.aSensitivity === newParams.aSensitivity &&
//           prev.vSensitivity === newParams.vSensitivity;

//         if (isSame) return prev;
//         return newParams;
//       });
//     }
//     // fallback handling unchanged
//     else if (
//       !isConnected &&
//       connectionMode === "simulated" &&
//       lastKnownState &&
//       !fallbackParams
//     ) {
//       const fallbackValues = {
//         rate: lastKnownState.rate,
//         aOutput: lastKnownState.a_output,
//         vOutput: lastKnownState.v_output,
//         aSensitivity: lastKnownState.aSensitivity,
//         vSensitivity: lastKnownState.vSensitivity,
//       };

//       setPacemakerParams(fallbackValues);
//       setFallbackParams(fallbackValues);
//     }
//   }, [pacemakerState, isConnected, connectionMode, lastKnownState, fallbackParams]);

//   // auto swap back to hardware mode + sends current params to hardware 
//   // useEffect(() => {
//   //   if (wsConnected && connectionMode === "simulated") {
//   //     console.log("🔌 WebSocket reconnected — switching to pacemaker mode");

//   //     // TODO: If this causes hardware issues, comment out or remove the sendControlUpdate block below
//   //     // and let hardware send values instead of frontend forcing them

//   //     // Switch UI back to "pacemaker" mode
//   //     setConnectionMode("pacemaker");
//   //     localStorage.setItem("connectionMode", "pacemaker");

//   //     // Send current simulation values to hardware to keep in sync
//   //     const paramMap = {
//   //       rate: "rate",
//   //       aOutput: "a_output",
//   //       vOutput: "v_output",
//   //       aSensitivity: "aSensitivity",
//   //       vSensitivity: "vSensitivity",
//   //     };

//   //     const payload: Record<string, number> = {};
//   //     for (const key in paramMap) {
//   //       payload[paramMap[key as keyof typeof paramMap]] =
//   //         pacemakerParams[key as keyof typeof pacemakerParams];
//   //     }

//   //     try {
//   //       overrideOnReconnect.current = true;
//   //       sendControlUpdate(payload as any);
//   //       console.log("🔁 Sent simulated values to hardware:", payload);
//   //     } catch (error) {
//   //       console.error("⚠️ Failed to send values to hardware:", error);
//   //     }

//   //     // Clear fallback values (no longer needed once hardware is reconnected)
//   //     setFallbackParams(null);
//   //   }
//   // }, [wsConnected, connectionMode, pacemakerParams, sendControlUpdate]);


//   // ====== TEST VERSION 2: ENHANCED LOGGING - See exactly what we're sending ======
//   useEffect(() => {
//     if (wsConnected && connectionMode === "simulated") {
//       console.log("🔌 WebSocket reconnected — switching to pacemaker mode");
      
//       // DETAILED LOGGING
//       console.log("📊 BEFORE sending:");
//       console.log("  pacemakerParams:", pacemakerParams);
//       console.log("  fallbackParams:", fallbackParams);
//       console.log("  currentModule?.initialParams:", currentModule?.initialParams);
      
//       setConnectionMode("pacemaker");
//       localStorage.setItem("connectionMode", "pacemaker");

//       // Build payload with detailed logging
//       const paramMap = {
//         rate: "rate",
//         aOutput: "a_output",
//         vOutput: "v_output",
//         aSensitivity: "aSensitivity",
//         vSensitivity: "vSensitivity",
//       };

//       const payload: Record<string, number> = {};
//       for (const key in paramMap) {
//         const value = pacemakerParams[key as keyof typeof pacemakerParams];
//         payload[paramMap[key as keyof typeof paramMap]] = value;
//         console.log(`  Building payload: ${key} (${paramMap[key as keyof typeof paramMap]}) = ${value}`);
//       }

//       console.log("🔁 FINAL PAYLOAD being sent to hardware:", payload);

//       try {
//         overrideOnReconnect.current = true;
//         sendControlUpdate(payload as any);
//         console.log("✅ Successfully sent payload to hardware");
//       } catch (error) {
//         console.error("❌ Failed to send values to hardware:", error);
//       }

//       setFallbackParams(null);
//     }
//   }, [wsConnected, connectionMode, pacemakerParams, sendControlUpdate]);




//   // Display values - prioritize hardware when connected
//   const displayRate = isConnected ? pacemakerState?.rate || pacemakerParams.rate : pacemakerParams.rate;
//   const displayAOutput = isConnected ? pacemakerState?.a_output || pacemakerParams.aOutput : pacemakerParams.aOutput;
//   const displayVOutput = isConnected ? pacemakerState?.v_output || pacemakerParams.vOutput : pacemakerParams.vOutput;

//   // Check for incomplete session - ONLY ONCE
//   useEffect(() => {
//     if (!currentUser || !moduleId || initialized.current) return;

//     const incompleteSession = getIncompleteSession(moduleId);

//     if (incompleteSession && !currentSession) {
//       if (
//         incompleteSession.currentStep === "quiz" &&
//         !incompleteSession.quizState?.isCompleted
//       ) {
//         resumeSession(incompleteSession.id);
//       } else {
//         setResumeBannerSession(incompleteSession);
//       }
//     }

//     initialized.current = true;
//   }, [currentUser?.id, moduleId]); // FIXED: Removed functions to prevent loops

//   // Restore session state
//   useEffect(() => {
//     if (!currentSession?.id) return;

//     if (currentSession.quizState.isCompleted && !quizCompleted) {
//       setQuizCompleted(true);
//       setQuizPassed(
//         currentSession.quizState.score >=
//           Math.ceil(currentSession.quizState.totalQuestions * 0.7),
//       );
//       setQuizScore({
//         score: currentSession.quizState.score,
//         total: currentSession.quizState.totalQuestions,
//       });
//     }

//     if (currentSession.practiceState.currentParameters) {
//       setPacemakerParams(currentSession.practiceState.currentParameters);
//     }
//   }, [currentSession?.id, quizCompleted]);

//   // Reset parameters when module changes - ONLY when not connected
//   useEffect(() => {
//     if (currentModule && !currentSession && !isConnected) {
//       setPacemakerParams((prev) => {
//         const next = currentModule.initialParams;
//         const unchanged = (
//           prev.rate === next.rate &&
//           prev.aOutput === next.aOutput &&
//           prev.vOutput === next.vOutput &&
//           prev.aSensitivity === next.aSensitivity &&
//           prev.vSensitivity === next.vSensitivity
//         );
//         return unchanged ? prev : next;
//       });
//     }
//   }, [moduleId, currentSession?.id, isConnected]);


//   // Update sensor states
//   useEffect(() => {
//     if (!currentModule) return;

//     const leftShouldFlash = displayAOutput > 0 && pacemakerParams.aSensitivity > 0;
//     const rightShouldFlash = displayVOutput > 0 && pacemakerParams.vSensitivity > 0;

//     setSensorStates((prev) => {
//       if (prev.left === leftShouldFlash && prev.right === rightShouldFlash) {
//         return prev;
//       }
//       return { left: leftShouldFlash, right: rightShouldFlash };
//     });
//   }, [displayAOutput, displayVOutput, pacemakerParams.aSensitivity, pacemakerParams.vSensitivity]);

//   // handles connection mode changes
//   useEffect(() => {
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === "connectionMode") {
//         const newMode = e.newValue || "simulated";
//         console.log('🔄 Connection mode changed to:', newMode);
//         setConnectionMode(newMode);
        
//         // Clear fallback params when switching back to hardware
//         if (newMode === 'pacemaker') {
//           setFallbackParams(null);
//         }
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   // Auto-save session data - less frequent to prevent conflicts
//   useEffect(() => {
//     if (!currentSession?.id || currentSession.completedAt) return;

//     const interval = setInterval(() => {
//       if (!currentSession?.id || currentSession.completedAt) return;

//       try {
//         updateSession(currentSession.id, {
//           practiceState: {
//             ...currentSession.practiceState,
//             currentParameters: pacemakerParams,
//             timeSpentInPractice: Math.floor(
//               (Date.now() - new Date(currentSession.startedAt).getTime()) /
//                 1000,
//             ),
//           },
//         });
//       } catch (error) {
//         console.error("Auto-save error:", error);
//       }
//     }, 60000); // 60 seconds

//     return () => clearInterval(interval);
//   }, [currentSession?.id, currentSession?.completedAt]); // FIXED: Removed updateSession to prevent loops

//   if (!currentModule) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <h2 className="text-xl font-bold text-gray-900 mb-2">
//             Module Not Found
//           </h2>
//           <p className="text-gray-600 mb-4">
//             The requested module could not be found.
//           </p>
//           <button
//             onClick={() => navigate("/modules")}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Return to Modules
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const handleResumeSession = useCallback(() => {
//     if (resumeBannerSession) {
//       resumeSession(resumeBannerSession.id);
//       setResumeBannerSession(null);
//     }
//   }, [resumeBannerSession, resumeSession]);

//   const handleDiscardSession = useCallback(() => {
//     if (resumeBannerSession) {
//       endSession(resumeBannerSession.id, false, 0, 0);
//       setResumeBannerSession(null);
//     }
//   }, [resumeBannerSession, endSession]);

//   const handleQuizComplete = useCallback(
//     (passed: boolean, score: number, totalQuestions: number) => {
//       setQuizCompleted(true);
//       setQuizPassed(passed);
//       setQuizScore({ score, total: totalQuestions });

//       if (currentSession) {
//         updateSession(currentSession.id, {
//           currentStep: "practice",
//           quizState: {
//             ...currentSession.quizState,
//             isCompleted: true,
//             score,
//             totalQuestions,
//           },
//         });
//       }
//     },
//     [currentSession, updateSession],
//   );

//   const handleComplete = useCallback(
//     (success: boolean) => {
//       if (!currentSession) return;

//       const finalScore = success
//         ? Math.round((quizScore.score / quizScore.total) * 100)
//         : 0;

//       setIsSuccess(success);
//       setShowCompletion(true);

//       setTimeout(() => {
//         try {
//           endSession(currentSession.id, success, finalScore, quizScore.total);
//         } catch (error) {
//           console.error("Error ending session:", error);
//         }
//       }, 100);
//     },
//     [currentSession, quizScore, endSession],
//   );

//   const handleParameterChange = useCallback(
//     (param: string, oldValue: number, newValue: number) => {
//       if (!currentSession || Math.abs(oldValue - newValue) < 0.001) return;

//       const parameterChange = {
//         timestamp: new Date().toISOString(),
//         parameter: param,
//         oldValue,
//         newValue,
//       };

//       try {
//         updateSession(currentSession.id, {
//           practiceState: {
//             ...currentSession.practiceState,
//             parameterChanges: [
//               ...currentSession.practiceState.parameterChanges,
//               parameterChange,
//             ],
//             currentParameters: {
//               ...currentSession.practiceState.currentParameters,
//               [param]: newValue,
//             },
//           },
//         });
//       } catch (error) {
//         console.error("Error updating session:", error);
//       }
//     },
//     [currentSession, updateSession],
//   );

//   // ORIGINAL STYLE: Simple parameter changes
//   const handleModuleParameterChange = useCallback(
//     (param: string, value: number) => {
//       const oldValue = pacemakerParams[param as keyof typeof pacemakerParams];
//       if (Math.abs(oldValue - value) < 0.001) return;

//       // Update local state immediately
//       setPacemakerParams((prev) => ({
//         ...prev,
//         [param]: value,
//       }));

//       // Send to hardware if connected (like original)
//       if (isConnected) {
//         const paramMap: Record<string, string> = {
//           'aOutput': 'a_output',
//           'vOutput': 'v_output',
//           'aSensitivity': 'aSensitivity', 
//           'vSensitivity': 'vSensitivity',
//           'rate': 'rate'
//         };
        
//         const wsParam = paramMap[param] || param;
//         sendControlUpdate({ [wsParam]: value } as any);
//       }
//     },
//     [pacemakerParams, isConnected, sendControlUpdate],
//   );

//   const getHint = useCallback(() => {
//     const hints: Record<string, string> = {
//       "1": "Try decreasing the pacing rate first to see the intrinsic rhythm, then adjust sensitivity.",
//       "2": "Look for inappropriate sensing. Consider decreasing sensitivity or checking for interference.",
//       "3": "The pacemaker isn't seeing the patient's beats. Try increasing sensitivity.",
//       "4": "Gradually increase output until you see consistent capture after each pacing spike.",
//       "5": "No capture despite pacing spikes. Increase the output or check lead connections.",
//     };

//     return (
//       hints[moduleId || ""] ||
//       "Review the ECG pattern and think about what adjustments might help."
//     );
//   }, [moduleId]);

//   // Complete reset function
//   const handleTryAgain = () => {
//     // End current session
//     if (currentSession) {
//       endSession(currentSession.id, false, 0, 0);
//     }

//     // Reset all state
//     setShowCompletion(false);
//     setQuizCompleted(false);
//     setQuizPassed(false);
//     setQuizScore({ score: 0, total: 0 });
//     setResumeBannerSession(null);
//     setIsSuccess(false);

//     // Reset parameters
//     if (currentModule) {
//       setPacemakerParams(currentModule.initialParams);
//     }

//     setSensorStates({ left: false, right: false });

//     // Reset initialization
//     initialized.current = false;

//     // Force complete re-render
//     setResetKey((prev) => prev + 1);
//   };

//   const getConnectionStatusDisplay = () => {
//     if (isConnected && connectionMode === 'pacemaker') {
//       return {
//         className: "bg-green-100 text-green-800",
//         icon: <Wifi className="w-4 h-4 mr-2" />,
//         text: "Hardware Connected"
//       };
//     } else if (connectionMode === 'simulated') {
//       const usingFallback = fallbackParams !== null;
//       return {
//         className: usingFallback ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800",
//         icon: <WifiOff className="w-4 h-4 mr-2" />,
//         text: usingFallback ? "Simulation (Last HW Values)" : "Simulation Mode"
//       };
//     } else {
//       return {
//         className: "bg-gray-100 text-gray-800",
//         icon: <WifiOff className="w-4 h-4 mr-2" />,
//         text: "Disconnected"
//       };
//     }
//   };

//   const connectionStatus = getConnectionStatusDisplay();

//   return (
//     <div key={resetKey}>
//       {/* Resume Session Banner */}
//       {resumeBannerSession && (
//         <ResumeSessionBanner
//           session={{
//             id: resumeBannerSession.id,
//             moduleId: resumeBannerSession.moduleId,
//             moduleName: resumeBannerSession.moduleName,
//             currentStep:
//               resumeBannerSession.currentStep === "quiz"
//                 ? "Knowledge Assessment"
//                 : "Hands-on Practice",
//             lastActiveAt: resumeBannerSession.lastActiveAt,
//           }}
//           onResume={handleResumeSession}
//           onTryAgain={handleTryAgain}
//         />
//       )}

//       {/* Completion Modal */}
//       {showCompletion && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-lg text-center">
//             <div className="flex flex-col items-center justify-center py-6">
//               {isSuccess ? (
//                 <>
//                   <CheckCircle className="w-24 h-24 mb-6 text-green-500" />
//                   <h2 className="mb-4 text-3xl font-bold">Module Completed!</h2>
//                   <p className="mb-8 text-lg text-gray-600">
//                     Excellent work! You've successfully completed{" "}
//                     {currentModule.title}.
//                   </p>
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
//                     <p className="text-green-800 text-sm">
//                       <strong>Session Summary:</strong>
//                       <br />
//                       Quiz Score: {quizScore.score}/{quizScore.total} (
//                       {Math.round((quizScore.score / quizScore.total) * 100)}%)
//                       <br />
//                       Connection Mode: {connectionMode}
//                       <br />
//                       Duration:{" "}
//                       {Math.floor((Date.now() - sessionStartTime) / 60000)}{" "}
//                       minutes
//                     </p>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <XCircle className="w-24 h-24 mb-6 text-red-500" />
//                   <h2 className="mb-4 text-3xl font-bold">Session Ended</h2>
//                   <p className="mb-8 text-lg text-gray-600">
//                     Session ended. You can review your progress and try again
//                     anytime.
//                   </p>
//                 </>
//               )}

//               <div className="flex space-x-4">
//                 <button
//                   onClick={() => navigate("/modules")}
//                   className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Return to Modules
//                 </button>
//                 <button
//                   onClick={handleTryAgain}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Module Content */}
//       <div className="w-full px-8 py-8 bg-white shadow-lg rounded-3xl">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-6">
//           <div className="flex-1">
//             <h2 className="text-2xl font-bold leading-tight mb-2">
//               Module {moduleId}: {currentModule.title}
//             </h2>

//             {/* Connection Status */}
//             <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${connectionStatus.className}`}>
//               {connectionStatus.icon}
//               {connectionStatus.text}
//             </div>

//             {/* Session Status */}
//             {currentSession && (
//               <div className="mt-2">
//                 <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
//                   Session Active • Step: {currentSession.currentStep}
//                   {currentSession.practiceState.parameterChanges.length > 0 && (
//                     <>
//                       {" "}
//                       • {
//                         currentSession.practiceState.parameterChanges.length
//                       }{" "}
//                       adjustments
//                     </>
//                   )}
//                 </span>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={() => alert(getHint())}
//             className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center hover:bg-blue-200 ml-4"
//             title="Get a hint"
//           >
//             <Lightbulb className="w-6 h-6 text-blue-600" />
//           </button>
//         </div>

//         <div className="grid grid-cols-3 gap-8">
//           {/* Main Content Area */}
//           <div className="col-span-2 space-y-6">
//             {/* Objective */}
//             <div className="bg-[#F0F6FE] rounded-xl p-6">
//               <h3 className="mb-3 font-bold text-lg">Objective:</h3>
//               <p className="whitespace-pre-line text-gray-700">
//                 {currentModule.objective}
//               </p>
//             </div>

//             {/* ECG Display */}
//             <div className="space-y-2">
//               <h3 className="font-bold text-lg">ECG Monitor</h3>
//               <ECGVisualizer
//                 rate={displayRate}
//                 aOutput={displayAOutput}
//                 vOutput={displayVOutput}
//                 sensitivity={pacemakerParams.aSensitivity}
//                 mode={currentModule.mode}
//               />
//             </div>

//             {/* hardware Connected - Live Data (UPDATED) */}
//             {isConnected && connectionMode === 'pacemaker' && quizCompleted && (
//               <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
//                 <h3 className="font-bold text-lg mb-3 flex items-center">
//                   <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
//                   Hardware Connected - Live Data
//                   <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
//                     Quiz Complete: {quizScore.score}/{quizScore.total}
//                   </span>
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
//                   <div className="bg-white rounded-lg p-2">
//                     <div className="text-gray-500">Rate</div>
//                     <div className="font-mono text-lg">{displayRate} BPM</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-2">
//                     <div className="text-gray-500">A Output</div>
//                     <div className="font-mono text-lg">{displayAOutput} mA</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-2">
//                     <div className="text-gray-500">V Output</div>
//                     <div className="font-mono text-lg">{displayVOutput} mA</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-2">
//                     <div className="text-gray-500">A Sensitivity</div>
//                     <div className="font-mono text-lg">{pacemakerParams.aSensitivity} mV</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-2">
//                     <div className="text-gray-500">V Sensitivity</div>
//                     <div className="font-mono text-lg">{pacemakerParams.vSensitivity} mV</div>
//                   </div>
//                   {pacemakerState?.batteryLevel && (
//                     <div className="bg-white rounded-lg p-2">
//                       <div className="text-gray-500">Battery</div>
//                       <div className="font-mono text-lg">{pacemakerState.batteryLevel}%</div>
//                     </div>
//                   )}
//                 </div>
//                 <p className="text-green-800 mt-3">
//                   ✅ Real-time data from hardware pacemaker device
//                 </p>
//               </div>
//             )}

//             {/* fallback simulation section */}
//             {connectionMode === 'simulated' && fallbackParams && quizCompleted && (
//               <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
//                 <h3 className="font-bold text-lg mb-3 flex items-center">
//                   <span className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></span>
//                   Simulation Mode - Using Last Hardware Values
//                   <span className="ml-3 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
//                     Connection Lost
//                   </span>
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
//                   <div className="bg-white rounded-lg p-2">
//                     <div className="text-gray-500">Rate (Last HW)</div>
//                     <div className="font-mono text-lg">{fallbackParams.rate} BPM</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-2">
//                     <div className="text-gray-500">A Output (Last HW)</div>
//                     <div className="font-mono text-lg">{fallbackParams.aOutput} mA</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-2">
//                     <div className="text-gray-500">V Output (Last HW)</div>
//                     <div className="font-mono text-lg">{fallbackParams.vOutput} mA</div>
//                   </div>
//                 </div>
                
//                 {/* Show simulation controls */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {currentModule.controlsNeeded.rate && (
//                     <CustomSlider
//                       label="Pacemaker Rate"
//                       value={pacemakerParams.rate}
//                       onChange={(value) => handleModuleParameterChange("rate", value)}
//                       type="rate"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.aOutput && (
//                     <CustomSlider
//                       label="Atrial Output"
//                       value={pacemakerParams.aOutput}
//                       onChange={(value) => handleModuleParameterChange("aOutput", value)}
//                       type="aOutput"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.vOutput && (
//                     <CustomSlider
//                       label="Ventricular Output"
//                       value={pacemakerParams.vOutput}
//                       onChange={(value) => handleModuleParameterChange("vOutput", value)}
//                       type="vOutput"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.aSensitivity && (
//                     <CustomSlider
//                       label="Atrial Sensitivity"
//                       value={pacemakerParams.aSensitivity}
//                       onChange={(value) => handleModuleParameterChange("aSensitivity", value)}
//                       type="aSensitivity"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.vSensitivity && (
//                     <CustomSlider
//                       label="Ventricular Sensitivity"
//                       value={pacemakerParams.vSensitivity}
//                       onChange={(value) => handleModuleParameterChange("vSensitivity", value)}
//                       type="vSensitivity"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                 </div>
                
//                 <p className="text-orange-800 mt-3">
//                   ⚠️ Hardware temporarily disconnected. Using simulation with last known values. Will auto-reconnect when available.
//                 </p>
//               </div>
//             )}

//             {/* Regular Simulation Controls (when manually in simulation mode) */}
//             {connectionMode === 'simulated' && !fallbackParams && quizCompleted && (
//               <div className="bg-gray-50 rounded-xl p-6 border-2 border-blue-200">
//                 <h3 className="font-bold text-lg mb-6 flex items-center">
//                   <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
//                   Pacemaker Controls
//                   {quizPassed && (
//                     <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
//                       Quiz Complete: {quizScore.score}/{quizScore.total}
//                     </span>
//                   )}
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {currentModule.controlsNeeded.rate && (
//                     <CustomSlider
//                       label="Pacemaker Rate"
//                       value={pacemakerParams.rate}
//                       onChange={(value) =>
//                         handleModuleParameterChange("rate", value)
//                       }
//                       type="rate"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.aOutput && (
//                     <CustomSlider
//                       label="Atrial Output"
//                       value={pacemakerParams.aOutput}
//                       onChange={(value) =>
//                         handleModuleParameterChange("aOutput", value)
//                       }
//                       type="aOutput"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.vOutput && (
//                     <CustomSlider
//                       label="Ventricular Output"
//                       value={pacemakerParams.vOutput}
//                       onChange={(value) =>
//                         handleModuleParameterChange("vOutput", value)
//                       }
//                       type="vOutput"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.aSensitivity && (
//                     <CustomSlider
//                       label="Atrial Sensitivity"
//                       value={pacemakerParams.aSensitivity}
//                       onChange={(value) =>
//                         handleModuleParameterChange("aSensitivity", value)
//                       }
//                       type="aSensitivity"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.vSensitivity && (
//                     <CustomSlider
//                       label="Ventricular Sensitivity"
//                       value={pacemakerParams.vSensitivity}
//                       onChange={(value) =>
//                         handleModuleParameterChange("vSensitivity", value)
//                       }
//                       type="vSensitivity"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Quiz Section */}
//             <div className="space-y-2">
//               <h3 className="font-bold text-lg">Knowledge Assessment</h3>
//               <MultipleChoiceQuiz
//                 key={`quiz-${resetKey}`}
//                 moduleId={parseInt(moduleId || "1")}
//                 onComplete={handleQuizComplete}
//               />
//             </div>
//           </div>

//           {/* Right Sidebar */}
//           <div className="space-y-6">
//             {/* Session Progress Indicator */}
//             {currentSession && (
//               <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
//                 <h3 className="mb-3 font-bold text-blue-900">
//                   Session Progress
//                 </h3>
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span>Quiz</span>
//                     <span
//                       className={
//                         quizCompleted ? "text-green-600" : "text-gray-500"
//                       }
//                     >
//                       {quizCompleted ? "✓ Complete" : "In Progress"}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span>Practice</span>
//                     <span
//                       className={
//                         currentSession.currentStep === "practice"
//                           ? "text-blue-600"
//                           : "text-gray-500"
//                       }
//                     >
//                       {currentSession.currentStep === "practice"
//                         ? "Active"
//                         : "Not Started"}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span>Adjustments</span>
//                     <span className="text-gray-700">
//                       {currentSession.practiceState.parameterChanges.length}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span>Duration</span>
//                     <span className="text-gray-700">
//                       {Math.floor(
//                         (Date.now() -
//                           new Date(currentSession.startedAt).getTime()) /
//                           60000,
//                       )}
//                       m
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Sensing Lights */}
//             <div className="bg-[#F0F6FE] rounded-xl p-4">
//               <h3 className="mb-4 font-bold">Sensing Status</h3>
//               <div className="flex justify-around">
//                 <div className="flex flex-col items-center">
//                   <div
//                     className={`w-16 h-16 rounded-full transition-all duration-300 ${
//                       sensorStates.left
//                         ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
//                         : "bg-gray-300"
//                     }`}
//                   />
//                   <span className="mt-2 text-sm text-gray-600">Atrial</span>
//                 </div>
//                 <div className="flex flex-col items-center">
//                   <div
//                     className={`w-16 h-16 rounded-full transition-all duration-300 ${
//                       sensorStates.right
//                         ? "bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"
//                         : "bg-gray-300"
//                     }`}
//                   />
//                   <span className="mt-2 text-sm text-gray-600">
//                     Ventricular
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Patient's Intrinsic Heart Rate */}
//             <div className="bg-[#F0F6FE] rounded-xl p-4">
//               <h3 className="mb-2 font-bold">Patient's Intrinsic HR</h3>
//               <div className="text-center">
//                 <span className="text-4xl font-mono text-gray-700">
//                   {patientHeartRate}
//                 </span>
//                 <span className="text-lg text-gray-500 ml-1">BPM</span>
//               </div>
//               <p className="text-xs text-gray-500 text-center mt-1">
//                 Baseline rhythm
//               </p>
//             </div>

//             <div className="bg-[#F0F6FE] rounded-xl p-4">
//               <h3 className="mb-2 font-bold">Blood Pressure</h3>
//               <div className="text-center">
//                 <span className="text-4xl font-mono text-gray-700">120/80</span>
//                 <span className="text-lg text-gray-500 ml-1">mmHg</span>
//               </div>
//             </div>

//             {/* Pacemaker Rate */}
//             <div className="bg-[#F0F6FE] rounded-xl p-4">
//               <h3 className="mb-2 font-bold">Pacemaker Rate</h3>
//               <div className="text-center">
//                 <span className="text-4xl font-mono text-gray-700">
//                   {displayRate}
//                 </span>
//                 <span className="text-lg text-gray-500 ml-1">BPM</span>
//               </div>
//               <p className="text-xs text-gray-500 text-center mt-1">
//                 {isConnected && connectionMode === 'pacemaker' ? 'Live from device' : 
//                  fallbackParams ? 'Last known value' : 'Device setting'}
//               </p>
//             </div>

//             {/* Action Buttons */}
//             {quizCompleted && (
//               <div className="flex flex-col space-y-3">
//                 <button
//                   onClick={() => handleComplete(false)}
//                   className="w-full py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
//                 >
//                   End Session
//                 </button>
//                 <button
//                   onClick={() => handleComplete(true)}
//                   className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   Complete Module
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-8 pt-6 border-t border-gray-200">
//           <button
//             onClick={() => navigate("/modules")}
//             className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             Return to Module List
//           </button>
//         </div>
//       </div>

//       {/* Custom CSS for sliders */}
//       <style>
//         {`
//         .slider::-webkit-slider-thumb {
//           appearance: none;
//           height: 20px;
//           width: 20px;
//           border-radius: 50%;
//           background: #3b82f6;
//           cursor: pointer;
//           border: 2px solid #ffffff;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//         }
        
//         .slider::-moz-range-thumb {
//           height: 20px;
//           width: 20px;
//           border-radius: 50%;
//           background: #3b82f6;
//           cursor: pointer;
//           border: 2px solid #ffffff;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//         }
//         `}
//       </style>
//     </div>
//   );
// };

// export default ModulePage;






// adding steps 

import { useState, useEffect, useCallback, useRef } from "react";
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
  const overrideOnReconnect = useRef(false);

  const { currentUser } = useAuth();
  const {
    startSession,
    endSession,
    updateSession,
    currentSession,
    getIncompleteSession,
    resumeSession,
    updateStepProgress
  } = useSession(currentUser?.id);

  const { 
    state: pacemakerState, 
    isConnected: wsConnected, 
    sendControlUpdate,
    lastKnownState 
  } = usePacemakerData();

  // Reset key for forcing re-render
  const [resetKey, setResetKey] = useState(0);

  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [resumeBannerSession, setResumeBannerSession] = useState<any>(null);

  const [patientHeartRate] = useState(40);

  // Simple connection mode - no auto-switching to prevent loops
  const [connectionMode, setConnectionMode] = useState(() => {
    return localStorage.getItem("connectionMode") || "simulated";
  });

  const isConnected = connectionMode === "pacemaker" && wsConnected;

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

  const currentModule = moduleId ? moduleConfigs[moduleId] : undefined;

  const [pacemakerParams, setPacemakerParams] = useState(() => {
    return (
      currentModule?.initialParams || {
        rate: 60,
        aOutput: 5,
        vOutput: 5,
        aSensitivity: 2,
        vSensitivity: 2,
      }
    );
  });

  // Define handleParameterChange before useStepController
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

  const {
    steps,
    currentStep,
    currentStepIndex,
    completedSteps,
    allStepsCompleted,
    getProgressPercentage,
    getFlashingSensor,
    handleStepComplete,
    isInitialized,
  } = useStepController({
    moduleId: moduleId || "1",
    currentParams: pacemakerParams,
    isQuizCompleted: quizCompleted,
    currentSession,
    updateStepProgress: handleStepProgressUpdate, // PASS THE FUNCTION DIRECTLY
  });

  // DEBIGGING useStepController
  useEffect(() => {
    console.log('🔍 Step Controller Debug:', {
      steps: steps.length,
      currentStep: currentStep?.id,
      currentStepIndex,
      completedSteps: Array.from(completedSteps),
      allStepsCompleted,
      isInitialized,
      quizCompleted,
      sessionId: currentSession?.id
    });
  }, [steps, currentStep, currentStepIndex, completedSteps, allStepsCompleted, isInitialized, quizCompleted, currentSession?.id]);

  const [sensorStates, setSensorStates] = useState({
    left: false,
    right: false,
  });

  // Simple initialization tracking
  const initialized = useRef(false);

  const [fallbackParams, setFallbackParams] = useState<typeof pacemakerParams | null>(null);

  useEffect(() => {
    if (isConnected && pacemakerState) {
      const newParams = {
        rate: pacemakerState.rate,
        aOutput: pacemakerState.a_output,
        vOutput: pacemakerState.v_output,
        aSensitivity: pacemakerState.aSensitivity,
        vSensitivity: pacemakerState.vSensitivity,
      };

      // Skip updating params if we just reconnected + pushed values ourselves
      if (overrideOnReconnect.current) {
        overrideOnReconnect.current = false; // Reset the flag
        console.log("🛑 Skipping param overwrite after reconnect — frontend already pushed values.");
        return;
      }

      // Compare with existing state to prevent unnecessary updates
      setPacemakerParams((prev) => {
        const isSame =
          prev.rate === newParams.rate &&
          prev.aOutput === newParams.aOutput &&
          prev.vOutput === newParams.vOutput &&
          prev.aSensitivity === newParams.aSensitivity &&
          prev.vSensitivity === newParams.vSensitivity;

        if (isSame) return prev; // no change — avoid render

        return newParams;
      });

      setFallbackParams((prev) => {
        const isSame =
          prev &&
          prev.rate === newParams.rate &&
          prev.aOutput === newParams.aOutput &&
          prev.vOutput === newParams.vOutput &&
          prev.aSensitivity === newParams.aSensitivity &&
          prev.vSensitivity === newParams.vSensitivity;

        if (isSame) return prev;
        return newParams;
      });
    }
    // fallback handling unchanged
    else if (
      !isConnected &&
      connectionMode === "simulated" &&
      lastKnownState &&
      !fallbackParams
    ) {
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
    if (wsConnected && connectionMode === "simulated") {
      console.log("🔌 WebSocket reconnected — switching to pacemaker mode");
      
      setConnectionMode("pacemaker");
      localStorage.setItem("connectionMode", "pacemaker");

      // Build payload with detailed logging
      const paramMap = {
        rate: "rate",
        aOutput: "a_output",
        vOutput: "v_output",
        aSensitivity: "aSensitivity",
        vSensitivity: "vSensitivity",
      };

      const payload: Record<string, number> = {};
      for (const key in paramMap) {
        const value = pacemakerParams[key as keyof typeof pacemakerParams];
        payload[paramMap[key as keyof typeof paramMap]] = value;
        console.log(`  Building payload: ${key} (${paramMap[key as keyof typeof paramMap]}) = ${value}`);
      }

      try {
        overrideOnReconnect.current = true;
        sendControlUpdate(payload as any);
        console.log("✅ Successfully sent payload to hardware");
      } catch (error) {
        console.error("❌ Failed to send values to hardware:", error);
      }

      setFallbackParams(null);
    }
  }, [wsConnected, connectionMode, pacemakerParams, sendControlUpdate]);

  // Display values - prioritize hardware when connected
  const displayRate = isConnected ? pacemakerState?.rate || pacemakerParams.rate : pacemakerParams.rate;
  const displayAOutput = isConnected ? pacemakerState?.a_output || pacemakerParams.aOutput : pacemakerParams.aOutput;
  const displayVOutput = isConnected ? pacemakerState?.v_output || pacemakerParams.vOutput : pacemakerParams.vOutput;

  // Check for incomplete session - ONLY ONCE
  useEffect(() => {
    if (!currentUser || !moduleId || initialized.current) return;

    const incompleteSession = getIncompleteSession(moduleId);

    if (incompleteSession && !currentSession) {
      if (
        incompleteSession.currentStep === "quiz" &&
        !incompleteSession.quizState?.isCompleted
      ) {
        resumeSession(incompleteSession.id);
      } else {
        setResumeBannerSession(incompleteSession);
      }
    }

    initialized.current = true;
  }, [currentUser?.id, moduleId]);

  // Restore session state
  useEffect(() => {
    if (!currentSession?.id) return;

    if (currentSession.quizState.isCompleted && !quizCompleted) {
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

    if (currentSession.practiceState.currentParameters) {
      setPacemakerParams(currentSession.practiceState.currentParameters);
    }
  }, [currentSession?.id, quizCompleted]);

  // Reset parameters when module changes - ONLY when not connected
  useEffect(() => {
    if (currentModule && !currentSession && !isConnected) {
      setPacemakerParams((prev) => {
        const next = currentModule.initialParams;
        const unchanged = (
          prev.rate === next.rate &&
          prev.aOutput === next.aOutput &&
          prev.vOutput === next.vOutput &&
          prev.aSensitivity === next.aSensitivity &&
          prev.vSensitivity === next.vSensitivity
        );
        return unchanged ? prev : next;
      });
    }
  }, [moduleId, currentSession?.id, isConnected]);

  // Update sensor states
  useEffect(() => {
    if (!currentModule) return;

    // Base flashing logic (like original app)
    const leftShouldFlash = displayAOutput > 0 && pacemakerParams.aSensitivity > 0;
    const rightShouldFlash = displayVOutput > 0 && pacemakerParams.vSensitivity > 0;
    
    // Get step-specific flashing from step controller
    const stepFlashingSensor = getFlashingSensor();
    
    // Advanced logic: stop flashing after certain thresholds are reached
    const shouldStopFlashingLeft = () => {
      // Stop flashing left sensor if we've completed sensitivity calibration
      if (completedSteps.has('step4') || completedSteps.has('step5')) {
        return true; // Sensitivity calibration done
      }
      
      // For Module 1: Stop flashing when we reach certain milestones
      if (moduleId === "1") {
        // Stop flashing if we're in capture testing phase (step 7+)
        if (currentStepIndex >= 6) {
          return pacemakerParams.aSensitivity >= 0.8; // Safety margin set
        }
        // During sensitivity testing, flash until threshold found
        if (currentStepIndex >= 3 && currentStepIndex <= 5) {
          return false; // Keep flashing during sensitivity testing
        }
      }
      
      return false;
    };

    const shouldStopFlashingRight = () => {
      // Similar logic for right sensor
      if (completedSteps.has('step4') || completedSteps.has('step5')) {
        return true;
      }
      
      if (moduleId === "1") {
        // Right sensor mainly for ventricular - less used in Module 1
        return currentStepIndex >= 6; // Stop after sensitivity testing
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

  // handles connection mode changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "connectionMode") {
        const newMode = e.newValue || "simulated";
        console.log('🔄 Connection mode changed to:', newMode);
        setConnectionMode(newMode);
        
        // Clear fallback params when switching back to hardware
        if (newMode === 'pacemaker') {
          setFallbackParams(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Auto-save session data - less frequent to prevent conflicts
  useEffect(() => {
    if (!currentSession?.id || currentSession.completedAt) return;

    const interval = setInterval(() => {
      if (!currentSession?.id || currentSession.completedAt) return;

      try {
        updateSession(currentSession.id, {
          practiceState: {
            ...currentSession.practiceState,
            currentParameters: pacemakerParams,
            timeSpentInPractice: Math.floor(
              (Date.now() - new Date(currentSession.startedAt).getTime()) /
                1000,
            ),
          },
        });
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [currentSession?.id, currentSession?.completedAt]);

  if (!currentModule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Module Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested module could not be found.
          </p>
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

  const handleResumeSession = useCallback(() => {
    if (resumeBannerSession) {
      resumeSession(resumeBannerSession.id);
      setResumeBannerSession(null);
    }
  }, [resumeBannerSession, resumeSession]);

  const handleDiscardSession = useCallback(() => {
    if (resumeBannerSession) {
      endSession(resumeBannerSession.id, false, 0, 0);
      setResumeBannerSession(null);
    }
  }, [resumeBannerSession, endSession]);

  const handleQuizComplete = useCallback(
    (passed: boolean, score: number, totalQuestions: number) => {
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

      // Check if all steps are completed for true success
      const actualSuccess = success && (allStepsCompleted || !quizCompleted);

      const finalScore = actualSuccess
        ? Math.round((quizScore.score / quizScore.total) * 100)
        : 0;

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
    [currentSession, quizScore, endSession, allStepsCompleted, quizCompleted],
  );

  const handleModuleParameterChange = useCallback(
    (param: string, value: number) => {
      const oldValue = pacemakerParams[param as keyof typeof pacemakerParams];
      if (Math.abs(oldValue - value) < 0.001) return;

      // Update local state immediately
      setPacemakerParams((prev) => ({
        ...prev,
        [param]: value,
      }));

      // Track parameter change for session
      handleParameterChange(param, oldValue, value);

      // Send to hardware if connected
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

  const getHint = useCallback(() => {
    // If we have a current step with a hint, use that
    if (quizCompleted && currentStep?.hint) {
      return currentStep.hint;
    }
    
    // Fallback to general module hints
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
  }, [moduleId, quizCompleted, currentStep]);

  // Complete reset function
  const handleTryAgain = () => {
    // End current session
    if (currentSession) {
      endSession(currentSession.id, false, 0, 0);
    }

    // Reset all state
    setShowCompletion(false);
    setQuizCompleted(false);
    setQuizPassed(false);
    setQuizScore({ score: 0, total: 0 });
    setResumeBannerSession(null);
    setIsSuccess(false);

    // Reset parameters
    if (currentModule) {
      setPacemakerParams(currentModule.initialParams);
    }

    setSensorStates({ left: false, right: false });

    // Reset initialization
    initialized.current = false;

    // Force complete re-render
    setResetKey((prev) => prev + 1);
  };

  const getConnectionStatusDisplay = () => {
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
  };

  const connectionStatus = getConnectionStatusDisplay();

  return (
    <div key={resetKey}>
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
          onTryAgain={handleTryAgain}
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
                  Session Active • Step: {currentSession.currentStep}
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
            title={quizCompleted && currentStep?.hint ? "Step-specific hint available!" : "Get a hint"}
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

            {/* Step Progress Component - Only show after quiz completion */}
            {quizCompleted && steps.length > 0 && isInitialized && (
              <StepProgress
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

            {/* Regular Simulation Controls (when manually in simulation mode) */}
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
                  {steps.length > 0 && (
                    <span className="ml-3 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Step {currentStepIndex + 1}/{steps.length} • {getProgressPercentage()}% Complete
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Remove all the control restriction logic - show all controls */}
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
                key={`quiz-${resetKey}`}
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
                <h3 className="mb-3 font-bold text-blue-900">
                  Session Progress
                </h3>
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
                  {steps.length > 0 && (
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
                  <span className="mt-2 text-sm text-gray-600">
                    Ventricular
                  </span>
                </div>
              </div>
            </div>

            {/* Patient's Intrinsic Heart Rate */}
            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Patient's Intrinsic HR</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">
                  {patientHeartRate}
                </span>
                <span className="text-lg text-gray-500 ml-1">BPM</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Baseline rhythm
              </p>
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
                <span className="text-4xl font-mono text-gray-700">
                  {displayRate}
                </span>
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
                  disabled={steps.length > 0 && (!allStepsCompleted || !isInitialized)}
                  className={`w-full py-3 rounded-lg transition-colors ${
                    steps.length > 0 && (!allStepsCompleted || !isInitialized)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {steps.length > 0 && (!allStepsCompleted || !isInitialized)
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