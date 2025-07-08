import { LowSync } from "lowdb";
import { LocalStorage } from "lowdb/browser";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  lastLogin: string;
  role?: string;
  institution?: string;
};

export type QuizState = {
  currentQuestionIndex: number;
  answers: Array<{
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timestamp: string;
  }>;
  isCompleted: boolean;
  score: number;
  totalQuestions: number;
};

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
  
  // NEW: Active time tracking fields
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

export type Session = {
  id: string;
  userId: string;
  moduleId: string;
  moduleName: string;
  startedAt: string;
  completedAt?: string;
  lastActiveAt: string;
  isSuccess?: boolean;

  // Enhanced tracking
  currentStep: "quiz" | "practice" | "completed";

  // Quiz state persistence
  quizState: QuizState;

  // Practice session state
  practiceState: PracticeState;

  // Overall metrics
  totalTimeSpent: number; // Keep for backwards compatibility (total elapsed time)
  activeTimeSpent: number; // NEW: Only active interaction time
  hintsUsed: number;
  errorsCount: number;
  actions: any[];
};

export type ModuleProgress = {
  userId: string;
  moduleId: string;
  status: "not_started" | "in_progress" | "completed";
  bestScore: number;
  attempts: number;
  lastAttempt?: string;
};

type DBData = {
  users: User[];
  sessions: Session[];
  moduleProgress: ModuleProgress[];
};

const adapter = new LocalStorage<DBData>("pacesim");
const db = new LowSync(adapter, {
  users: [],
  sessions: [],
  moduleProgress: [],
});

// Initialize
db.read();
db.data ||= { users: [], sessions: [], moduleProgress: [] };

// Migration function to add new fields to existing sessions
export const migrateSessionData = () => {
  try {
    console.log('🔄 Starting session data migration...');
    db.read();
    
    let migrationCount = 0;
    
    if (db.data?.sessions) {
      db.data.sessions.forEach((session: any) => {
        let sessionUpdated = false;
        
        // Add missing activeTimeSpent field to session
        if (session.activeTimeSpent === undefined) {
          session.activeTimeSpent = 0;
          sessionUpdated = true;
        }
        
        // Add missing fields to practiceState
        if (session.practiceState) {
          if (!session.practiceState.timeSegments) {
            session.practiceState.timeSegments = [];
            sessionUpdated = true;
          }
          
          if (session.practiceState.activeTimeSpent === undefined) {
            session.practiceState.activeTimeSpent = 0;
            sessionUpdated = true;
          }
        }
        
        if (sessionUpdated) {
          migrationCount++;
        }
      });
      
      if (migrationCount > 0) {
        db.write();
        console.log(`✅ Migrated ${migrationCount} sessions to include active time tracking`);
      } else {
        console.log('✅ No sessions needed migration');
      }
    }
  } catch (error) {
    console.error('❌ Error migrating session data:', error);
  }
};

export default db;