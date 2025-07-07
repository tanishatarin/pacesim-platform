import { useState, useEffect, useCallback, useRef } from "react";
import db from "../lib/db";
import type { Session } from "../lib/db";

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

  // Use refs to prevent unnecessary re-renders and track what we've loaded
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadedUserId = useRef<string | null>(null);

  // Load user's session data on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setCurrentSession(null);
      setSessionHistory([]);
      lastLoadedUserId.current = null;
      return;
    }

    // Only reload if userId actually changed
    if (lastLoadedUserId.current === userId) {
      return;
    }

    try {
      console.log("📚 Loading session data for user:", userId);
      db.read();

      // Get user's session history
      const userSessions =
        db.data?.sessions?.filter((s) => s.userId === userId) || [];
      setSessionHistory(userSessions);

      // Find any active session (be very specific about what's "active")
      const activeSession = userSessions.find(
        (s) => !s.completedAt && s.isSuccess !== true && s.isSuccess !== false, // Exclude explicitly failed sessions
      );

      if (activeSession) {
        console.log("🔄 Found active session:", {
          id: activeSession.id.slice(-8),
          moduleId: activeSession.moduleId,
          currentStep: activeSession.currentStep,
          startedAt: activeSession.startedAt,
        });
        setCurrentSession(activeSession);
      } else {
        console.log("📭 No active sessions found for user");
        setCurrentSession(null);
      }

      lastLoadedUserId.current = userId;
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

        db.read();

        // IMPORTANT: End any existing active sessions for ANY module
        const existingActiveSessions =
          db.data?.sessions?.filter(
            (s) =>
              s.userId === userId &&
              !s.completedAt &&
              s.isSuccess === undefined,
          ) || [];

        if (existingActiveSessions.length > 0) {
          console.log(
            `🧹 Ending ${existingActiveSessions.length} existing active sessions`,
          );
          existingActiveSessions.forEach((session) => {
            const sessionIndex = db.data!.sessions.findIndex(
              (s) => s.id === session.id,
            );
            if (sessionIndex !== -1) {
              db.data!.sessions[sessionIndex] = {
                ...session,
                completedAt: new Date().toISOString(),
                isSuccess: false, // Mark as failed since it wasn't completed
              };
            }
          });
        }

        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        // Create completely fresh session with NO inherited state
        const newSession: Session = {
          id: sessionId,
          userId,
          moduleId,
          moduleName,
          startedAt: now,
          lastActiveAt: now,
          currentStep: "quiz",

          // FRESH quiz state
          quizState: {
            currentQuestionIndex: 0,
            answers: [],
            isCompleted: false,
            score: 0,
            totalQuestions: 0,
          },

          // FRESH practice state
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
            stepProgress: {
              currentStepIndex: 0,
              completedSteps: [],
              allStepsCompleted: false,
              lastUpdated: new Date().toISOString(),
            },
          },

          // Initialize metrics
          totalTimeSpent: 0,
          hintsUsed: 0,
          errorsCount: 0,
          actions: [],
        };

        // Add to database
        db.data!.sessions.push(newSession);
        db.write();

        // Update state
        setCurrentSession(newSession);
        setSessionHistory((prev) => [...prev, newSession]);

        console.log("✅ Fresh session started successfully:", {
          id: sessionId.slice(-8),
          moduleId,
          stepProgress: newSession.practiceState.stepProgress,
        });
        return sessionId;
      } catch (error) {
        console.error("❌ Error starting session:", error);
        return null;
      }
    },
    [userId],
  );

  // IMPROVED updateSession with better conflict resolution
  const updateSession = useCallback(
    (sessionId: string, updates: Partial<Session>) => {
      if (!userId) return;

      // Validate session belongs to current session
      if (currentSession?.id !== sessionId) {
        console.warn(
          "⚠️ Attempted to update session that is not current:",
          sessionId.slice(-8),
        );
        return;
      }

      // Clear any pending updates to avoid conflicts
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Immediate debounced update
      updateTimeoutRef.current = setTimeout(() => {
        try {
          console.log(
            "💾 Updating session:",
            sessionId.slice(-8),
            "with keys:",
            Object.keys(updates),
          );

          db.read();

          const sessionIndex = db.data!.sessions.findIndex(
            (s) => s.id === sessionId,
          );
          if (sessionIndex === -1) {
            console.warn(
              "⚠️ Session not found for update:",
              sessionId.slice(-8),
            );
            return;
          }

          const existingSession = db.data!.sessions[sessionIndex];

          // Intelligent merging - preserve existing data while updating specific parts
          const updatedSession = {
            ...existingSession,
            ...updates,
            lastActiveAt: new Date().toISOString(),

            // Careful merging of nested objects
            quizState: updates.quizState
              ? { ...existingSession.quizState, ...updates.quizState }
              : existingSession.quizState,

            practiceState: updates.practiceState
              ? {
                  ...existingSession.practiceState,
                  ...updates.practiceState,
                  // Special handling for stepProgress to prevent overwrites
                  stepProgress: updates.practiceState.stepProgress
                    ? {
                        ...existingSession.practiceState.stepProgress,
                        ...updates.practiceState.stepProgress,
                        lastUpdated: new Date().toISOString(),
                      }
                    : existingSession.practiceState.stepProgress,
                }
              : existingSession.practiceState,
          };

          // Update database
          db.data!.sessions[sessionIndex] = updatedSession;
          db.write();

          // Update state
          setCurrentSession(updatedSession);
          setSessionHistory((prev) =>
            prev.map((s) => (s.id === sessionId ? updatedSession : s)),
          );

          console.log("✅ Session updated successfully");
        } catch (error) {
          console.error("❌ Error updating session:", error);
        }
      }, 200); // Reduced debounce time for better responsiveness
    },
    [userId, currentSession?.id],
  );

  const endSession = useCallback(
    (
      sessionId: string,
      isSuccess: boolean,
      finalScore: number,
      totalQuestions: number,
    ) => {
      if (!userId) {
        console.warn("Cannot end session: no userId");
        return;
      }

      try {
        console.log("🏁 Ending session:", sessionId.slice(-8), {
          isSuccess,
          finalScore,
          totalQuestions,
        });

        // Clear any pending updates first
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
          updateTimeoutRef.current = null;
        }

        db.read();

        const sessionIndex = db.data!.sessions.findIndex(
          (s) => s.id === sessionId,
        );
        if (sessionIndex === -1) {
          console.warn("⚠️ Session not found for ending:", sessionId.slice(-8));
          return;
        }

        const session = db.data!.sessions[sessionIndex];
        const now = new Date().toISOString();
        const startTime = new Date(session.startedAt).getTime();
        const totalTime = Math.floor((Date.now() - startTime) / 1000);

        // 🔥 CALCULATE PERCENTAGE HERE - this is the key fix!
        const scorePercentage = totalQuestions > 0 
          ? Math.round((finalScore / totalQuestions) * 100)
          : 0;

        console.log("📊 Score calculation:", {
          finalScore,      // Raw score (e.g., 2)
          totalQuestions,  // Total questions (e.g., 3)
          scorePercentage, // Calculated percentage (e.g., 67)
        });

        // Complete the session
        const completedSession: Session = {
          ...session,
          completedAt: now,
          lastActiveAt: now,
          isSuccess,
          currentStep: "completed",
          totalTimeSpent: totalTime,
          quizState: {
            ...session.quizState,
            score: finalScore,       // Store raw score in session
            totalQuestions,
            isCompleted: true,
          },
        };

        // Update database
        db.data!.sessions[sessionIndex] = completedSession;

        // Update module progress - STORE PERCENTAGE as bestScore
        const existingProgress = db.data!.moduleProgress.find(
          (p) => p.userId === userId && p.moduleId === session.moduleId,
        );

        if (existingProgress) {
          existingProgress.attempts += 1;
          existingProgress.lastAttempt = now;
          if (isSuccess) {
            existingProgress.status = "completed";
            existingProgress.bestScore = Math.max(
              existingProgress.bestScore,
              scorePercentage,  // Changed from finalScore to scorePercentage
            );
          }
        } else {
          db.data!.moduleProgress.push({
            userId,
            moduleId: session.moduleId,
            status: isSuccess ? "completed" : "in_progress",
            // 🔥 KEY FIX: Store PERCENTAGE, not raw score
            bestScore: isSuccess ? scorePercentage : 0,  // Changed from finalScore to scorePercentage
            attempts: 1,
            lastAttempt: now,
          });
        }

        db.write();

        // Clear current session
        setCurrentSession(null);
        setSessionHistory((prev) =>
          prev.map((s) => (s.id === sessionId ? completedSession : s)),
        );

        console.log("✅ Session ended successfully with bestScore:", scorePercentage);
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
        db.read();

        const session = db.data?.sessions?.find(
          (s) => s.id === sessionId && s.userId === userId,
        );

        if (!session) {
          console.warn("⚠️ Session not found for resume:", sessionId.slice(-8));
          return;
        }

        // Validate this is not a completed session
        if (session.completedAt) {
          console.warn(
            "⚠️ Cannot resume completed session:",
            sessionId.slice(-8),
          );
          return;
        }

        console.log("✅ Found session to resume:", {
          id: sessionId.slice(-8),
          moduleId: session.moduleId,
          currentStep: session.currentStep,
          quizCompleted: session.quizState?.isCompleted,
          parameterChanges:
            session.practiceState?.parameterChanges?.length || 0,
          stepProgress: session.practiceState?.stepProgress,
          lastActive: session.lastActiveAt,
        });

        // End any other active sessions before resuming
        const otherActiveSessions = db.data!.sessions.filter(
          (s) => s.userId === userId && s.id !== sessionId && !s.completedAt,
        );

        if (otherActiveSessions.length > 0) {
          console.log(
            `🧹 Ending ${otherActiveSessions.length} other active session(s) before resuming`,
          );
          otherActiveSessions.forEach((otherSession) => {
            const otherIndex = db.data!.sessions.findIndex(
              (s) => s.id === otherSession.id,
            );
            if (otherIndex !== -1) {
              db.data!.sessions[otherIndex] = {
                ...otherSession,
                completedAt: new Date().toISOString(),
                isSuccess: false,
              };
            }
          });
        }

        // Update last active time
        const updatedSession = {
          ...session,
          lastActiveAt: new Date().toISOString(),
        };

        const sessionIndex = db.data!.sessions.findIndex(
          (s) => s.id === sessionId,
        );
        db.data!.sessions[sessionIndex] = updatedSession;
        db.write();

        // Set as current session
        setCurrentSession(updatedSession);

        console.log("✅ Session resumed successfully:", {
          id: sessionId.slice(-8),
          moduleId: updatedSession.moduleId,
          currentStep: updatedSession.currentStep,
          quizAnswers: updatedSession.quizState?.answers?.length || 0,
          hasParameters: !!updatedSession.practiceState?.currentParameters,
          stepProgress: updatedSession.practiceState?.stepProgress,
        });
      } catch (error) {
        console.error("❌ Error resuming session:", error);
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
        console.log(
          "🔍 Searching for incomplete sessions for module:",
          moduleId,
          "user:",
          userId,
        );

        // Read fresh data from database
        db.read();
        const allSessions = db.data?.sessions || [];

        console.log("📊 Total sessions in database:", allSessions.length);
        console.log(
          "📊 Sessions for this user:",
          allSessions.filter((s) => s.userId === userId).length,
        );

        // STRICT criteria: incomplete sessions for THIS SPECIFIC MODULE only
        const incompleteSessions = allSessions.filter((s) => {
          const matches =
            s.userId === userId &&
            s.moduleId === moduleId && // Exact module match
            !s.completedAt && // Not completed
            s.isSuccess === undefined; // Not explicitly marked as success/failure

          if (matches) {
            console.log("✅ Found matching incomplete session:", {
              id: s.id.slice(-8),
              moduleId: s.moduleId,
              startedAt: s.startedAt,
              currentStep: s.currentStep,
              stepProgress: s.practiceState?.stepProgress,
            });
          }

          return matches;
        });

        console.log(
          "📋 Found",
          incompleteSessions.length,
          "incomplete sessions for module",
          moduleId,
        );

        if (incompleteSessions.length > 1) {
          console.warn(
            "⚠️ Multiple incomplete sessions found for same module! This shouldn't happen.",
          );

          // Keep most recent, end others
          const sorted = incompleteSessions.sort(
            (a, b) =>
              new Date(b.lastActiveAt || b.startedAt).getTime() -
              new Date(a.lastActiveAt || a.startedAt).getTime(),
          );

          const toKeep = sorted[0];
          const toEnd = sorted.slice(1);

          console.log(
            "🧹 Cleaning up",
            toEnd.length,
            "duplicate sessions, keeping:",
            toKeep.id.slice(-8),
          );

          toEnd.forEach((session) => {
            const sessionIndex = allSessions.findIndex(
              (s) => s.id === session.id,
            );
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
            moduleId: session.moduleId,
            currentStep: session.currentStep,
            quizCompleted: session.quizState?.isCompleted,
            lastActive: session.lastActiveAt,
            parameterChanges:
              session.practiceState?.parameterChanges?.length || 0,
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

  const endSessionForNavigation = useCallback(() => {
    if (currentSession && !currentSession.completedAt) {
      console.log(
        "🚪 NAVIGATION CLEANUP - Ending current session due to navigation away",
      );
      console.log("Session details:", {
        id: currentSession.id.slice(-8),
        moduleId: currentSession.moduleId,
        currentStep: currentSession.currentStep,
        timeSpent: currentSession.totalTimeSpent || 0,
        quizCompleted: currentSession.quizState?.isCompleted,
        hasProgress:
          (currentSession.practiceState?.parameterChanges?.length || 0) > 0,
      });

      // ❌ THIS IS LIKELY THE PROBLEM - It's ending sessions on navigation
      endSession(currentSession.id, false, 0, 0);
    } else {
      console.log("🚪 Navigation cleanup called but no active session to end");
    }
  }, [currentSession, endSession]);

  const updateStepProgress = useCallback(
    (
      sessionId: string,
      stepProgress: {
        currentStepIndex: number;
        completedSteps: string[];
        allStepsCompleted: boolean;
      },
    ) => {
      if (!userId || !currentSession || currentSession.id !== sessionId) return;

      console.log("📝 Updating step progress in session:", stepProgress);

      try {
        db.read();
        const sessionIndex = db.data!.sessions.findIndex(
          (s) => s.id === sessionId,
        );

        if (sessionIndex === -1) {
          console.warn(
            "⚠️ Session not found for step progress update:",
            sessionId.slice(-8),
          );
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

        // Update state immediately
        setCurrentSession(updatedSession);
        setSessionHistory((prev) =>
          prev.map((s) => (s.id === sessionId ? updatedSession : s)),
        );

        console.log("✅ Step progress updated successfully");
      } catch (error) {
        console.error("❌ Error updating step progress:", error);
      }
    },
    [userId, currentSession?.id],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Core session management
    currentSession,
    sessionHistory,
    isLoading,
    startSession,
    endSession,
    updateSession,
    resumeSession,
    getIncompleteSession,
    updateStepProgress,
    endSessionForNavigation,

    // Analytics helpers (basic implementations)
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
