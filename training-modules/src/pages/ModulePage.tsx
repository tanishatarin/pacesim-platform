// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, Lightbulb, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';
// import ECGVisualizer from '../components/ECGVisualizer';
// import MultipleChoiceQuiz from '../components/MultipleChoiceQuiz';
// import ResumeSessionBanner from '../components/ResumeSessionBanner';
// import { useAuth } from '../hooks/useAuth';
// import { useSession } from '../hooks/useSession';

// interface ModuleConfig {
//   title: string;
//   objective: string;
//   mode: "sensitivity" | "oversensing" | "undersensing" | "capture_module" | "failure_to_capture";
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

// // Custom slider component with variable step sizes and improved tracking
// const CustomSlider = ({ 
//   label, 
//   value, 
//   onChange, 
//   type,
//   onParameterChange 
// }: { 
//   label: string; 
//   value: number; 
//   onChange: (value: number) => void;
//   type: 'aOutput' | 'vOutput' | 'rate' | 'aSensitivity' | 'vSensitivity';
//   onParameterChange: (param: string, oldValue: number, newValue: number) => void;
// }) => {
//   const getStepSize = (currentValue: number, type: string) => {
//     switch (type) {
//       case 'aOutput':
//         if (currentValue <= 0.4) return 0.1;
//         if (currentValue <= 1.0) return 0.2;
//         if (currentValue <= 5.0) return 0.5;
//         return 1.0;
      
//       case 'vOutput':
//         if (currentValue <= 0.4) return 0.1;
//         if (currentValue <= 1.0) return 0.2;
//         if (currentValue <= 5.0) return 0.5;
//         return 1.0;
      
//       case 'rate':
//         if (currentValue <= 50) return 5;
//         if (currentValue <= 100) return 2;
//         if (currentValue <= 170) return 5;
//         return 6;
      
//       case 'aSensitivity':
//         if (currentValue >= 3) return 1;
//         if (currentValue >= 2) return 0.5;
//         if (currentValue >= 0.8) return 0.2;
//         return 0.1;
      
//       case 'vSensitivity':
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
//       case 'aOutput': return { min: 0.1, max: 20.0 };
//       case 'vOutput': return { min: 0.1, max: 25.0 };
//       case 'rate': return { min: 30, max: 180 };
//       case 'aSensitivity': return { min: 0.4, max: 10 };
//       case 'vSensitivity': return { min: 0.8, max: 20 };
//       default: return { min: 0, max: 100 };
//     }
//   };

//   const range = getRange(type);
//   const step = getStepSize(value, type);

//   const handleChange = useCallback((newValue: number) => {
//     const oldValue = value;
//     const finalValue = parseFloat(newValue.toFixed(1));
    
//     // Only proceed if value actually changed
//     if (Math.abs(oldValue - finalValue) < 0.001) return;
    
//     console.log('🎚️  Slider change:', { type, oldValue, newValue: finalValue });
    
//     // Log the parameter change for analytics
//     onParameterChange(type, oldValue, finalValue);
    
//     // Update the component state
//     onChange(finalValue);
//   }, [value, type, onChange, onParameterChange]);

//   const handleIncrement = useCallback(() => {
//     const newValue = Math.min(range.max, value + step);
//     handleChange(newValue);
//   }, [value, step, range.max, handleChange]);

//   const handleDecrement = useCallback(() => {
//     const newValue = Math.max(range.min, value - step);
//     handleChange(newValue);
//   }, [value, step, range.min, handleChange]);

//   const getUnit = (type: string) => {
//     switch (type) {
//       case 'aOutput':
//       case 'vOutput': return 'mA';
//       case 'rate': return 'BPM';
//       case 'aSensitivity':
//       case 'vSensitivity': return 'mV';
//       default: return '';
//     }
//   };

//   return (
//     <div className="space-y-3">
//       <label className="block text-sm font-medium text-gray-700">
//         {label}: <span className="font-mono text-blue-600">{value} {getUnit(type)}</span>
//       </label>
//       <div className="flex items-center space-x-3">
//         <button
//           onClick={handleDecrement}
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
//           onClick={handleIncrement}
//           className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
//           disabled={value >= range.max}
//         >
//           +
//         </button>
//       </div>
//       <div className="flex justify-between text-xs text-gray-500">
//         <span>{range.min} {getUnit(type)}</span>
//         <span>{range.max} {getUnit(type)}</span>
//       </div>
//     </div>
//   );
// };

// const ModulePage = () => {
//   const { moduleId } = useParams();
//   const navigate = useNavigate();
  
//   // Database hooks
//   const { currentUser } = useAuth();
//   const { 
//     startSession, 
//     endSession, 
//     updateSession, 
//     currentSession, 
//     getIncompleteSession,
//     resumeSession 
//   } = useSession(currentUser?.id);
  
//   // State management
//   const [quizCompleted, setQuizCompleted] = useState(false);
//   const [quizPassed, setQuizPassed] = useState(false);
//   const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
//   const [showCompletion, setShowCompletion] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [sessionStartTime] = useState(Date.now());
//   const [resumeBannerSession, setResumeBannerSession] = useState<any>(null);
//   const [resetKey, setResetKey] = useState(0);

  
//   // Patient's intrinsic heart rate (separate from pacemaker rate)
//   const [patientHeartRate] = useState(40);
  
//   // Get connection mode from localStorage (set in settings)
//   const [connectionMode, setConnectionMode] = useState(() => {
//     return localStorage.getItem('connectionMode') || 'disconnected';
//   });
  
//   const isConnected = connectionMode === 'pacemaker';
//   const isSimulated = connectionMode === 'simulated';
  
//   // Module configurations
//   const moduleConfigs: Record<string, ModuleConfig> = {
//     '1': {
//       title: 'Scenario 1: Bradycardia Management',
//       objective: 'Diagnose and correct a failure to sense condition. Complete the knowledge check and then adjust the pacemaker.\n\nScenario: You return to a patient\'s room and observe this ECG pattern. Their heart rate has dropped to 40 BPM and atrial leads are connected.',
//       mode: 'sensitivity',
//       initialParams: { rate: 40, aOutput: 2, vOutput: 3, aSensitivity: 1, vSensitivity: 2 },
//       controlsNeeded: { rate: true, aOutput: true, vOutput: false, aSensitivity: true, vSensitivity: false }
//     },
//     '2': {
//       title: 'Scenario 2: Oversensing Issues',
//       objective: 'Identify and correct oversensing problems that are causing inappropriate pacing inhibition.\n\nScenario: The pacemaker is detecting signals that shouldn\'t inhibit pacing.',
//       mode: 'oversensing',
//       initialParams: { rate: 70, aOutput: 5, vOutput: 5, aSensitivity: 4, vSensitivity: 4 },
//       controlsNeeded: { rate: true, aOutput: true, vOutput: true, aSensitivity: true, vSensitivity: true }
//     },
//     '3': {
//       title: 'Scenario 3: Undersensing Problems',
//       objective: 'Correct undersensing issues where the pacemaker fails to detect intrinsic cardiac activity.\n\nScenario: The pacemaker is not sensing the patient\'s own heartbeats.',
//       mode: 'undersensing',
//       initialParams: { rate: 60, aOutput: 5, vOutput: 5, aSensitivity: 0.5, vSensitivity: 0.8 },
//       controlsNeeded: { rate: true, aOutput: false, vOutput: true, aSensitivity: true, vSensitivity: true }
//     },
//     '4': {
//       title: 'Capture Calibration Module',
//       objective: 'Learn to establish and verify proper cardiac capture.\n\nScenario: Practice adjusting output levels to achieve consistent capture.',
//       mode: 'capture_module',
//       initialParams: { rate: 80, aOutput: 3, vOutput: 2, aSensitivity: 2, vSensitivity: 2 },
//       controlsNeeded: { rate: true, aOutput: true, vOutput: true, aSensitivity: false, vSensitivity: false }
//     },
//     '5': {
//       title: 'Failure to Capture',
//       objective: 'Diagnose and correct failure to capture situations.\n\nScenario: Pacing spikes are present but not followed by cardiac depolarization.',
//       mode: 'failure_to_capture',
//       initialParams: { rate: 70, aOutput: 1, vOutput: 1, aSensitivity: 2, vSensitivity: 2 },
//       controlsNeeded: { rate: true, aOutput: true, vOutput: true, aSensitivity: false, vSensitivity: false }
//     }
//   };

//   const currentModule = moduleId ? moduleConfigs[moduleId] : undefined;
  
//   // Pacemaker parameters - initialize from session or module defaults
//   const [pacemakerParams, setPacemakerParams] = useState(() => {
//     return currentModule?.initialParams || {
//       rate: 60,
//       aOutput: 5,
//       vOutput: 5,
//       aSensitivity: 2,
//       vSensitivity: 2
//     };
//   });
  
//   // Sensor states - only flash when conditions are met
//   const [sensorStates, setSensorStates] = useState({
//     left: false,
//     right: false
//   });

//   // Refs to prevent infinite loops
//   const initializationRef = useRef({ moduleInitialized: false, sessionRestored: false });

//   // ✅ FIXED: Check for incomplete session FIRST, before quiz creates new one
//   useEffect(() => {
//     if (!currentUser || !moduleId) return;

//     console.log('🔍 Checking for existing sessions for module:', moduleId);
    
//     // Check if there's already an active session for this module
//     const incompleteSession = getIncompleteSession(moduleId);
    
//     if (incompleteSession && !currentSession) {
//       console.log('📋 Found incomplete session:', incompleteSession.id);
      
//       // If user was in the middle of a quiz, automatically resume
//       if (incompleteSession.currentStep === 'quiz' && !incompleteSession.quizState?.isCompleted) {
//         console.log('🎓 Auto-resuming quiz session');
//         resumeSession(incompleteSession.id);
//       } else {
//         // Otherwise, show the resume banner for user choice
//         console.log('🔄 Showing resume banner');
//         setResumeBannerSession(incompleteSession);
//       }
//     } else if (!incompleteSession && !currentSession) {
//       console.log('✨ No existing session found - ready for new session');
//       // No existing session, ready for quiz to create new one when needed
//     }
//   }, [currentUser, moduleId, getIncompleteSession, currentSession?.id, resumeSession]);


//   // ✅ FIXED: Restore session state if resuming
//   useEffect(() => {
//     if (!currentSession?.id || initializationRef.current.sessionRestored) return;

//     console.log('🔄 Restoring session state for:', currentSession.id);
//     initializationRef.current.sessionRestored = true;

//     // Restore quiz state
//     if (currentSession.quizState.isCompleted && !quizCompleted) {
//       console.log('📚 Restoring quiz state');
//       setQuizCompleted(true);
//       setQuizPassed(currentSession.quizState.score >= Math.ceil(currentSession.quizState.totalQuestions * 0.7));
//       setQuizScore({
//         score: currentSession.quizState.score,
//         total: currentSession.quizState.totalQuestions
//       });
//     }

//     // Restore practice parameters
//     if (currentSession.practiceState.currentParameters) {
//       console.log('⚙️ Restoring practice parameters');
//       setPacemakerParams(currentSession.practiceState.currentParameters);
//     }
//   }, [currentSession?.id]);

//   // ✅ FIXED: Initialize module parameters when moduleId changes
//   useEffect(() => {
//     if (!currentModule || currentSession?.id || initializationRef.current.moduleInitialized) return;
    
//     console.log('🆕 Initializing module parameters for:', moduleId);
//     initializationRef.current.moduleInitialized = true;
//     setPacemakerParams(currentModule.initialParams);
//   }, [moduleId, currentSession?.id]);

//   // Reset initialization flags when module changes
//   useEffect(() => {
//     initializationRef.current = { moduleInitialized: false, sessionRestored: false };
//   }, [moduleId]);

//   // ✅ FIXED: Update sensor states (prevent infinite loops)
//   useEffect(() => {
//     if (!currentModule) return;

//     const leftShouldFlash = pacemakerParams.aOutput > 0 && pacemakerParams.aSensitivity > 0;
//     const rightShouldFlash = pacemakerParams.vOutput > 0 && pacemakerParams.vSensitivity > 0;

//     setSensorStates((prev) => {
//       if (prev.left === leftShouldFlash && prev.right === rightShouldFlash) {
//         return prev;
//       }
      
//       console.log('💡 Sensor states updated:', { left: leftShouldFlash, right: rightShouldFlash });
//       return {
//         left: leftShouldFlash,
//         right: rightShouldFlash,
//       };
//     });
//   }, [
//     pacemakerParams.aOutput,
//     pacemakerParams.aSensitivity,
//     pacemakerParams.vOutput,
//     pacemakerParams.vSensitivity,
//     moduleId
//   ]);

//   // Listen for connection mode changes
//   useEffect(() => {
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'connectionMode') {
//         setConnectionMode(e.newValue || 'disconnected');
//       }
//     };
    
//     window.addEventListener('storage', handleStorageChange);
    
//     const initialMode = localStorage.getItem('connectionMode') || 'disconnected';
//     setConnectionMode(initialMode);
    
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []);

//   // ✅ FIXED: Auto-save session data periodically
//   useEffect(() => {
//     if (!currentSession?.id || currentSession.completedAt) return;

//     console.log('💾 Setting up auto-save for session:', currentSession.id);

//     const interval = setInterval(() => {
//       if (!currentSession?.id || currentSession.completedAt) return;
      
//       console.log('💾 Auto-saving session data...');
      
//       try {
//         updateSession(currentSession.id, {
//           practiceState: {
//             ...currentSession.practiceState,
//             currentParameters: pacemakerParams,
//             timeSpentInPractice: Math.floor((Date.now() - new Date(currentSession.startedAt).getTime()) / 1000)
//           }
//         });
//       } catch (error) {
//         console.error('❌ Auto-save error:', error);
//       }
//     }, 15000);

//     return () => {
//       console.log('💾 Clearing auto-save interval');
//       clearInterval(interval);
//     };
//   }, [currentSession?.id, currentSession?.completedAt, updateSession]);

//   if (!currentModule) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Module Not Found</h2>
//           <p className="text-gray-600 mb-4">The requested module could not be found.</p>
//           <button
//             onClick={() => navigate('/modules')}
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

//   const handleQuizComplete = useCallback((passed: boolean, score: number, totalQuestions: number) => {
//     console.log('🎓 Quiz completed:', { passed, score, totalQuestions, moduleId });
    
//     // Update local state immediately
//     setQuizCompleted(true);
//     setQuizPassed(passed);
//     setQuizScore({ score, total: totalQuestions });
    
//     // Only update existing session, don't create new one here
//     if (currentSession) {
//       console.log('📝 Updating existing session with quiz results');
//       updateSession(currentSession.id, {
//         currentStep: 'practice',
//         quizState: {
//           ...currentSession.quizState,
//           isCompleted: true,
//           score,
//           totalQuestions
//         }
//       });
//     } else {
//       console.warn('⚠️ No session to update with quiz results');
//     }
//   }, [moduleId, currentSession, updateSession]);

//   const handleComplete = useCallback((success: boolean) => {
//     if (!currentSession) {
//       console.warn('⚠️  No current session to complete');
//       return;
//     }

//     console.log('🏁 Completing module:', { moduleId, success });

//     const finalScore = success ? Math.round((quizScore.score / quizScore.total) * 100) : 0;
    
//     // Update UI state immediately
//     setIsSuccess(success);
//     setShowCompletion(true);
    
//     // End session with delay to prevent cascade
//     setTimeout(() => {
//       try {
//         endSession(currentSession.id, success, finalScore, quizScore.total);
//       } catch (error) {
//         console.error('❌ Error ending session:', error);
//       }
//     }, 100);
//   }, [currentSession, moduleId, quizScore, endSession]);

//   const handleParameterChange = useCallback((param: string, oldValue: number, newValue: number) => {
//     if (!currentSession || Math.abs(oldValue - newValue) < 0.001) return;

//     console.log('📊 Parameter change:', { param, oldValue, newValue });

//     const parameterChange = {
//       timestamp: new Date().toISOString(),
//       parameter: param,
//       oldValue,
//       newValue
//     };

//     try {
//       updateSession(currentSession.id, {
//         practiceState: {
//           ...currentSession.practiceState,
//           parameterChanges: [...currentSession.practiceState.parameterChanges, parameterChange],
//           currentParameters: { ...currentSession.practiceState.currentParameters, [param]: newValue }
//         }
//       });
//     } catch (error) {
//       console.error('❌ Error updating session with parameter change:', error);
//     }
//   }, [currentSession, updateSession]);

//   const handleModuleParameterChange = useCallback((param: string, value: number) => {
//     const oldValue = pacemakerParams[param as keyof typeof pacemakerParams];
    
//     if (Math.abs(oldValue - value) < 0.001) return;

//     console.log('🎛️  Module parameter change:', { param, oldValue, newValue: value });
    
//     setPacemakerParams(prev => ({
//       ...prev,
//       [param]: value
//     }));
    
//     if (isConnected) {
//       console.log('📡 Sending to hardware:', { [param]: value });
//     }
//   }, [pacemakerParams, isConnected]);

//   const getHint = useCallback(() => {
//     const hints: Record<string, string> = {
//       '1': 'Try decreasing the pacing rate first to see the intrinsic rhythm, then adjust sensitivity.',
//       '2': 'Look for inappropriate sensing. Consider decreasing sensitivity or checking for interference.',
//       '3': 'The pacemaker isn\'t seeing the patient\'s beats. Try increasing sensitivity.',
//       '4': 'Gradually increase output until you see consistent capture after each pacing spike.',
//       '5': 'No capture despite pacing spikes. Increase the output or check lead connections.'
//     };
    
//     return hints[moduleId || ''] || 'Review the ECG pattern and think about what adjustments might help.';
//   }, [moduleId]);

//   return (
//     <>
//       {/* Resume Session Banner */}
//       {resumeBannerSession && (
//         <ResumeSessionBanner
//           session={{
//             id: resumeBannerSession.id,
//             moduleId: resumeBannerSession.moduleId,
//             moduleName: resumeBannerSession.moduleName,
//             currentStep: resumeBannerSession.currentStep === 'quiz' ? 'Knowledge Assessment' : 'Hands-on Practice',
//             lastActiveAt: resumeBannerSession.lastActiveAt
//           }}
//           onResume={handleResumeSession}
//           onDiscard={handleDiscardSession}
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
//                     Excellent work! You've successfully completed {currentModule.title}.
//                   </p>
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
//                     <p className="text-green-800 text-sm">
//                       <strong>Session Summary:</strong><br />
//                       Quiz Score: {quizScore.score}/{quizScore.total} ({Math.round((quizScore.score / quizScore.total) * 100)}%)<br />
//                       Connection Mode: {connectionMode}<br />
//                       Duration: {Math.floor((Date.now() - sessionStartTime) / 60000)} minutes<br />
//                       {currentSession && (
//                         <>Parameter Adjustments: {currentSession.practiceState.parameterChanges.length}</>
//                       )}
//                     </p>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <XCircle className="w-24 h-24 mb-6 text-red-500" />
//                   <h2 className="mb-4 text-3xl font-bold">Session Ended</h2>
//                   <p className="mb-8 text-lg text-gray-600">
//                     Session ended. You can review your progress and try again anytime.
//                   </p>
//                   <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
//                     <p className="text-gray-700 text-sm">
//                       <strong>Session Summary:</strong><br />
//                       Quiz Score: {quizScore.score}/{quizScore.total} ({Math.round((quizScore.score / quizScore.total) * 100)}%)<br />
//                       Connection Mode: {connectionMode}<br />
//                       Duration: {Math.floor((Date.now() - sessionStartTime) / 60000)} minutes<br />
//                       {currentSession && (
//                         <>Parameter Adjustments: {currentSession.practiceState.parameterChanges.length}</>
//                       )}
//                     </p>
//                   </div>
//                 </>
//               )}
              
//               <div className="flex space-x-4">
//                 <button
//                   onClick={() => navigate('/modules')}
//                   className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Return to Modules
//                 </button>
//                 <button
//                   onClick={() => {
//                     console.log('🔄 Try Again clicked - resetting everything');
                    
//                     // 1. End current session if exists
//                     if (currentSession) {
//                       console.log('🛑 Ending current session for fresh start');
//                       endSession(currentSession.id, false, 0, 0);
//                     }
                    
//                     // 2. Reset all state
//                     setShowCompletion(false);
//                     setQuizCompleted(false);
//                     setQuizPassed(false);
//                     setQuizScore({ score: 0, total: 0 });
//                     setResumeBannerSession(null);
//                     // currentSession(null); // Removed: currentSession is not a setter function
//                     setIsSuccess(false);
//                     setPacemakerParams(currentModule?.initialParams || {
//                       rate: 60,
//                       aOutput: 5,
//                       vOutput: 5,
//                       aSensitivity: 2,
//                       vSensitivity: 2
//                     });
//                     setSensorStates({ left: false, right: false });
//                     setConnectionMode(localStorage.getItem('connectionMode') || 'disconnected');
//                     setResetKey(prev => prev + 1); // Force re-render
//                     console.log('🔄 All states reset for new attempt')
//                     ;
                    
//                     // 3. Reset parameters to module defaults
//                     if (currentModule) {
//                       setPacemakerParams(currentModule.initialParams);
//                     }
                    
//                     // 4. Reset initialization flags
//                     initializationRef.current = { moduleInitialized: false, sessionRestored: false };
                    
//                     // 5. Force quiz component to completely re-render by changing key
//                     setResetKey(prev => prev + 1);
//                   }}
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
//             <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//               isConnected 
//                 ? 'bg-green-100 text-green-800' 
//                 : isSimulated
//                 ? 'bg-blue-100 text-blue-800'
//                 : 'bg-yellow-100 text-yellow-800'
//             }`}>
//               {isConnected ? (
//                 <>
//                   <Wifi className="w-4 h-4 mr-2" />
//                   Hardware Connected
//                 </>
//               ) : isSimulated ? (
//                 <>
//                   <WifiOff className="w-4 h-4 mr-2" />
//                   Simulation Mode
//                 </>
//               ) : (
//                 <>
//                   <WifiOff className="w-4 h-4 mr-2" />
//                   Disconnected
//                 </>
//               )}
//             </div>

//             {/* Session Status */}
//             {currentSession && (
//               <div className="mt-2">
//                 <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
//                   Session Active • Step: {currentSession.currentStep}
//                   {currentSession.practiceState.parameterChanges.length > 0 && (
//                     <> • {currentSession.practiceState.parameterChanges.length} adjustments</>
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
//               <p className="whitespace-pre-line text-gray-700">{currentModule.objective}</p>
//             </div>

//             {/* ECG Display */}
//             <div className="space-y-2">
//               <h3 className="font-bold text-lg">ECG Monitor</h3>
//               <ECGVisualizer
//                 rate={pacemakerParams.rate}
//                 aOutput={pacemakerParams.aOutput}
//                 vOutput={pacemakerParams.vOutput}
//                 sensitivity={pacemakerParams.aSensitivity}
//                 mode={currentModule.mode}
//               />
//             </div>

//             {/* Simulation Controls */}
//             {isSimulated && quizCompleted && (
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
//                       onChange={(value) => handleModuleParameterChange('rate', value)}
//                       type="rate"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.aOutput && (
//                     <CustomSlider
//                       label="Atrial Output"
//                       value={pacemakerParams.aOutput}
//                       onChange={(value) => handleModuleParameterChange('aOutput', value)}
//                       type="aOutput"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.vOutput && (
//                     <CustomSlider
//                       label="Ventricular Output"
//                       value={pacemakerParams.vOutput}
//                       onChange={(value) => handleModuleParameterChange('vOutput', value)}
//                       type="vOutput"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.aSensitivity && (
//                     <CustomSlider
//                       label="Atrial Sensitivity"
//                       value={pacemakerParams.aSensitivity}
//                       onChange={(value) => handleModuleParameterChange('aSensitivity', value)}
//                       type="aSensitivity"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                   {currentModule.controlsNeeded.vSensitivity && (
//                     <CustomSlider
//                       label="Ventricular Sensitivity"
//                       value={pacemakerParams.vSensitivity}
//                       onChange={(value) => handleModuleParameterChange('vSensitivity', value)}
//                       type="vSensitivity"
//                       onParameterChange={handleParameterChange}
//                     />
//                   )}
//                 </div>
                
//                 {/* Real-time parameter display */}
//                 <div className="mt-6 p-4 bg-white rounded-lg border">
//                   <h4 className="font-medium text-gray-700 mb-3">Current Pacemaker Settings:</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
//                     <div>
//                       <span className="text-gray-500">Rate:</span>
//                       <span className="ml-2 font-mono font-medium">{pacemakerParams.rate} BPM</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-500">A Output:</span>
//                       <span className="ml-2 font-mono font-medium">{pacemakerParams.aOutput} mA</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-500">V Output:</span>
//                       <span className="ml-2 font-mono font-medium">{pacemakerParams.vOutput} mA</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-500">A Sens:</span>
//                       <span className="ml-2 font-mono font-medium">{pacemakerParams.aSensitivity} mV</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-500">V Sens:</span>
//                       <span className="ml-2 font-mono font-medium">{pacemakerParams.vSensitivity} mV</span>
//                     </div>
//                   </div>
                  
//                   {/* Parameter change history */}
//                   {currentSession && currentSession.practiceState.parameterChanges.length > 0 && (
//                     <div className="mt-4 pt-4 border-t border-gray-200">
//                       <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Changes:</h5>
//                       <div className="max-h-24 overflow-y-auto">
//                         {currentSession.practiceState.parameterChanges.slice(-3).map((change, index) => (
//                           <div key={index} className="text-xs text-gray-600 mb-1">
//                             <span className="font-medium">{change.parameter}:</span> {change.oldValue} → {change.newValue}
//                             <span className="ml-2 text-gray-400">
//                               {new Date(change.timestamp).toLocaleTimeString()}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Hardware message when connected */}
//             {isConnected && quizCompleted && (
//               <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
//                 <h3 className="font-bold text-lg mb-3 flex items-center">
//                   <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
//                   Hardware Connected
//                   <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
//                     Quiz Complete: {quizScore.score}/{quizScore.total}
//                   </span>
//                 </h3>
//                 <p className="text-green-800">
//                   Use the physical pacemaker controls to adjust settings. The ECG above will reflect your changes in real-time.
//                 </p>
//                 {currentSession && currentSession.practiceState.parameterChanges.length > 0 && (
//                   <p className="text-green-700 text-sm mt-2">
//                     Hardware adjustments detected: {currentSession.practiceState.parameterChanges.length} changes logged
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Quiz Section */}
//             <div className="space-y-2">
//               <h3 className="font-bold text-lg">Knowledge Assessment</h3>
//               <MultipleChoiceQuiz
//                 moduleId={parseInt(moduleId || '1')}
//                 onComplete={handleQuizComplete}
//               />
//             </div>
//           </div>

//           {/* Right Sidebar */}
//           <div className="space-y-6">
//             {/* Session Progress Indicator */}
//             {currentSession && (
//               <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
//                 <h3 className="mb-3 font-bold text-blue-900">Session Progress</h3>
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span>Quiz</span>
//                     <span className={quizCompleted ? 'text-green-600' : 'text-gray-500'}>
//                       {quizCompleted ? '✓ Complete' : 'In Progress'}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span>Practice</span>
//                     <span className={currentSession.currentStep === 'practice' ? 'text-blue-600' : 'text-gray-500'}>
//                       {currentSession.currentStep === 'practice' ? 'Active' : 'Not Started'}
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
//                       {Math.floor((Date.now() - new Date(currentSession.startedAt).getTime()) / 60000)}m
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
//                   <div className={`w-16 h-16 rounded-full transition-all duration-300 ${
//                     sensorStates.left 
//                       ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' 
//                       : 'bg-gray-300'
//                   }`} />
//                   <span className="mt-2 text-sm text-gray-600">Atrial</span>
//                 </div>
//                 <div className="flex flex-col items-center">
//                   <div className={`w-16 h-16 rounded-full transition-all duration-300 ${
//                     sensorStates.right 
//                       ? 'bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50' 
//                       : 'bg-gray-300'
//                   }`} />
//                   <span className="mt-2 text-sm text-gray-600">Ventricular</span>
//                 </div>
//               </div>
//             </div>

//             {/* Patient's Intrinsic Heart Rate */}
//             <div className="bg-[#F0F6FE] rounded-xl p-4">
//               <h3 className="mb-2 font-bold">Patient's Intrinsic HR</h3>
//               <div className="text-center">
//                 <span className="text-4xl font-mono text-gray-700">{patientHeartRate}</span>
//                 <span className="text-lg text-gray-500 ml-1">BPM</span>
//               </div>
//               <p className="text-xs text-gray-500 text-center mt-1">Baseline rhythm</p>
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
//                 <span className="text-4xl font-mono text-gray-700">{pacemakerParams.rate}</span>
//                 <span className="text-lg text-gray-500 ml-1">BPM</span>
//               </div>
//               <p className="text-xs text-gray-500 text-center mt-1">Device setting</p>
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
//             onClick={() => navigate('/modules')}
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
//     </>
//   );
// };

// export default ModulePage;











import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';
import ECGVisualizer from '../components/ECGVisualizer';
import MultipleChoiceQuiz from '../components/MultipleChoiceQuiz';
import ResumeSessionBanner from '../components/ResumeSessionBanner';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';

interface ModuleConfig {
  title: string;
  objective: string;
  mode: "sensitivity" | "oversensing" | "undersensing" | "capture_module" | "failure_to_capture";
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
  onParameterChange 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void;
  type: 'aOutput' | 'vOutput' | 'rate' | 'aSensitivity' | 'vSensitivity';
  onParameterChange: (param: string, oldValue: number, newValue: number) => void;
}) => {
  const getStepSize = (currentValue: number, type: string) => {
    switch (type) {
      case 'aOutput':
        if (currentValue <= 0.4) return 0.1;
        if (currentValue <= 1.0) return 0.2;
        if (currentValue <= 5.0) return 0.5;
        return 1.0;
      case 'vOutput':
        if (currentValue <= 0.4) return 0.1;
        if (currentValue <= 1.0) return 0.2;
        if (currentValue <= 5.0) return 0.5;
        return 1.0;
      case 'rate':
        if (currentValue <= 50) return 5;
        if (currentValue <= 100) return 2;
        if (currentValue <= 170) return 5;
        return 6;
      case 'aSensitivity':
        if (currentValue >= 3) return 1;
        if (currentValue >= 2) return 0.5;
        if (currentValue >= 0.8) return 0.2;
        return 0.1;
      case 'vSensitivity':
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
      case 'aOutput': return { min: 0.1, max: 20.0 };
      case 'vOutput': return { min: 0.1, max: 25.0 };
      case 'rate': return { min: 30, max: 180 };
      case 'aSensitivity': return { min: 0.4, max: 10 };
      case 'vSensitivity': return { min: 0.8, max: 20 };
      default: return { min: 0, max: 100 };
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
      case 'aOutput':
      case 'vOutput': return 'mA';
      case 'rate': return 'BPM';
      case 'aSensitivity':
      case 'vSensitivity': return 'mV';
      default: return '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}: <span className="font-mono text-blue-600">{value} {getUnit(type)}</span>
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
        <span>{range.min} {getUnit(type)}</span>
        <span>{range.max} {getUnit(type)}</span>
      </div>
    </div>
  );
};

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  
  const { currentUser } = useAuth();
  const { 
    startSession, 
    endSession, 
    updateSession, 
    currentSession, 
    getIncompleteSession,
    resumeSession 
  } = useSession(currentUser?.id);
  
  // ✅ SIMPLE FIX: Add reset key for forcing re-render
  const [resetKey, setResetKey] = useState(0);
  
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [resumeBannerSession, setResumeBannerSession] = useState<any>(null);
  
  const [patientHeartRate] = useState(40);
  
  const [connectionMode, setConnectionMode] = useState(() => {
    return localStorage.getItem('connectionMode') || 'disconnected';
  });
  
  const isConnected = connectionMode === 'pacemaker';
  const isSimulated = connectionMode === 'simulated';
  
  const moduleConfigs: Record<string, ModuleConfig> = {
    '1': {
      title: 'Scenario 1: Bradycardia Management',
      objective: 'Diagnose and correct a failure to sense condition. Complete the knowledge check and then adjust the pacemaker.\n\nScenario: You return to a patient\'s room and observe this ECG pattern. Their heart rate has dropped to 40 BPM and atrial leads are connected.',
      mode: 'sensitivity',
      initialParams: { rate: 40, aOutput: 2, vOutput: 3, aSensitivity: 1, vSensitivity: 2 },
      controlsNeeded: { rate: true, aOutput: true, vOutput: false, aSensitivity: true, vSensitivity: false }
    },
    '2': {
      title: 'Scenario 2: Oversensing Issues',
      objective: 'Identify and correct oversensing problems that are causing inappropriate pacing inhibition.\n\nScenario: The pacemaker is detecting signals that shouldn\'t inhibit pacing.',
      mode: 'oversensing',
      initialParams: { rate: 70, aOutput: 5, vOutput: 5, aSensitivity: 4, vSensitivity: 4 },
      controlsNeeded: { rate: true, aOutput: true, vOutput: true, aSensitivity: true, vSensitivity: true }
    },
    '3': {
      title: 'Scenario 3: Undersensing Problems',
      objective: 'Correct undersensing issues where the pacemaker fails to detect intrinsic cardiac activity.\n\nScenario: The pacemaker is not sensing the patient\'s own heartbeats.',
      mode: 'undersensing',
      initialParams: { rate: 60, aOutput: 5, vOutput: 5, aSensitivity: 0.5, vSensitivity: 0.8 },
      controlsNeeded: { rate: true, aOutput: false, vOutput: true, aSensitivity: true, vSensitivity: true }
    },
    '4': {
      title: 'Capture Calibration Module',
      objective: 'Learn to establish and verify proper cardiac capture.\n\nScenario: Practice adjusting output levels to achieve consistent capture.',
      mode: 'capture_module',
      initialParams: { rate: 80, aOutput: 3, vOutput: 2, aSensitivity: 2, vSensitivity: 2 },
      controlsNeeded: { rate: true, aOutput: true, vOutput: true, aSensitivity: false, vSensitivity: false }
    },
    '5': {
      title: 'Failure to Capture',
      objective: 'Diagnose and correct failure to capture situations.\n\nScenario: Pacing spikes are present but not followed by cardiac depolarization.',
      mode: 'failure_to_capture',
      initialParams: { rate: 70, aOutput: 1, vOutput: 1, aSensitivity: 2, vSensitivity: 2 },
      controlsNeeded: { rate: true, aOutput: true, vOutput: true, aSensitivity: false, vSensitivity: false }
    }
  };

  const currentModule = moduleId ? moduleConfigs[moduleId] : undefined;
  
  const [pacemakerParams, setPacemakerParams] = useState(() => {
    return currentModule?.initialParams || {
      rate: 60,
      aOutput: 5,
      vOutput: 5,
      aSensitivity: 2,
      vSensitivity: 2
    };
  });
  
  const [sensorStates, setSensorStates] = useState({
    left: false,
    right: false
  });

  // Simple initialization tracking
  const initialized = useRef(false);

  // Check for incomplete session
  useEffect(() => {
    if (!currentUser || !moduleId || initialized.current) return;

    const incompleteSession = getIncompleteSession(moduleId);
    
    if (incompleteSession && !currentSession) {
      if (incompleteSession.currentStep === 'quiz' && !incompleteSession.quizState?.isCompleted) {
        resumeSession(incompleteSession.id);
      } else {
        setResumeBannerSession(incompleteSession);
      }
    }
    
    initialized.current = true;
  }, [currentUser, moduleId, getIncompleteSession, currentSession?.id, resumeSession]);

  // Restore session state
  useEffect(() => {
    if (!currentSession?.id) return;

    if (currentSession.quizState.isCompleted && !quizCompleted) {
      setQuizCompleted(true);
      setQuizPassed(currentSession.quizState.score >= Math.ceil(currentSession.quizState.totalQuestions * 0.7));
      setQuizScore({
        score: currentSession.quizState.score,
        total: currentSession.quizState.totalQuestions
      });
    }

    if (currentSession.practiceState.currentParameters) {
      setPacemakerParams(currentSession.practiceState.currentParameters);
    }
  }, [currentSession?.id, quizCompleted]);

  // Reset parameters when module changes (only if they're different)
  useEffect(() => {
    if (currentModule && !currentSession) {
      const currentParams = JSON.stringify(pacemakerParams);
      const initialParams = JSON.stringify(currentModule.initialParams);
      
      if (currentParams !== initialParams) {
        setPacemakerParams(currentModule.initialParams);
      }
    }
  }, [moduleId, currentModule, currentSession]);

  // Update sensor states
  useEffect(() => {
    if (!currentModule) return;

    const leftShouldFlash = pacemakerParams.aOutput > 0 && pacemakerParams.aSensitivity > 0;
    const rightShouldFlash = pacemakerParams.vOutput > 0 && pacemakerParams.vSensitivity > 0;

    setSensorStates(prev => {
      if (prev.left === leftShouldFlash && prev.right === rightShouldFlash) {
        return prev;
      }
      return { left: leftShouldFlash, right: rightShouldFlash };
    });
  }, [pacemakerParams.aOutput, pacemakerParams.aSensitivity, pacemakerParams.vOutput, pacemakerParams.vSensitivity, currentModule]);

  // Listen for connection mode changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'connectionMode') {
        setConnectionMode(e.newValue || 'disconnected');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-save session data (simplified)
  useEffect(() => {
    if (!currentSession?.id || currentSession.completedAt) return;

    const interval = setInterval(() => {
      if (!currentSession?.id || currentSession.completedAt) return;
      
      try {
        updateSession(currentSession.id, {
          practiceState: {
            ...currentSession.practiceState,
            currentParameters: pacemakerParams,
            timeSpentInPractice: Math.floor((Date.now() - new Date(currentSession.startedAt).getTime()) / 1000)
          }
        });
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 30000); // Increased to 30 seconds to reduce conflicts

    return () => clearInterval(interval);
  }, [currentSession?.id, currentSession?.completedAt, updateSession]); // Removed pacemakerParams dependency

  if (!currentModule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Module Not Found</h2>
          <p className="text-gray-600 mb-4">The requested module could not be found.</p>
          <button
            onClick={() => navigate('/modules')}
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

  const handleQuizComplete = useCallback((passed: boolean, score: number, totalQuestions: number) => {
    setQuizCompleted(true);
    setQuizPassed(passed);
    setQuizScore({ score, total: totalQuestions });
    
    if (currentSession) {
      updateSession(currentSession.id, {
        currentStep: 'practice',
        quizState: {
          ...currentSession.quizState,
          isCompleted: true,
          score,
          totalQuestions
        }
      });
    }
  }, [currentSession, updateSession]);

  const handleComplete = useCallback((success: boolean) => {
    if (!currentSession) return;

    const finalScore = success ? Math.round((quizScore.score / quizScore.total) * 100) : 0;
    
    setIsSuccess(success);
    setShowCompletion(true);
    
    setTimeout(() => {
      try {
        endSession(currentSession.id, success, finalScore, quizScore.total);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }, 100);
  }, [currentSession, quizScore, endSession]);

  const handleParameterChange = useCallback((param: string, oldValue: number, newValue: number) => {
    if (!currentSession || Math.abs(oldValue - newValue) < 0.001) return;

    const parameterChange = {
      timestamp: new Date().toISOString(),
      parameter: param,
      oldValue,
      newValue
    };

    try {
      updateSession(currentSession.id, {
        practiceState: {
          ...currentSession.practiceState,
          parameterChanges: [...currentSession.practiceState.parameterChanges, parameterChange],
          currentParameters: { ...currentSession.practiceState.currentParameters, [param]: newValue }
        }
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }, [currentSession, updateSession]);

  const handleModuleParameterChange = useCallback((param: string, value: number) => {
    const oldValue = pacemakerParams[param as keyof typeof pacemakerParams];
    
    if (Math.abs(oldValue - value) < 0.001) return;
    
    setPacemakerParams(prev => ({
      ...prev,
      [param]: value
    }));
    
    if (isConnected) {
      console.log('Sending to hardware:', { [param]: value });
    }
  }, [pacemakerParams, isConnected]);

  const getHint = useCallback(() => {
    const hints: Record<string, string> = {
      '1': 'Try decreasing the pacing rate first to see the intrinsic rhythm, then adjust sensitivity.',
      '2': 'Look for inappropriate sensing. Consider decreasing sensitivity or checking for interference.',
      '3': 'The pacemaker isn\'t seeing the patient\'s beats. Try increasing sensitivity.',
      '4': 'Gradually increase output until you see consistent capture after each pacing spike.',
      '5': 'No capture despite pacing spikes. Increase the output or check lead connections.'
    };
    
    return hints[moduleId || ''] || 'Review the ECG pattern and think about what adjustments might help.';
  }, [moduleId]);

  // ✅ SIMPLE FIX: Complete reset function
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
    
    // ✅ Force complete re-render
    setResetKey(prev => prev + 1);
  };

  return (
    <div key={resetKey}>
      {/* Resume Session Banner */}
      {resumeBannerSession && (
        <ResumeSessionBanner
          session={{
            id: resumeBannerSession.id,
            moduleId: resumeBannerSession.moduleId,
            moduleName: resumeBannerSession.moduleName,
            currentStep: resumeBannerSession.currentStep === 'quiz' ? 'Knowledge Assessment' : 'Hands-on Practice',
            lastActiveAt: resumeBannerSession.lastActiveAt
          }}
          onResume={handleResumeSession}
          onDiscard={handleDiscardSession}
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
                      <strong>Session Summary:</strong><br />
                      Quiz Score: {quizScore.score}/{quizScore.total} ({Math.round((quizScore.score / quizScore.total) * 100)}%)<br />
                      Connection Mode: {connectionMode}<br />
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
                  onClick={() => navigate('/modules')}
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
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : isSimulated
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Hardware Connected
                </>
              ) : isSimulated ? (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Simulation Mode
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Disconnected
                </>
              )}
            </div>

            {/* Session Status */}
            {currentSession && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  Session Active • Step: {currentSession.currentStep}
                  {currentSession.practiceState.parameterChanges.length > 0 && (
                    <> • {currentSession.practiceState.parameterChanges.length} adjustments</>
                  )}
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => alert(getHint())}
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
              <p className="whitespace-pre-line text-gray-700">{currentModule.objective}</p>
            </div>

            {/* ECG Display */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">ECG Monitor</h3>
              <ECGVisualizer
                rate={pacemakerParams.rate}
                aOutput={pacemakerParams.aOutput}
                vOutput={pacemakerParams.vOutput}
                sensitivity={pacemakerParams.aSensitivity}
                mode={currentModule.mode}
              />
            </div>

            {/* Simulation Controls */}
            {isSimulated && quizCompleted && (
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="font-bold text-lg mb-6 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
                  Pacemaker Controls
                  {quizPassed && (
                    <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Quiz Complete: {quizScore.score}/{quizScore.total}
                    </span>
                  )}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentModule.controlsNeeded.rate && (
                    <CustomSlider
                      label="Pacemaker Rate"
                      value={pacemakerParams.rate}
                      onChange={(value) => handleModuleParameterChange('rate', value)}
                      type="rate"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.aOutput && (
                    <CustomSlider
                      label="Atrial Output"
                      value={pacemakerParams.aOutput}
                      onChange={(value) => handleModuleParameterChange('aOutput', value)}
                      type="aOutput"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.vOutput && (
                    <CustomSlider
                      label="Ventricular Output"
                      value={pacemakerParams.vOutput}
                      onChange={(value) => handleModuleParameterChange('vOutput', value)}
                      type="vOutput"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.aSensitivity && (
                    <CustomSlider
                      label="Atrial Sensitivity"
                      value={pacemakerParams.aSensitivity}
                      onChange={(value) => handleModuleParameterChange('aSensitivity', value)}
                      type="aSensitivity"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                  {currentModule.controlsNeeded.vSensitivity && (
                    <CustomSlider
                      label="Ventricular Sensitivity"
                      value={pacemakerParams.vSensitivity}
                      onChange={(value) => handleModuleParameterChange('vSensitivity', value)}
                      type="vSensitivity"
                      onParameterChange={handleParameterChange}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Hardware message when connected */}
            {isConnected && quizCompleted && (
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                  Hardware Connected
                  <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Quiz Complete: {quizScore.score}/{quizScore.total}
                  </span>
                </h3>
                <p className="text-green-800">
                  Use the physical pacemaker controls to adjust settings. The ECG above will reflect your changes in real-time.
                </p>
              </div>
            )}

            {/* Quiz Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Knowledge Assessment</h3>
              <MultipleChoiceQuiz
                key={`quiz-${resetKey}`}
                moduleId={parseInt(moduleId || '1')}
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
                    <span className={quizCompleted ? 'text-green-600' : 'text-gray-500'}>
                      {quizCompleted ? '✓ Complete' : 'In Progress'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Practice</span>
                    <span className={currentSession.currentStep === 'practice' ? 'text-blue-600' : 'text-gray-500'}>
                      {currentSession.currentStep === 'practice' ? 'Active' : 'Not Started'}
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
                </div>
              </div>
            )}

            {/* Sensing Lights */}
            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-4 font-bold">Sensing Status</h3>
              <div className="flex justify-around">
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full transition-all duration-300 ${
                    sensorStates.left 
                      ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' 
                      : 'bg-gray-300'
                  }`} />
                  <span className="mt-2 text-sm text-gray-600">Atrial</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full transition-all duration-300 ${
                    sensorStates.right 
                      ? 'bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50' 
                      : 'bg-gray-300'
                  }`} />
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
                <span className="text-4xl font-mono text-gray-700">{pacemakerParams.rate}</span>
                <span className="text-lg text-gray-500 ml-1">BPM</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">Device setting</p>
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
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete Module
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button 
            onClick={() => navigate('/modules')}
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