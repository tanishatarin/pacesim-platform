// import { useState, useEffect, useCallback, useRef } from "react";
// import db from "../lib/db";
// import type { Session } from "../lib/db";
// import { useActiveTimeTracker } from './useActiveTimeTracker';

// export type PracticeState = {
//   parameterChanges: Array<{
//     timestamp: string;
//     parameter: string;
//     oldValue: number;
//     newValue: number;
//     reason?: string;
//   }>;
//   currentParameters: {
//     rate: number;
//     aOutput: number;
//     vOutput: number;
//     aSensitivity: number;
//     vSensitivity: number;
//   };
//   timeSpentInPractice: number;
  
//   activeTimeSpent: number; // Only time actively interacting
//   timeSegments: Array<{
//     startTime: string;
//     endTime?: string;
//     duration?: number;
//     activity: 'quiz' | 'practice' | 'reading';
//   }>;
  
//   stepProgress?: {
//     currentStepIndex: number;
//     completedSteps: string[];
//     allStepsCompleted: boolean;
//     lastUpdated: string;
//   };
// };

// export const useSession = (userId?: string) => {
//   const [currentSession, setCurrentSession] = useState<Session | null>(null);
//   const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Use refs to prevent unnecessary re-renders and track what we've loaded
//   const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastLoadedUserId = useRef<string | null>(null);

//   // Load user's session data on mount or when userId changes
//   useEffect(() => {
//     if (!userId) {
//       setIsLoading(false);
//       setCurrentSession(null);
//       setSessionHistory([]);
//       lastLoadedUserId.current = null;
//       return;
//     }

//     // Only reload if userId actually changed
//     if (lastLoadedUserId.current === userId) {
//       return;
//     }

//     try {
//       console.log("📚 Loading session data for user:", userId);
//       db.read();

//       // Get user's session history
//       const userSessions =
//         db.data?.sessions?.filter((s) => s.userId === userId) || [];
//       setSessionHistory(userSessions);

//       // Find any active session (be very specific about what's "active")
//       const activeSession = userSessions.find(
//         (s) => !s.completedAt && s.isSuccess !== true && s.isSuccess !== false, // Exclude explicitly failed sessions
//       );

//       if (activeSession) {
//         console.log("🔄 Found active session:", {
//           id: activeSession.id.slice(-8),
//           moduleId: activeSession.moduleId,
//           currentStep: activeSession.currentStep,
//           startedAt: activeSession.startedAt,
//         });
//         setCurrentSession(activeSession);
//       } else {
//         console.log("📭 No active sessions found for user");
//         setCurrentSession(null);
//       }

//       lastLoadedUserId.current = userId;
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

//         // End any existing active sessions
//         const existingActiveSessions =
//           db.data?.sessions?.filter(
//             (s) =>
//               s.userId === userId &&
//               !s.completedAt &&
//               s.isSuccess === undefined,
//           ) || [];

//         if (existingActiveSessions.length > 0) {
//           console.log(`🧹 Ending ${existingActiveSessions.length} existing active sessions`);
//           existingActiveSessions.forEach((session) => {
//             const sessionIndex = db.data!.sessions.findIndex(
//               (s) => s.id === session.id,
//             );
//             if (sessionIndex !== -1) {
//               db.data!.sessions[sessionIndex] = {
//                 ...session,
//                 completedAt: new Date().toISOString(),
//                 isSuccess: false,
//               };
//             }
//           });
//         }

//         const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//         const now = new Date().toISOString();

//         // Create completely fresh session with NEW active time tracking
//         const newSession: Session = {
//           id: sessionId,
//           userId,
//           moduleId,
//           moduleName,
//           startedAt: now,
//           lastActiveAt: now,
//           currentStep: "quiz",

//           quizState: {
//             currentQuestionIndex: 0,
//             answers: [],
//             isCompleted: false,
//             score: 0,
//             totalQuestions: 0,
//           },

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
            
//             // NEW ACTIVE TIME TRACKING FIELDS
//             activeTimeSpent: 0,
//             timeSegments: [],
            
//             stepProgress: {
//               currentStepIndex: 0,
//               completedSteps: [],
//               allStepsCompleted: false,
//               lastUpdated: new Date().toISOString(),
//             },
//           },

//           // Initialize metrics
//           totalTimeSpent: 0,
//           activeTimeSpent: 0, // NEW
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

//         console.log("✅ Fresh session started successfully:", {
//           id: sessionId.slice(-8),
//           moduleId,
//         });
//         return sessionId;
//       } catch (error) {
//         console.error("❌ Error starting session:", error);
//         return null;
//       }
//     },
//     [userId],
//   );

//   const lastActiveTimeUpdateRef = useRef<number>(0);

//   const updateActiveTime = useCallback(
//     (sessionId: string, activeSeconds: number, activity: 'quiz' | 'practice' | 'reading' = 'practice') => {
//       if (!userId || !currentSession || currentSession.id !== sessionId) return;

//       // 🔥 FIX: Much more conservative debouncing - only update every 10 seconds minimum
//       const now = Date.now();
//       const lastUpdate = lastActiveTimeUpdateRef.current || 0;
//       if (now - lastUpdate < 10000) {
//         console.log(`⏭️ Skipping update, too soon (${Math.round((now - lastUpdate)/1000)}s ago)`);
//         return;
//       }
//       lastActiveTimeUpdateRef.current = now;

//       try {
//         db.read();
//         const sessionIndex = db.data!.sessions.findIndex(s => s.id === sessionId);
//         if (sessionIndex === -1) return;

//         const session = db.data!.sessions[sessionIndex];
//         const timestamp = new Date().toISOString();

//         // 🔥 FIX: Only create new time segments when there's a significant change or activity switch
//         const timeDifference = activeSeconds - (session.activeTimeSpent || 0);
//         let newTimeSegments = [...(session.practiceState.timeSegments || [])];

//         // 🔥 FIX: Only add time segments for meaningful changes (at least 10 seconds)
//         if (timeDifference >= 10) {
//           // Check if we should update the last segment or create a new one
//           const lastSegment = newTimeSegments[newTimeSegments.length - 1];
          
//           if (lastSegment && !lastSegment.endTime && lastSegment.activity === activity) {
//             // 🔥 FIX: Update existing open segment instead of creating new one
//             lastSegment.duration = (lastSegment.duration || 0) + timeDifference;
//             console.log(`📝 Updated existing segment: +${timeDifference}s (total: ${lastSegment.duration}s)`);
//           } else {
//             // Close previous segment if open
//             if (lastSegment && !lastSegment.endTime) {
//               lastSegment.endTime = timestamp;
//             }
            
//             // Create new segment only if this is a significant time period
//             const newSegment = {
//               startTime: new Date(Date.now() - (timeDifference * 1000)).toISOString(),
//               endTime: timestamp,
//               duration: timeDifference,
//               activity
//             };
            
//             newTimeSegments.push(newSegment);
//             console.log(`🆕 Created new time segment: ${timeDifference}s (${activity})`);
//           }
//         } else {
//           console.log(`⏭️ Skipping time segment creation: only ${timeDifference}s difference`);
//         }

//         // 🔥 FIX: Limit total segments to prevent bloat
//         if (newTimeSegments.length > 20) {
//           console.log(`🧹 Consolidating time segments (had ${newTimeSegments.length})`);
//           // Keep only the most recent segments and consolidate older ones
//           const recentSegments = newTimeSegments.slice(-15);
//           const olderSegments = newTimeSegments.slice(0, -15);
//           const consolidatedDuration = olderSegments.reduce((sum, seg) => sum + (seg.duration || 0), 0);
          
//           if (consolidatedDuration > 0) {
//             recentSegments.unshift({
//               startTime: olderSegments[0].startTime,
//               endTime: olderSegments[olderSegments.length - 1].endTime || timestamp,
//               duration: consolidatedDuration,
//               activity: 'consolidated' as any
//             });
//           }
          
//           newTimeSegments = recentSegments;
//         }

//         const updatedSession = {
//           ...session,
//           lastActiveAt: timestamp,
//           activeTimeSpent: activeSeconds,
//           practiceState: {
//             ...session.practiceState,
//             activeTimeSpent: activeSeconds,
//             timeSegments: newTimeSegments,
//           },
//         };

//         db.data!.sessions[sessionIndex] = updatedSession;
//         db.write();

//         setCurrentSession(updatedSession);
//         setSessionHistory(prev => 
//           prev.map(s => s.id === sessionId ? updatedSession : s)
//         );

//         console.log(`⏱️ Updated active time: ${activeSeconds}s (${newTimeSegments.length} segments)`);
//       } catch (error) {
//         console.error("❌ Error updating active time:", error);
//       }
//     },
//     [userId, currentSession?.id]
//   );

//   // IMPROVED updateSession with better conflict resolution
//   const updateSession = useCallback(
//     (sessionId: string, updates: Partial<Session>) => {
//       if (!userId) return;

//       // Validate session belongs to current session
//       if (currentSession?.id !== sessionId) {
//         console.warn(
//           "⚠️ Attempted to update session that is not current:",
//           sessionId.slice(-8),
//         );
//         return;
//       }

//       // Clear any pending updates to avoid conflicts
//       if (updateTimeoutRef.current) {
//         clearTimeout(updateTimeoutRef.current);
//       }

//       // Immediate debounced update
//       updateTimeoutRef.current = setTimeout(() => {
//         try {
//           console.log(
//             "💾 Updating session:",
//             sessionId.slice(-8),
//             "with keys:",
//             Object.keys(updates),
//           );

//           db.read();

//           const sessionIndex = db.data!.sessions.findIndex(
//             (s) => s.id === sessionId,
//           );
//           if (sessionIndex === -1) {
//             console.warn(
//               "⚠️ Session not found for update:",
//               sessionId.slice(-8),
//             );
//             return;
//           }

//           const existingSession = db.data!.sessions[sessionIndex];

//           // Intelligent merging - preserve existing data while updating specific parts
//           const updatedSession = {
//             ...existingSession,
//             ...updates,
//             lastActiveAt: new Date().toISOString(),

//             // Careful merging of nested objects
//             quizState: updates.quizState
//               ? { ...existingSession.quizState, ...updates.quizState }
//               : existingSession.quizState,

//             practiceState: updates.practiceState
//               ? {
//                   ...existingSession.practiceState,
//                   ...updates.practiceState,
//                   // Special handling for stepProgress to prevent overwrites
//                   stepProgress: updates.practiceState.stepProgress
//                     ? {
//                         ...existingSession.practiceState.stepProgress,
//                         ...updates.practiceState.stepProgress,
//                         lastUpdated: new Date().toISOString(),
//                       }
//                     : existingSession.practiceState.stepProgress,
//                 }
//               : existingSession.practiceState,
//           };

//           // Update database
//           db.data!.sessions[sessionIndex] = updatedSession;
//           db.write();

//           // Update state
//           setCurrentSession(updatedSession);
//           setSessionHistory((prev) =>
//             prev.map((s) => (s.id === sessionId ? updatedSession : s)),
//           );

//           console.log("✅ Session updated successfully");
//         } catch (error) {
//           console.error("❌ Error updating session:", error);
//         }
//       }, 200); // Reduced debounce time for better responsiveness
//     },
//     [userId, currentSession?.id],
//   );

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
//         console.log("🏁 Ending session:", sessionId.slice(-8), {
//           isSuccess,
//           finalScore,
//           totalQuestions,
//         });

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
//           console.warn("⚠️ Session not found for ending:", sessionId.slice(-8));
//           return;
//         }

//         const session = db.data!.sessions[sessionIndex];
//         const now = new Date().toISOString();
        
//         // Calculate both total elapsed time AND active time
//         const startTime = new Date(session.startedAt).getTime();
//         const totalElapsedTime = Math.floor((Date.now() - startTime) / 1000);
//         const activeTime = session.activeTimeSpent || 0; // Use tracked active time

//         console.log("📊 Session timing:", {
//           totalElapsed: `${Math.floor(totalElapsedTime / 60)}m ${totalElapsedTime % 60}s`,
//           activeTime: `${Math.floor(activeTime / 60)}m ${activeTime % 60}s`,
//           efficiency: `${Math.round((activeTime / totalElapsedTime) * 100)}%`
//         });

//         const scorePercentage = totalQuestions > 0 
//           ? Math.round((finalScore / totalQuestions) * 100)
//           : 0;

//         // Complete the session with BOTH time measurements
//         const completedSession: Session = {
//           ...session,
//           completedAt: now,
//           lastActiveAt: now,
//           isSuccess,
//           currentStep: "completed",
//           totalTimeSpent: totalElapsedTime, // Keep for backwards compatibility
//           activeTimeSpent: activeTime, // NEW: Use the actively tracked time
//           quizState: {
//             ...session.quizState,
//             score: finalScore,
//             totalQuestions,
//             isCompleted: true,
//           },
//         };

//         // Update database
//         db.data!.sessions[sessionIndex] = completedSession;

//         // Update module progress - STORE PERCENTAGE as bestScore
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
//               scorePercentage,
//             );
//           }
//         } else {
//           db.data!.moduleProgress.push({
//             userId,
//             moduleId: session.moduleId,
//             status: isSuccess ? "completed" : "in_progress",
//             bestScore: isSuccess ? scorePercentage : 0,
//             attempts: 1,
//             lastAttempt: now,
//           });
//         }

//         db.write();

//         // Clear current session
//         setCurrentSession(null);
//         setSessionHistory((prev) =>
//           prev.map((s) => (s.id === sessionId ? completedSession : s)),
//         );

//         console.log("✅ Session ended successfully:", {
//           totalTime: `${Math.floor(totalElapsedTime / 60)}m`,
//           activeTime: `${Math.floor(activeTime / 60)}m`,
//           bestScore: scorePercentage
//         });
//       } catch (error) {
//         console.error("❌ Error ending session:", error);
//       }
//     },
//     [userId],
//   );

//   const resumeSession = useCallback(
//     (sessionId: string) => {
//       if (!userId) {
//         console.warn("❌ Cannot resume session: no userId");
//         return;
//       }

//       try {
//         console.log("▶️ Attempting to resume session:", sessionId.slice(-8));
//         db.read();

//         const session = db.data?.sessions?.find(
//           (s) => s.id === sessionId && s.userId === userId,
//         );

//         if (!session) {
//           console.warn("⚠️ Session not found for resume:", sessionId.slice(-8));
//           return;
//         }

//         // Validate this is not a completed session
//         if (session.completedAt) {
//           console.warn(
//             "⚠️ Cannot resume completed session:",
//             sessionId.slice(-8),
//           );
//           return;
//         }

//         console.log("✅ Found session to resume:", {
//           id: sessionId.slice(-8),
//           moduleId: session.moduleId,
//           currentStep: session.currentStep,
//           quizCompleted: session.quizState?.isCompleted,
//           parameterChanges:
//             session.practiceState?.parameterChanges?.length || 0,
//           stepProgress: session.practiceState?.stepProgress,
//           lastActive: session.lastActiveAt,
//         });

//         // End any other active sessions before resuming
//         const otherActiveSessions = db.data!.sessions.filter(
//           (s) => s.userId === userId && s.id !== sessionId && !s.completedAt,
//         );

//         if (otherActiveSessions.length > 0) {
//           console.log(
//             `🧹 Ending ${otherActiveSessions.length} other active session(s) before resuming`,
//           );
//           otherActiveSessions.forEach((otherSession) => {
//             const otherIndex = db.data!.sessions.findIndex(
//               (s) => s.id === otherSession.id,
//             );
//             if (otherIndex !== -1) {
//               db.data!.sessions[otherIndex] = {
//                 ...otherSession,
//                 completedAt: new Date().toISOString(),
//                 isSuccess: false,
//               };
//             }
//           });
//         }

//         // Update last active time
//         const updatedSession = {
//           ...session,
//           lastActiveAt: new Date().toISOString(),
//         };

//         const sessionIndex = db.data!.sessions.findIndex(
//           (s) => s.id === sessionId,
//         );
//         db.data!.sessions[sessionIndex] = updatedSession;
//         db.write();

//         // Set as current session
//         setCurrentSession(updatedSession);

//         console.log("✅ Session resumed successfully:", {
//           id: sessionId.slice(-8),
//           moduleId: updatedSession.moduleId,
//           currentStep: updatedSession.currentStep,
//           quizAnswers: updatedSession.quizState?.answers?.length || 0,
//           hasParameters: !!updatedSession.practiceState?.currentParameters,
//           stepProgress: updatedSession.practiceState?.stepProgress,
//         });
//       } catch (error) {
//         console.error("❌ Error resuming session:", error);
//       }
//     },
//     [userId],
//   );

//   const getIncompleteSession = useCallback(
//     (moduleId: string): Session | null => {
//       if (!userId) {
//         console.log("❌ No userId provided to getIncompleteSession");
//         return null;
//       }

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

//         console.log("📊 Total sessions in database:", allSessions.length);
//         console.log(
//           "📊 Sessions for this user:",
//           allSessions.filter((s) => s.userId === userId).length,
//         );

//         // STRICT criteria: incomplete sessions for THIS SPECIFIC MODULE only
//         const incompleteSessions = allSessions.filter((s) => {
//           const matches =
//             s.userId === userId &&
//             s.moduleId === moduleId && // Exact module match
//             !s.completedAt && // Not completed
//             s.isSuccess === undefined; // Not explicitly marked as success/failure

//           if (matches) {
//             console.log("✅ Found matching incomplete session:", {
//               id: s.id.slice(-8),
//               moduleId: s.moduleId,
//               startedAt: s.startedAt,
//               currentStep: s.currentStep,
//               stepProgress: s.practiceState?.stepProgress,
//             });
//           }

//           return matches;
//         });

//         console.log(
//           "📋 Found",
//           incompleteSessions.length,
//           "incomplete sessions for module",
//           moduleId,
//         );

//         if (incompleteSessions.length > 1) {
//           console.warn(
//             "⚠️ Multiple incomplete sessions found for same module! This shouldn't happen.",
//           );

//           // Keep most recent, end others
//           const sorted = incompleteSessions.sort(
//             (a, b) =>
//               new Date(b.lastActiveAt || b.startedAt).getTime() -
//               new Date(a.lastActiveAt || a.startedAt).getTime(),
//           );

//           const toKeep = sorted[0];
//           const toEnd = sorted.slice(1);

//           console.log(
//             "🧹 Cleaning up",
//             toEnd.length,
//             "duplicate sessions, keeping:",
//             toKeep.id.slice(-8),
//           );

//           toEnd.forEach((session) => {
//             const sessionIndex = allSessions.findIndex(
//               (s) => s.id === session.id,
//             );
//             if (sessionIndex !== -1) {
//               allSessions[sessionIndex] = {
//                 ...session,
//                 completedAt: new Date().toISOString(),
//                 isSuccess: false,
//               };
//             }
//           });

//           db.write();
//           return toKeep;
//         }

//         if (incompleteSessions.length === 1) {
//           const session = incompleteSessions[0];
//           console.log("✅ Returning incomplete session:", {
//             id: session.id.slice(-8),
//             moduleId: session.moduleId,
//             currentStep: session.currentStep,
//             quizCompleted: session.quizState?.isCompleted,
//             lastActive: session.lastActiveAt,
//             parameterChanges:
//               session.practiceState?.parameterChanges?.length || 0,
//             stepProgress: session.practiceState?.stepProgress,
//           });
//           return session;
//         }

//         console.log("❌ No incomplete sessions found for module", moduleId);
//         return null;
//       } catch (error) {
//         console.error("❌ Error getting incomplete session:", error);
//         return null;
//       }
//     },
//     [userId],
//   );

//   const endSessionForNavigation = useCallback(() => {
//     if (currentSession && !currentSession.completedAt) {
//       console.log(
//         "🚪 NAVIGATION CLEANUP - Ending current session due to navigation away",
//       );
//       console.log("Session details:", {
//         id: currentSession.id.slice(-8),
//         moduleId: currentSession.moduleId,
//         currentStep: currentSession.currentStep,
//         timeSpent: currentSession.totalTimeSpent || 0,
//         quizCompleted: currentSession.quizState?.isCompleted,
//         hasProgress:
//           (currentSession.practiceState?.parameterChanges?.length || 0) > 0,
//       });

//       // ❌ THIS IS LIKELY THE PROBLEM - It's ending sessions on navigation
//       endSession(currentSession.id, false, 0, 0);
//     } else {
//       console.log("🚪 Navigation cleanup called but no active session to end");
//     }
//   }, [currentSession, endSession]);

//   const updateStepProgress = useCallback(
//     (
//       sessionId: string,
//       stepProgress: {
//         currentStepIndex: number;
//         completedSteps: string[];
//         allStepsCompleted: boolean;
//       },
//     ) => {
//       if (!userId || !currentSession || currentSession.id !== sessionId) return;

//       console.log("📝 Updating step progress in session:", stepProgress);

//       try {
//         db.read();
//         const sessionIndex = db.data!.sessions.findIndex(
//           (s) => s.id === sessionId,
//         );

//         if (sessionIndex === -1) {
//           console.warn(
//             "⚠️ Session not found for step progress update:",
//             sessionId.slice(-8),
//           );
//           return;
//         }

//         const session = db.data!.sessions[sessionIndex];
//         const updatedSession = {
//           ...session,
//           lastActiveAt: new Date().toISOString(),
//           practiceState: {
//             ...session.practiceState,
//             stepProgress: {
//               ...stepProgress,
//               lastUpdated: new Date().toISOString(),
//             },
//           },
//         };

//         db.data!.sessions[sessionIndex] = updatedSession;
//         db.write();

//         // Update state immediately
//         setCurrentSession(updatedSession);
//         setSessionHistory((prev) =>
//           prev.map((s) => (s.id === sessionId ? updatedSession : s)),
//         );

//         console.log("✅ Step progress updated successfully");
//       } catch (error) {
//         console.error("❌ Error updating step progress:", error);
//       }
//     },
//     [userId, currentSession?.id],
//   );

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
//     updateStepProgress,
//     endSessionForNavigation,
//     updateActiveTime,

//     // Analytics helpers (basic implementations)
//     getSessionStats: () => ({ totalSessions: sessionHistory.length }),
//     getModuleProgress: (moduleId: string) => {
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
//     exportSessionData: () => ({ userId, sessions: sessionHistory }),
//   };
// };









import { useState, useEffect, useCallback, useRef } from "react";
import db from "../lib/db";
import type { Session } from "../lib/db";
import { useActiveTimeTracker } from './useActiveTimeTracker';

export type PracticeState = {
  parameterChanges: Array<{
    timestamp: string;
    parameter: string;
    oldValue: number;
    newValue: number;
    reason?: string;
  }>;
  currentParameters: {
    rate: number;
    aOutput: number;
    vOutput: number;
    aSensitivity: number;
    vSensitivity: number;
  };
  timeSpentInPractice: number;
  
  activeTimeSpent: number;
  timeSegments: Array<{
    startTime: string;
    endTime?: string;
    duration?: number;
    activity: 'quiz' | 'practice' | 'reading';
  }>;
  
  stepProgress?: {
    currentStepIndex: number;
    completedSteps: string[];
    allStepsCompleted: boolean;
    lastUpdated: string;
  };
};

export const useSession = (userId?: string) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadedUserId = useRef<string | null>(null);
  const lastActiveTimeUpdateRef = useRef<number>(0);

  // 🔥 FIX: Add restoration state tracking
  const [isRestoring, setIsRestoring] = useState(false);
  const restorationCompleteRef = useRef<boolean>(false);

  // Load user's session data on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setCurrentSession(null);
      setSessionHistory([]);
      lastLoadedUserId.current = null;
      restorationCompleteRef.current = false;
      return;
    }

    if (lastLoadedUserId.current === userId) {
      return;
    }

    try {
      console.log("📚 Loading session data for user:", userId);
      db.read();

      const userSessions = db.data?.sessions?.filter((s) => s.userId === userId) || [];
      setSessionHistory(userSessions);

      const activeSession = userSessions.find(
        (s) => !s.completedAt && s.isSuccess !== true && s.isSuccess !== false,
      );

      if (activeSession) {
        console.log("🔄 Found active session:", {
          id: activeSession.id.slice(-8),
          moduleId: activeSession.moduleId,
          currentStep: activeSession.currentStep,
          stepProgress: activeSession.practiceState?.stepProgress,
          parameters: activeSession.practiceState?.currentParameters,
        });
        setCurrentSession(activeSession);
        // 🔥 FIX: Mark that we need to restore this session
        setIsRestoring(true);
      } else {
        console.log("📭 No active sessions found for user");
        setCurrentSession(null);
        setIsRestoring(false);
      }

      lastLoadedUserId.current = userId;
      restorationCompleteRef.current = false;
    } catch (error) {
      console.error("Error loading session data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const startSession = useCallback(
    (moduleId: string, moduleName: string): string | null => {
      if (!userId) {
        console.warn("Cannot start session: no userId");
        return null;
      }

      try {
        console.log("🚀 Starting new session for module:", moduleId);
        
        // 🔥 FIX: Clear restoration state when starting fresh
        setIsRestoring(false);
        restorationCompleteRef.current = false;

        db.read();

        // End any existing active sessions
        const existingActiveSessions = db.data?.sessions?.filter(
          (s) => s.userId === userId && !s.completedAt && s.isSuccess === undefined,
        ) || [];

        if (existingActiveSessions.length > 0) {
          console.log(`🧹 Ending ${existingActiveSessions.length} existing active sessions`);
          existingActiveSessions.forEach((session) => {
            const sessionIndex = db.data!.sessions.findIndex((s) => s.id === session.id);
            if (sessionIndex !== -1) {
              db.data!.sessions[sessionIndex] = {
                ...session,
                completedAt: new Date().toISOString(),
                isSuccess: false,
              };
            }
          });
        }

        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        const newSession: Session = {
          id: sessionId,
          userId,
          moduleId,
          moduleName,
          startedAt: now,
          lastActiveAt: now,
          currentStep: "quiz",

          quizState: {
            currentQuestionIndex: 0,
            answers: [],
            isCompleted: false,
            score: 0,
            totalQuestions: 0,
          },

          practiceState: {
            parameterChanges: [],
            currentParameters: {
              rate: 60,
              aOutput: 5,
              vOutput: 5,
              aSensitivity: 2,
              vSensitivity: 2,
            },
            timeSpentInPractice: 0,
            activeTimeSpent: 0,
            timeSegments: [],
            stepProgress: {
              currentStepIndex: 0,
              completedSteps: [],
              allStepsCompleted: false,
              lastUpdated: new Date().toISOString(),
            },
          },

          totalTimeSpent: 0,
          activeTimeSpent: 0,
          hintsUsed: 0,
          errorsCount: 0,
          actions: [],
        };

        db.data!.sessions.push(newSession);
        db.write();

        setCurrentSession(newSession);
        setSessionHistory((prev) => [...prev, newSession]);

        console.log("✅ Fresh session started successfully:", {
          id: sessionId.slice(-8),
          moduleId,
        });
        return sessionId;
      } catch (error) {
        console.error("❌ Error starting session:", error);
        return null;
      }
    },
    [userId],
  );

  const updateActiveTime = useCallback(
    (sessionId: string, activeSeconds: number, activity: 'quiz' | 'practice' | 'reading' = 'practice') => {
      if (!userId || !currentSession || currentSession.id !== sessionId) return;

      const now = Date.now();
      const lastUpdate = lastActiveTimeUpdateRef.current || 0;
      if (now - lastUpdate < 10000) {
        return;
      }
      lastActiveTimeUpdateRef.current = now;

      try {
        db.read();
        const sessionIndex = db.data!.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) return;

        const session = db.data!.sessions[sessionIndex];
        const timestamp = new Date().toISOString();

        const timeDifference = activeSeconds - (session.activeTimeSpent || 0);
        let newTimeSegments = [...(session.practiceState.timeSegments || [])];

        if (timeDifference >= 10) {
          const lastSegment = newTimeSegments[newTimeSegments.length - 1];
          
          if (lastSegment && !lastSegment.endTime && lastSegment.activity === activity) {
            lastSegment.duration = (lastSegment.duration || 0) + timeDifference;
          } else {
            if (lastSegment && !lastSegment.endTime) {
              lastSegment.endTime = timestamp;
            }
            
            const newSegment = {
              startTime: new Date(Date.now() - (timeDifference * 1000)).toISOString(),
              endTime: timestamp,
              duration: timeDifference,
              activity
            };
            
            newTimeSegments.push(newSegment);
          }
        }

        if (newTimeSegments.length > 20) {
          const recentSegments = newTimeSegments.slice(-15);
          const olderSegments = newTimeSegments.slice(0, -15);
          const consolidatedDuration = olderSegments.reduce((sum, seg) => sum + (seg.duration || 0), 0);
          
          if (consolidatedDuration > 0) {
            recentSegments.unshift({
              startTime: olderSegments[0].startTime,
              endTime: olderSegments[olderSegments.length - 1].endTime || timestamp,
              duration: consolidatedDuration,
              activity: 'consolidated' as any
            });
          }
          
          newTimeSegments = recentSegments;
        }

        const updatedSession = {
          ...session,
          lastActiveAt: timestamp,
          activeTimeSpent: activeSeconds,
          practiceState: {
            ...session.practiceState,
            activeTimeSpent: activeSeconds,
            timeSegments: newTimeSegments,
          },
        };

        db.data!.sessions[sessionIndex] = updatedSession;
        db.write();

        setCurrentSession(updatedSession);
        setSessionHistory(prev => 
          prev.map(s => s.id === sessionId ? updatedSession : s)
        );
      } catch (error) {
        console.error("❌ Error updating active time:", error);
      }
    },
    [userId, currentSession?.id]
  );

  // 🔥 FIX: Improved updateSession with better restoration handling
  const updateSession = useCallback(
    (sessionId: string, updates: Partial<Session>) => {
      if (!userId) return;

      if (currentSession?.id !== sessionId) {
        console.warn("⚠️ Attempted to update session that is not current:", sessionId.slice(-8));
        return;
      }

      // 🔥 FIX: Don't allow updates during restoration to prevent conflicts
      if (isRestoring && !restorationCompleteRef.current) {
        console.log("🔄 Skipping update during session restoration");
        return;
      }

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        try {
          console.log("💾 Updating session:", sessionId.slice(-8), "with keys:", Object.keys(updates));

          db.read();
          const sessionIndex = db.data!.sessions.findIndex((s) => s.id === sessionId);
          if (sessionIndex === -1) {
            console.warn("⚠️ Session not found for update:", sessionId.slice(-8));
            return;
          }

          const existingSession = db.data!.sessions[sessionIndex];

          // 🔥 FIX: Preserve critical state during updates
          const updatedSession = {
            ...existingSession,
            ...updates,
            lastActiveAt: new Date().toISOString(),

            quizState: updates.quizState
              ? { ...existingSession.quizState, ...updates.quizState }
              : existingSession.quizState,

            practiceState: updates.practiceState
              ? {
                  ...existingSession.practiceState,
                  ...updates.practiceState,
                  // 🔥 FIX: Protect step progress from being overwritten
                  stepProgress: updates.practiceState.stepProgress
                    ? {
                        ...existingSession.practiceState.stepProgress,
                        ...updates.practiceState.stepProgress,
                        lastUpdated: new Date().toISOString(),
                      }
                    : existingSession.practiceState.stepProgress,
                  // 🔥 FIX: Protect current parameters from being overwritten during restoration
                  currentParameters: isRestoring && !restorationCompleteRef.current
                    ? existingSession.practiceState.currentParameters
                    : updates.practiceState.currentParameters || existingSession.practiceState.currentParameters,
                }
              : existingSession.practiceState,
          };

          db.data!.sessions[sessionIndex] = updatedSession;
          db.write();

          setCurrentSession(updatedSession);
          setSessionHistory((prev) =>
            prev.map((s) => (s.id === sessionId ? updatedSession : s)),
          );

          console.log("✅ Session updated successfully");
        } catch (error) {
          console.error("❌ Error updating session:", error);
        }
      }, 200);
    },
    [userId, currentSession?.id, isRestoring],
  );

  const endSession = useCallback(
    (sessionId: string, isSuccess: boolean, finalScore: number, totalQuestions: number) => {
      if (!userId) {
        console.warn("Cannot end session: no userId");
        return;
      }

      try {
        console.log("🏁 Ending session:", sessionId.slice(-8), { isSuccess, finalScore, totalQuestions });

        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
          updateTimeoutRef.current = null;
        }

        // 🔥 FIX: Clear restoration state when ending session
        setIsRestoring(false);
        restorationCompleteRef.current = false;

        db.read();
        const sessionIndex = db.data!.sessions.findIndex((s) => s.id === sessionId);
        if (sessionIndex === -1) {
          console.warn("⚠️ Session not found for ending:", sessionId.slice(-8));
          return;
        }

        const session = db.data!.sessions[sessionIndex];
        const now = new Date().toISOString();
        
        const startTime = new Date(session.startedAt).getTime();
        const totalElapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const activeTime = session.activeTimeSpent || 0;

        const scorePercentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;

        const completedSession: Session = {
          ...session,
          completedAt: now,
          lastActiveAt: now,
          isSuccess,
          currentStep: "completed",
          totalTimeSpent: totalElapsedTime,
          activeTimeSpent: activeTime,
          quizState: {
            ...session.quizState,
            score: finalScore,
            totalQuestions,
            isCompleted: true,
          },
        };

        db.data!.sessions[sessionIndex] = completedSession;

        const existingProgress = db.data!.moduleProgress.find(
          (p) => p.userId === userId && p.moduleId === session.moduleId,
        );

        if (existingProgress) {
          existingProgress.attempts += 1;
          existingProgress.lastAttempt = now;
          if (isSuccess) {
            existingProgress.status = "completed";
            existingProgress.bestScore = Math.max(existingProgress.bestScore, scorePercentage);
          }
        } else {
          db.data!.moduleProgress.push({
            userId,
            moduleId: session.moduleId,
            status: isSuccess ? "completed" : "in_progress",
            bestScore: isSuccess ? scorePercentage : 0,
            attempts: 1,
            lastAttempt: now,
          });
        }

        db.write();

        setCurrentSession(null);
        setSessionHistory((prev) =>
          prev.map((s) => (s.id === sessionId ? completedSession : s)),
        );

        console.log("✅ Session ended successfully");
      } catch (error) {
        console.error("❌ Error ending session:", error);
      }
    },
    [userId],
  );

  const resumeSession = useCallback(
    (sessionId: string) => {
      if (!userId) {
        console.warn("❌ Cannot resume session: no userId");
        return;
      }

      try {
        console.log("▶️ Attempting to resume session:", sessionId.slice(-8));
        
        // 🔥 FIX: Set restoration state
        setIsRestoring(true);
        restorationCompleteRef.current = false;

        db.read();
        const session = db.data?.sessions?.find(
          (s) => s.id === sessionId && s.userId === userId,
        );

        if (!session) {
          console.warn("⚠️ Session not found for resume:", sessionId.slice(-8));
          setIsRestoring(false);
          return;
        }

        if (session.completedAt) {
          console.warn("⚠️ Cannot resume completed session:", sessionId.slice(-8));
          setIsRestoring(false);
          return;
        }

        console.log("✅ Found session to resume:", {
          id: sessionId.slice(-8),
          moduleId: session.moduleId,
          currentStep: session.currentStep,
          stepProgress: session.practiceState?.stepProgress,
          parameters: session.practiceState?.currentParameters,
        });

        // End other active sessions
        const otherActiveSessions = db.data!.sessions.filter(
          (s) => s.userId === userId && s.id !== sessionId && !s.completedAt,
        );

        if (otherActiveSessions.length > 0) {
          console.log(`🧹 Ending ${otherActiveSessions.length} other active session(s)`);
          otherActiveSessions.forEach((otherSession) => {
            const otherIndex = db.data!.sessions.findIndex((s) => s.id === otherSession.id);
            if (otherIndex !== -1) {
              db.data!.sessions[otherIndex] = {
                ...otherSession,
                completedAt: new Date().toISOString(),
                isSuccess: false,
              };
            }
          });
        }

        const updatedSession = {
          ...session,
          lastActiveAt: new Date().toISOString(),
        };

        const sessionIndex = db.data!.sessions.findIndex((s) => s.id === sessionId);
        db.data!.sessions[sessionIndex] = updatedSession;
        db.write();

        setCurrentSession(updatedSession);

        // 🔥 FIX: Mark restoration as complete after session is set
        setTimeout(() => {
          restorationCompleteRef.current = true;
          setIsRestoring(false);
          console.log("✅ Session restoration completed");
        }, 100);

        console.log("✅ Session resumed successfully");
      } catch (error) {
        console.error("❌ Error resuming session:", error);
        setIsRestoring(false);
      }
    },
    [userId],
  );

  const getIncompleteSession = useCallback(
    (moduleId: string): Session | null => {
      if (!userId) {
        console.log("❌ No userId provided to getIncompleteSession");
        return null;
      }

      try {
        console.log("🔍 Searching for incomplete sessions for module:", moduleId, "user:", userId);

        db.read();
        const allSessions = db.data?.sessions || [];

        const incompleteSessions = allSessions.filter((s) => {
          const matches =
            s.userId === userId &&
            s.moduleId === moduleId &&
            !s.completedAt &&
            s.isSuccess === undefined;

          if (matches) {
            console.log("✅ Found matching incomplete session:", {
              id: s.id.slice(-8),
              moduleId: s.moduleId,
              stepProgress: s.practiceState?.stepProgress,
              parameters: s.practiceState?.currentParameters,
            });
          }

          return matches;
        });

        if (incompleteSessions.length > 1) {
          console.warn("⚠️ Multiple incomplete sessions found for same module!");
          const sorted = incompleteSessions.sort(
            (a, b) => new Date(b.lastActiveAt || b.startedAt).getTime() - new Date(a.lastActiveAt || a.startedAt).getTime(),
          );

          const toKeep = sorted[0];
          const toEnd = sorted.slice(1);

          toEnd.forEach((session) => {
            const sessionIndex = allSessions.findIndex((s) => s.id === session.id);
            if (sessionIndex !== -1) {
              allSessions[sessionIndex] = {
                ...session,
                completedAt: new Date().toISOString(),
                isSuccess: false,
              };
            }
          });

          db.write();
          return toKeep;
        }

        if (incompleteSessions.length === 1) {
          const session = incompleteSessions[0];
          console.log("✅ Returning incomplete session:", {
            id: session.id.slice(-8),
            stepProgress: session.practiceState?.stepProgress,
          });
          return session;
        }

        console.log("❌ No incomplete sessions found for module", moduleId);
        return null;
      } catch (error) {
        console.error("❌ Error getting incomplete session:", error);
        return null;
      }
    },
    [userId],
  );

  const updateStepProgress = useCallback(
    (sessionId: string, stepProgress: {
      currentStepIndex: number;
      completedSteps: string[];
      allStepsCompleted: boolean;
    }) => {
      if (!userId || !currentSession || currentSession.id !== sessionId) return;

      // 🔥 FIX: Don't update during restoration
      if (isRestoring && !restorationCompleteRef.current) {
        console.log("🔄 Skipping step progress update during restoration");
        return;
      }

      console.log("📝 Updating step progress in session:", stepProgress);

      try {
        db.read();
        const sessionIndex = db.data!.sessions.findIndex((s) => s.id === sessionId);

        if (sessionIndex === -1) {
          console.warn("⚠️ Session not found for step progress update:", sessionId.slice(-8));
          return;
        }

        const session = db.data!.sessions[sessionIndex];
        const updatedSession = {
          ...session,
          lastActiveAt: new Date().toISOString(),
          practiceState: {
            ...session.practiceState,
            stepProgress: {
              ...stepProgress,
              lastUpdated: new Date().toISOString(),
            },
          },
        };

        db.data!.sessions[sessionIndex] = updatedSession;
        db.write();

        setCurrentSession(updatedSession);
        setSessionHistory((prev) =>
          prev.map((s) => (s.id === sessionId ? updatedSession : s)),
        );

        console.log("✅ Step progress updated successfully");
      } catch (error) {
        console.error("❌ Error updating step progress:", error);
      }
    },
    [userId, currentSession?.id, isRestoring],
  );

  const endSessionForNavigation = useCallback(() => {
    if (currentSession && !currentSession.completedAt) {
      console.log("🚪 NAVIGATION CLEANUP - Ending current session due to navigation away");
      endSession(currentSession.id, false, 0, 0);
    }
  }, [currentSession, endSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentSession,
    sessionHistory,
    isLoading,
    isRestoring, // 🔥 FIX: Expose restoration state
    startSession,
    endSession,
    updateSession,
    resumeSession,
    getIncompleteSession,
    updateStepProgress,
    endSessionForNavigation,
    updateActiveTime,

    getSessionStats: () => ({ totalSessions: sessionHistory.length }),
    getModuleProgress: (moduleId: string) => {
      try {
        db.read();
        return (
          db.data?.moduleProgress?.find(
            (p) => p.userId === userId && p.moduleId === moduleId,
          ) || null
        );
      } catch (error) {
        console.error("Error getting module progress:", error);
        return null;
      }
    },
    exportSessionData: () => ({ userId, sessions: sessionHistory }),
  };
};