// import { useState, useEffect, useCallback, useRef } from "react";
// import db from "../lib/db";
// import type { Session } from "../lib/db";

// export const useSession = (userId?: string) => {
//   const [currentSession, setCurrentSession] = useState<Session | null>(null);
//   const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Use refs to prevent unnecessary re-renders
//   const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastUpdateRef = useRef<string>("");

//   // Load user's session data on mount
//   useEffect(() => {
//     if (!userId) {
//       setIsLoading(false);
//       return;
//     }

//     // Prevent double loading in StrictMode
//     let hasLoaded = false;

//     try {
//       if (!hasLoaded) {
//         console.log("📚 Loading session data for user:", userId);
//         hasLoaded = true;

//         db.read();

//         // Get user's session history
//         const userSessions =
//           db.data?.sessions?.filter((s) => s.userId === userId) || [];
//         setSessionHistory(userSessions);

//         // Check for active session
//         const activeSession = userSessions.find((s) => !s.completedAt);
//         if (activeSession) {
//           console.log("🔄 Found active session:", activeSession.id);
//           setCurrentSession(activeSession);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading session data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [userId]);

//   const startSession = useCallback(
//     (moduleId: string, moduleName: string): string | null => {
//       if (!userId) {
//         console.warn("Cannot start session: no userId");
//         return null;
//       }

//       try {
//         console.log("🚀 Starting new session for module:", moduleId);
//         db.read();

//         // End any existing active session first (but don't trigger cascade)
//         const existingActive = db.data?.sessions?.find(
//           (s) => s.userId === userId && !s.completedAt,
//         );
//         if (existingActive) {
//           console.log("🛑 Ending existing active session:", existingActive.id);
//           const sessionIndex = db.data!.sessions.findIndex(
//             (s) => s.id === existingActive.id,
//           );
//           if (sessionIndex !== -1) {
//             db.data!.sessions[sessionIndex] = {
//               ...existingActive,
//               completedAt: new Date().toISOString(),
//               isSuccess: false,
//             };
//           }
//         }

//         const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//         const now = new Date().toISOString();

//         const newSession: Session = {
//           id: sessionId,
//           userId,
//           moduleId,
//           moduleName,
//           startedAt: now,
//           lastActiveAt: now,
//           currentStep: "quiz",

//           // Initialize quiz state
//           quizState: {
//             currentQuestionIndex: 0,
//             answers: [],
//             isCompleted: false,
//             score: 0,
//             totalQuestions: 0,
//           },

//           // Initialize practice state
//           practiceState: {
//             parameterChanges: [],
//             currentParameters: {
//               rate: 60,
//               aOutput: 5,
//               vOutput: 5,
//               aSensitivity: 2,
//               vSensitivity: 2,
//             },
//             timeSpentInPractice: 0,
//           },

//           // Initialize metrics
//           totalTimeSpent: 0,
//           hintsUsed: 0,
//           errorsCount: 0,
//           actions: [],
//         };

//         // Add to database
//         db.data!.sessions.push(newSession);
//         db.write();

//         // Update state
//         setCurrentSession(newSession);
//         setSessionHistory((prev) => [...prev, newSession]);

//         console.log("✅ Session started successfully:", sessionId);
//         return sessionId;
//       } catch (error) {
//         console.error("❌ Error starting session:", error);
//         return null;
//       }
//     },
//     [userId],
//   );

//   const updateSession = useCallback(
//     (sessionId: string, updates: Partial<Session>) => {
//       if (!userId) return;

//       // Debounce rapid updates to prevent cascading re-renders
//       const updateKey = `${sessionId}-${JSON.stringify(updates)}`;
//       if (lastUpdateRef.current === updateKey) {
//         console.log("🔄 Skipping duplicate update");
//         return;
//       }
//       lastUpdateRef.current = updateKey;

//       // Clear any pending updates
//       if (updateTimeoutRef.current) {
//         clearTimeout(updateTimeoutRef.current);
//       }

//       // Batch the update
//       updateTimeoutRef.current = setTimeout(() => {
//         try {
//           console.log("💾 Updating session:", sessionId, Object.keys(updates));
//           db.read();

//           const sessionIndex = db.data!.sessions.findIndex(
//             (s) => s.id === sessionId,
//           );
//           if (sessionIndex === -1) {
//             console.warn("⚠️  Session not found for update:", sessionId);
//             return;
//           }

//           // Merge updates with existing session
//           const existingSession = db.data!.sessions[sessionIndex];
//           const updatedSession = {
//             ...existingSession,
//             ...updates,
//             lastActiveAt: new Date().toISOString(),
//             // Prevent overwriting nested objects completely
//             quizState: updates.quizState
//               ? { ...existingSession.quizState, ...updates.quizState }
//               : existingSession.quizState,
//             practiceState: updates.practiceState
//               ? { ...existingSession.practiceState, ...updates.practiceState }
//               : existingSession.practiceState,
//           };

//           // Update database
//           db.data!.sessions[sessionIndex] = updatedSession;
//           db.write();

//           // Update state ONLY if this is the current session
//           if (currentSession?.id === sessionId) {
//             setCurrentSession(updatedSession);
//           }

//           // Update session history
//           setSessionHistory((prev) =>
//             prev.map((s) => (s.id === sessionId ? updatedSession : s)),
//           );

//           console.log("✅ Session updated successfully");
//         } catch (error) {
//           console.error("❌ Error updating session:", error);
//         }
//       }, 100); // 100ms debounce
//     },
//     [userId, currentSession?.id],
//   ); // Only depend on userId and current session ID

//   const endSession = useCallback(
//     (
//       sessionId: string,
//       isSuccess: boolean,
//       finalScore: number,
//       totalQuestions: number,
//     ) => {
//       if (!userId) {
//         console.warn("Cannot end session: no userId");
//         return;
//       }

//       try {
//         console.log("🏁 Ending session:", sessionId, { isSuccess, finalScore });

//         // Clear any pending updates first
//         if (updateTimeoutRef.current) {
//           clearTimeout(updateTimeoutRef.current);
//           updateTimeoutRef.current = null;
//         }

//         db.read();

//         const sessionIndex = db.data!.sessions.findIndex(
//           (s) => s.id === sessionId,
//         );
//         if (sessionIndex === -1) {
//           console.warn("⚠️  Session not found for ending:", sessionId);
//           return;
//         }

//         const session = db.data!.sessions[sessionIndex];
//         const now = new Date().toISOString();
//         const startTime = new Date(session.startedAt).getTime();
//         const totalTime = Math.floor((Date.now() - startTime) / 1000);

//         // Complete the session
//         const completedSession: Session = {
//           ...session,
//           completedAt: now,
//           lastActiveAt: now,
//           isSuccess,
//           currentStep: "completed",
//           totalTimeSpent: totalTime,
//           quizState: {
//             ...session.quizState,
//             score: finalScore,
//             totalQuestions,
//             isCompleted: true,
//           },
//         };

//         // Update database
//         db.data!.sessions[sessionIndex] = completedSession;

//         // Update module progress
//         const existingProgress = db.data!.moduleProgress.find(
//           (p) => p.userId === userId && p.moduleId === session.moduleId,
//         );

//         if (existingProgress) {
//           existingProgress.attempts += 1;
//           existingProgress.lastAttempt = now;
//           if (isSuccess) {
//             existingProgress.status = "completed";
//             existingProgress.bestScore = Math.max(
//               existingProgress.bestScore,
//               finalScore,
//             );
//           }
//         } else {
//           db.data!.moduleProgress.push({
//             userId,
//             moduleId: session.moduleId,
//             status: isSuccess ? "completed" : "in_progress",
//             bestScore: isSuccess ? finalScore : 0,
//             attempts: 1,
//             lastAttempt: now,
//           });
//         }

//         db.write();

//         // Update state - CRITICAL: Clear current session to prevent further updates
//         setCurrentSession(null);
//         setSessionHistory((prev) =>
//           prev.map((s) => (s.id === sessionId ? completedSession : s)),
//         );

//         console.log("✅ Session ended successfully");
//       } catch (error) {
//         console.error("❌ Error ending session:", error);
//       }
//     },
//     [userId],
//   );

//   const resumeSession = useCallback(
//     (sessionId: string) => {
//       if (!userId) return;

//       try {
//         console.log("▶️  Resuming session:", sessionId);
//         db.read();

//         const session = db.data!.sessions.find(
//           (s) => s.id === sessionId && s.userId === userId,
//         );
//         if (!session) {
//           console.warn("⚠️  Session not found for resume:", sessionId);
//           return;
//         }

//         // Update last active time and ensure it's not marked as completed
//         const updatedSession = {
//           ...session,
//           lastActiveAt: new Date().toISOString(),
//           completedAt: undefined, // Ensure it's not marked as completed
//           isSuccess: undefined, // Clear success flag
//         };

//         const sessionIndex = db.data!.sessions.findIndex(
//           (s) => s.id === sessionId,
//         );
//         db.data!.sessions[sessionIndex] = updatedSession;
//         db.write();

//         setCurrentSession(updatedSession);
//         console.log("✅ Session resumed successfully:", {
//           id: sessionId,
//           currentStep: updatedSession.currentStep,
//           quizAnswers: updatedSession.quizState?.answers?.length || 0,
//         });
//       } catch (error) {
//         console.error("❌ Error resuming session:", error);
//       }
//     },
//     [userId],
//   );

//   const getIncompleteSession = useCallback(
//     (moduleId: string): Session | null => {
//       if (!userId) return null;

//       try {
//         console.log(
//           "🔍 Searching for incomplete sessions for module:",
//           moduleId,
//           "user:",
//           userId,
//         );

//         // Read fresh data from database
//         db.read();
//         const allSessions = db.data?.sessions || [];

//         // Find incomplete sessions for this user and module
//         const incompleteSessions = allSessions.filter(
//           (s) =>
//             s.userId === userId &&
//             s.moduleId === moduleId &&
//             !s.completedAt && // Not completed
//             !s.isSuccess, // Not marked as successful
//         );

//         console.log("📋 Found incomplete sessions:", incompleteSessions.length);

//         if (incompleteSessions.length > 0) {
//           // Return the most recent incomplete session
//           const mostRecent = incompleteSessions.sort(
//             (a, b) =>
//               new Date(b.lastActiveAt).getTime() -
//               new Date(a.lastActiveAt).getTime(),
//           )[0];

//           console.log("✅ Returning most recent incomplete session:", {
//             id: mostRecent.id,
//             currentStep: mostRecent.currentStep,
//             quizCompleted: mostRecent.quizState?.isCompleted,
//             lastActive: mostRecent.lastActiveAt,
//           });

//           return mostRecent;
//         }

//         console.log("❌ No incomplete sessions found");
//         return null;
//       } catch (error) {
//         console.error("❌ Error getting incomplete session:", error);
//         return null;
//       }
//     },
//     [userId],
//   );

//   const addQuizAnswer = useCallback(
//     (
//       sessionId: string,
//       questionIndex: number,
//       selectedAnswer: number,
//       isCorrect: boolean,
//     ) => {
//       if (!userId || !currentSession) return;

//       console.log("📝 Adding quiz answer:", {
//         questionIndex,
//         selectedAnswer,
//         isCorrect,
//       });

//       const answer = {
//         questionIndex,
//         selectedAnswer,
//         isCorrect,
//         timestamp: new Date().toISOString(),
//       };

//       // Use a more targeted update to prevent cascading
//       updateSession(sessionId, {
//         quizState: {
//           currentQuestionIndex: questionIndex,
//           answers: [...(currentSession.quizState?.answers || []), answer],
//           isCompleted: currentSession.quizState?.isCompleted ?? false,
//           score: currentSession.quizState?.score ?? 0,
//           totalQuestions: currentSession.quizState?.totalQuestions ?? 0,
//         },
//       });
//     },
//     [userId, currentSession, updateSession],
//   );

//   const addParameterChange = useCallback(
//     (
//       sessionId: string,
//       parameter: string,
//       oldValue: number,
//       newValue: number,
//       reason?: string,
//     ) => {
//       if (!userId || !currentSession) return;

//       const parameterChange = {
//         timestamp: new Date().toISOString(),
//         parameter,
//         oldValue,
//         newValue,
//         reason,
//       };

//       updateSession(sessionId, {
//         practiceState: {
//           ...currentSession.practiceState,
//           parameterChanges: [
//             ...currentSession.practiceState.parameterChanges,
//             parameterChange,
//           ],
//           currentParameters: {
//             ...currentSession.practiceState.currentParameters,
//             [parameter]: newValue,
//           },
//         },
//       });
//     },
//     [userId, currentSession, updateSession],
//   );

//   const incrementHints = useCallback(
//     (sessionId: string) => {
//       if (!currentSession) return;

//       updateSession(sessionId, {
//         hintsUsed: (currentSession.hintsUsed || 0) + 1,
//       });
//     },
//     [currentSession, updateSession],
//   );

//   const incrementErrors = useCallback(
//     (sessionId: string) => {
//       if (!currentSession) return;

//       updateSession(sessionId, {
//         errorsCount: (currentSession.errorsCount || 0) + 1,
//       });
//     },
//     [currentSession, updateSession],
//   );

//   const getSessionStats = useCallback(() => {
//     if (!userId) return null;

//     const userSessions = sessionHistory.filter((s) => s.completedAt);
//     const completedSessions = userSessions.filter((s) => s.isSuccess);

//     return {
//       totalSessions: userSessions.length,
//       completedSessions: completedSessions.length,
//       completionRate:
//         userSessions.length > 0
//           ? (completedSessions.length / userSessions.length) * 100
//           : 0,
//       averageScore:
//         completedSessions.length > 0
//           ? completedSessions.reduce(
//               (sum, s) => sum + (s.quizState?.score || 0),
//               0,
//             ) / completedSessions.length
//           : 0,
//       totalTimeSpent: userSessions.reduce(
//         (sum, s) => sum + (s.totalTimeSpent || 0),
//         0,
//       ),
//       averageParameterChanges:
//         userSessions.length > 0
//           ? userSessions.reduce(
//               (sum, s) =>
//                 sum + (s.practiceState?.parameterChanges?.length || 0),
//               0,
//             ) / userSessions.length
//           : 0,
//     };
//   }, [userId, sessionHistory]);

//   const getModuleProgress = useCallback(
//     (moduleId: string) => {
//       if (!userId) return null;

//       try {
//         db.read();
//         return (
//           db.data?.moduleProgress?.find(
//             (p) => p.userId === userId && p.moduleId === moduleId,
//           ) || null
//         );
//       } catch (error) {
//         console.error("Error getting module progress:", error);
//         return null;
//       }
//     },
//     [userId],
//   );

//   const exportSessionData = useCallback(() => {
//     if (!userId) return null;

//     return {
//       userId,
//       sessions: sessionHistory,
//       stats: getSessionStats(),
//       moduleProgress:
//         db.data?.moduleProgress?.filter((p) => p.userId === userId) || [],
//       exportedAt: new Date().toISOString(),
//     };
//   }, [userId, sessionHistory, getSessionStats]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (updateTimeoutRef.current) {
//         clearTimeout(updateTimeoutRef.current);
//       }
//     };
//   }, []);

//   return {
//     // Core session management
//     currentSession,
//     sessionHistory,
//     isLoading,
//     startSession,
//     endSession,
//     updateSession,
//     resumeSession,
//     getIncompleteSession,

//     // Quiz functionality
//     addQuizAnswer,

//     // Practice functionality
//     addParameterChange,

//     // Analytics
//     incrementHints,
//     incrementErrors,
//     getSessionStats,
//     getModuleProgress,

//     // Data export
//     exportSessionData,
//   };
// };







//june 30 attempt to stop module cross contamination


import { useState, useEffect, useCallback, useRef } from 'react';
import db from '../lib/db';
import type { Session, QuizState, PracticeState } from '../lib/db';

interface UseSessionReturn {
  currentSession: Session | null;
  sessionHistory: Session[];
  startSession: (moduleId: string, moduleName: string) => string;
  endSession: (sessionId: string, isSuccess: boolean, score: number, totalQuestions: number) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  getIncompleteSession: (moduleId: string) => Session | null;
  resumeSession: (sessionId: string) => void;
}

export const useSession = (userId?: string): UseSessionReturn => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  
  // Use refs to prevent stale closure issues
  const userIdRef = useRef(userId);
  const currentSessionRef = useRef<Session | null>(null);
  
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  // Load session history on mount and when userId changes
  useEffect(() => {
    if (!userId) {
      setSessionHistory([]);
      setCurrentSession(null);
      return;
    }

    db.read();
    const userSessions = db.data?.sessions?.filter(s => s.userId === userId) || [];
    setSessionHistory(userSessions);
    
    // Check for any incomplete session - but don't auto-resume
    const incomplete = userSessions.find(s => !s.completedAt);
    if (incomplete && !currentSession) {
      console.log('Found incomplete session for user, but not auto-resuming:', incomplete.id);
    }
  }, [userId]);

  const createDefaultQuizState = (): QuizState => ({
    currentQuestionIndex: 0,
    answers: [],
    isCompleted: false,
    score: 0,
    totalQuestions: 0,
  });

  const createDefaultPracticeState = (): PracticeState => ({
    parameterChanges: [],
    currentParameters: {
      rate: 60,
      aOutput: 5,
      vOutput: 5,
      aSensitivity: 2,
      vSensitivity: 2,
    },
    timeSpentInPractice: 0,
  });

  const startSession = useCallback((moduleId: string, moduleName: string): string => {
    if (!userIdRef.current) {
      throw new Error('No user logged in');
    }

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newSession: Session = {
      id: sessionId,
      userId: userIdRef.current,
      moduleId,
      moduleName,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      currentStep: 'quiz',
      quizState: createDefaultQuizState(),
      practiceState: createDefaultPracticeState(),
      totalTimeSpent: 0,
      hintsUsed: 0,
      errorsCount: 0,
      actions: [],
    };

    console.log(`🎯 Starting NEW session for Module ${moduleId}:`, sessionId);

    // End any existing incomplete session for this user (different module)
    if (currentSessionRef.current && !currentSessionRef.current.completedAt) {
      console.log(`⚠️ Force-ending previous incomplete session: ${currentSessionRef.current.id}`);
      endSession(currentSessionRef.current.id, false, 0, 0);
    }

    // Save to database
    db.read();
    db.data!.sessions.push(newSession);
    db.write();

    // Update state
    setCurrentSession(newSession);
    setSessionHistory(prev => [...prev, newSession]);

    return sessionId;
  }, []);

  const endSession = useCallback((sessionId: string, isSuccess: boolean, score: number, totalQuestions: number) => {
    console.log(`🏁 Ending session ${sessionId} - Success: ${isSuccess}`);

    const endTime = new Date().toISOString();

    db.read();
    const sessionIndex = db.data!.sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      console.error('Session not found:', sessionId);
      return;
    }

    const session = db.data!.sessions[sessionIndex];
    const startTime = new Date(session.startedAt).getTime();
    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    // Update session
    db.data!.sessions[sessionIndex] = {
      ...session,
      completedAt: endTime,
      isSuccess,
      totalTimeSpent: totalTime,
    };

    // Update module progress
    const existingProgress = db.data!.moduleProgress.find(
      p => p.userId === session.userId && p.moduleId === session.moduleId
    );

    if (existingProgress) {
      existingProgress.status = isSuccess ? 'completed' : existingProgress.status;
      existingProgress.attempts += 1;
      existingProgress.lastAttempt = endTime;
      if (isSuccess && score > existingProgress.bestScore) {
        existingProgress.bestScore = score;
      }
    } else {
      db.data!.moduleProgress.push({
        userId: session.userId,
        moduleId: session.moduleId,
        status: isSuccess ? 'completed' : 'in_progress',
        bestScore: isSuccess ? score : 0,
        attempts: 1,
        lastAttempt: endTime,
      });
    }

    db.write();

    // Clear current session if it's the one being ended
    if (currentSessionRef.current?.id === sessionId) {
      setCurrentSession(null);
    }

    // Refresh session history
    const updatedSessions = db.data!.sessions.filter(s => s.userId === userIdRef.current);
    setSessionHistory(updatedSessions);
  }, []);

  const updateSession = useCallback((sessionId: string, updates: Partial<Session>) => {
    if (!sessionId) {
      console.error('No session ID provided for update');
      return;
    }

    db.read();
    const sessionIndex = db.data!.sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      console.error('Session not found for update:', sessionId);
      return;
    }

    // Update in database
    db.data!.sessions[sessionIndex] = {
      ...db.data!.sessions[sessionIndex],
      ...updates,
      lastActiveAt: new Date().toISOString(),
    };

    db.write();

    // Update local state if it's the current session
    if (currentSessionRef.current?.id === sessionId) {
      setCurrentSession(db.data!.sessions[sessionIndex]);
    }
  }, []);

  const getIncompleteSession = useCallback((moduleId: string): Session | null => {
    if (!userIdRef.current) return null;

    db.read();
    const incompleteSessions = db.data?.sessions?.filter(s => 
      s.userId === userIdRef.current && 
      s.moduleId === moduleId && 
      !s.completedAt
    ) || [];

    // Return the most recent incomplete session for this specific module
    if (incompleteSessions.length > 0) {
      return incompleteSessions.sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )[0];
    }

    return null;
  }, []);

  const resumeSession = useCallback((sessionId: string) => {
    console.log(`🔄 Resuming session: ${sessionId}`);

    db.read();
    const session = db.data?.sessions?.find(s => s.id === sessionId);
    
    if (!session) {
      console.error('Session not found for resume:', sessionId);
      return;
    }

    if (session.userId !== userIdRef.current) {
      console.error('Session belongs to different user');
      return;
    }

    // End any other current session first
    if (currentSessionRef.current && currentSessionRef.current.id !== sessionId) {
      endSession(currentSessionRef.current.id, false, 0, 0);
    }

    setCurrentSession(session);
  }, [endSession]);

  return {
    currentSession,
    sessionHistory,
    startSession,
    endSession,
    updateSession,
    getIncompleteSession,
    resumeSession,
  };
};