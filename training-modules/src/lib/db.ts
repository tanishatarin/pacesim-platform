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
  totalTimeSpent: number;
  hintsUsed: number;
  errorsCount: number;
  actions: any[]; // Keep for backward compatibility
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

export default db;