import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlayCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Award,
  RotateCcw,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSession } from "../hooks/useSession";
import db from "../lib/db";
import type { ModuleProgress, Session } from "../lib/db";

interface ModuleData {
  id: number;
  title: string;
  description: string;
  estimatedDuration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  learningObjectives: string[];
}

interface ModuleStats {
  progress?: ModuleProgress;
  lastSession?: Session;
  fastestTime?: number;
  averageScore?: number;
  totalAttempts: number;
  recentActivity?: string;
  totalTime: number;
  successRate: number;
}

const ModulesListPage = () => {
  const { currentUser } = useAuth();
  const { sessionHistory } = useSession(currentUser?.id);
  const [moduleStats, setModuleStats] = useState<{
    [key: number]: ModuleStats;
  }>({});
  const [showDescriptions, setShowDescriptions] = useState(false);

  const modules: ModuleData[] = [
    {
      id: 1,
      title: "Scenario 1",
      description:
        "Learn to diagnose and correct bradycardia with atrial pacing. Practice sensitivity testing and capture threshold procedures.",
      estimatedDuration: "< 5 min",
      difficulty: "Beginner",
      learningObjectives: [
        "Identify bradycardia on ECG",
        "Adjust pacing rate appropriately",
        "Set optimal sensitivity thresholds",
        "Understand atrial pacing modes",
      ],
    },
    {
      id: 2,
      title: "Scenario 2",
      description:
        "Handle A fib patient who develops bradycardia after rate control medications. Practice dual-chamber testing and VVI conversion.",
      estimatedDuration: "5 - 10 min",
      difficulty: "Intermediate",
      learningObjectives: [
        "Test both atrial and ventricular lead thresholds",
        "Understand when atrial pacing is inappropriate",
        "Convert from DDD testing to VVI therapy",
        "Manage medication-induced bradycardia",
      ],
    },
    {
      id: 3,
      title: "Scenario 3",
      description:
        "Manage complete heart block with ventricular pacing. Learn VVI mode setup and threshold testing procedures.",
      estimatedDuration: "< 5 min",
      difficulty: "Intermediate",
      learningObjectives: [
        "Recognize third degree AV block patterns",
        "Perform ventricular sensitivity testing",
        "Establish ventricular capture thresholds",
        "Understand ventricular pacing modes",
      ],
    }
  ];

  useEffect(() => {
    if (!currentUser?.id) return;

    console.log("🔍 ModulesList: Loading data for user:", currentUser.id);

    // Load module progress and calculate stats
    db.read();
    const userProgress =
      db.data?.moduleProgress?.filter((p) => p.userId === currentUser.id) || [];
    const userSessions =
      db.data?.sessions?.filter((s) => s.userId === currentUser.id) || [];

    console.log("📊 ModulesList: Found progress:", userProgress.length);
    console.log("📊 ModulesList: Found sessions:", userSessions.length);

    const stats: { [key: number]: ModuleStats } = {};

    modules.forEach((module) => {
      const moduleId = module.id;
      const progress = userProgress.find(
        (p) => p.moduleId === moduleId.toString(),
      );

      // Get ALL sessions for this module (including meaningful and empty ones)
      const allModuleSessions = userSessions.filter(
        (s) => s.moduleId === moduleId.toString(),
      );

      // Filter to meaningful sessions only for time/score calculations
      const meaningfulSessions = allModuleSessions.filter(
        (s) => s.totalTimeSpent && s.totalTimeSpent > 10, // At least 10 seconds
      );

      // Get completed sessions for this module
      const completedSessions = meaningfulSessions.filter(
        (s) => s.completedAt && s.isSuccess,
      );

      console.log(
        `📊 Module ${moduleId}: ${allModuleSessions.length} total, ${meaningfulSessions.length} meaningful, ${completedSessions.length} completed`,
      );

      // Calculate fastest time from completed sessions
      const fastestTime =
        completedSessions.length > 0
          ? Math.min(
              ...completedSessions
                .map((s) => s.totalTimeSpent || Infinity)
                .filter((t) => t !== Infinity && t > 0),
            )
          : undefined;

      // Calculate average quiz score from completed sessions with quiz data
      const sessionsWithQuiz = completedSessions.filter(
        (s) => s.quizState?.score !== undefined && s.quizState?.totalQuestions,
      );

      const averageScore =
        sessionsWithQuiz.length > 0
          ? sessionsWithQuiz.reduce(
              (sum, s) => {
                const percentage = (s.quizState!.score / s.quizState!.totalQuestions) * 100;
                return sum + percentage;
              },
              0,
            ) / sessionsWithQuiz.length
          : undefined;

      // Calculate total time spent on this module
      const totalTime = meaningfulSessions.reduce(
        (sum, s) => sum + (s.totalTimeSpent || 0),
        0,
      );

      // Calculate success rate
      const successRate =
        meaningfulSessions.length > 0
          ? (completedSessions.length / meaningfulSessions.length) * 100
          : 0;

      // Get most recent meaningful session
      const lastSession =
        meaningfulSessions.length > 0
          ? meaningfulSessions.sort(
              (a, b) =>
                new Date(b.startedAt).getTime() -
                new Date(a.startedAt).getTime(),
            )[0]
          : undefined;

      // Recent activity
      const recentActivity = lastSession
        ? new Date(lastSession.startedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : undefined;

      stats[moduleId] = {
        progress,
        lastSession,
        fastestTime: fastestTime !== Infinity ? fastestTime : undefined,
        averageScore,
        totalAttempts: meaningfulSessions.length, // Use meaningful sessions for attempt count
        recentActivity,
        totalTime,
        successRate,
      };
    });

    console.log("📊 ModulesList: Calculated stats:", stats);
    setModuleStats(stats);
  }, [currentUser?.id, sessionHistory]);

  const getStatusIcon = (moduleId: number) => {
    const stats = moduleStats[moduleId];
    const status = stats?.progress?.status;

    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <PlayCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (moduleId: number) => {
    const stats = moduleStats[moduleId];
    const status = stats?.progress?.status;
    const bestScore = stats?.progress?.bestScore;

    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed {bestScore ? `• ${bestScore}%` : ""}
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <PlayCircle className="w-3 h-3 mr-1" />
            Not Started
          </span>
        );
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      Beginner: "bg-blue-100 text-blue-800",
      Intermediate: "bg-orange-100 text-orange-800",
      Advanced: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty as keyof typeof colors]}`}
      >
        {difficulty}
      </span>
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getRecommendedNext = () => {
    // Find the next logical module to complete based on progress
    for (const module of modules) {
      const stats = moduleStats[module.id];
      if (!stats?.progress || stats.progress.status !== "completed") {
        return module;
      }
    }
    return null;
  };

  const recommendedNext = getRecommendedNext();
  const totalCompleted = Object.values(moduleStats).filter(
    (s) => s.progress?.status === "completed",
  ).length;
  const totalAttempts = Object.values(moduleStats).reduce(
    (sum, s) => sum + s.totalAttempts,
    0,
  );

  return (
    <div>
      {/* Header with Overall Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Training Modules</h2>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>
                {totalCompleted}/{modules.length} Completed
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>{totalAttempts} Total Attempts</span>
            </div>
            <button
              onClick={() => setShowDescriptions(!showDescriptions)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-xl border transition-colors shadow-sm ${
                showDescriptions
                  ? "bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200 hover:text-blue-900"
                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-900"
              }`}
              title={
                showDescriptions
                  ? "Hide scenario details"
                  : "Show scenario details"
              }
              type="button"
              tabIndex={0}
              style={{ boxShadow: "none" }}
            >
              {showDescriptions ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>{showDescriptions ? "Hide" : "Show"} Scenarios</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(totalCompleted / modules.length) * 100}%` }}
          />
        </div>

        {/* Recommended Next Module */}
        {recommendedNext && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-blue-900">Recommended Next</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-800">
                  {recommendedNext.title}
                </p>
                <p className="text-sm text-blue-600">
                  Estimated: {recommendedNext.estimatedDuration}
                </p>
              </div>
              <Link
                to={`/module/${recommendedNext.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Now
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modules Grid */}
      <div className="grid gap-6">
        {modules.map((module) => {
          const stats = moduleStats[module.id];
          const isCompleted = stats?.progress?.status === "completed";

          return (
            <Link
              key={module.id}
              to={`/module/${module.id}`}
              className="block bg-white shadow-lg rounded-3xl transition-all duration-200 hover:shadow-xl hover:scale-[1.01]"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex items-center h-7">
                      {getStatusIcon(module.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Module {module.id}: {module.title}
                        </h3>
                        {getDifficultyBadge(module.difficulty)}
                      </div>

                      {/* Conditional Description */}
                      {showDescriptions && (
                        <p className="text-sm text-gray-600 mb-3">
                          {module.description}
                        </p>
                      )}

                      {/* Learning Objectives - Only show if scenarios are enabled */}
                      {showDescriptions && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            {isCompleted
                              ? "What you learned:"
                              : "Learning objectives:"}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {module.learningObjectives.map((objective, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                              >
                                {objective}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Module Stats */}
                      {stats && stats.totalAttempts > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <RotateCcw className="w-3 h-3" />
                            <span>
                              {stats.totalAttempts} attempt
                              {stats.totalAttempts !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {stats.totalTime > 0 && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span>
                                Total: {formatDuration(stats.totalTime)}
                              </span>
                            </div>
                          )}
                          {stats.fastestTime && (
                            <div className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-green-500" />
                              <span>
                                Best: {formatDuration(stats.fastestTime)}
                              </span>
                            </div>
                          )}
                          {stats.averageScore && (
                            <div className="flex items-center space-x-1">
                              <Award className="w-3 h-3 text-yellow-500" />
                              <span>
                                Avg Quiz: {Math.round(stats.averageScore)}%
                              </span>
                            </div>
                          )}
                          {stats.successRate > 0 && (
                            <div className="flex items-center space-x-1">
                              <Target className="w-3 h-3 text-purple-500" />
                              <span>
                                Success: {Math.round(stats.successRate)}%
                              </span>
                            </div>
                          )}
                          {stats.recentActivity && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span>Last: {stats.recentActivity}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end space-y-2">
                    {getStatusBadge(module.id)}
                    <div className="text-xs text-gray-500 text-right">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{module.estimatedDuration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {totalCompleted}
            </div>
            <div className="text-sm text-gray-500">Modules Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {totalAttempts}
            </div>
            <div className="text-sm text-gray-500">Total Attempts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {totalCompleted > 0
                ? Math.round((totalCompleted / modules.length) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-gray-500">Progress</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {
                Object.values(moduleStats).filter(
                  (s) => s.progress?.status === "in_progress",
                ).length
              }
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesListPage;