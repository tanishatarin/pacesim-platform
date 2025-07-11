import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Zap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSession } from "../hooks/useSession";
import { useNavigate } from "react-router-dom";
import db from "../lib/db";
import type { Session, ModuleProgress, User as UserType } from "../lib/db";

interface ProfileStats {
  totalSessions: number;
  completedSessions: number;
  totalTimeSpent: number;
  averageScore: number;
  completionRate: number;
  streakDays: number;
  currentWeekTime: number;
  fastestCompletion?: number;
}

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { sessionHistory } = useSession(currentUser?.id);
  const navigate = useNavigate();

  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserType>>({});
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalSessions: 0,
    completedSessions: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    completionRate: 0,
    streakDays: 0,
    currentWeekTime: 0,
  });

  // Define the 3 real modules
  const REAL_MODULES = {
    "1": "Scenario 1: Bradycardia Management",
    "2": "Scenario 2: Third Degree Heart Block", 
    "3": "Scenario 3: Atrial Fibrillation with Bradycardia"
  };

  useEffect(() => {
    if (!currentUser?.id) return;

    console.log("🔍 Profile: Loading data for user:", currentUser.id);

    // Load module progress - filter for real modules only
    db.read();
    const userModuleProgress = (db.data?.moduleProgress?.filter(
      (p) => p.userId === currentUser.id && Object.keys(REAL_MODULES).includes(p.moduleId)
    ) || []);
    setModuleProgress(userModuleProgress);

    // Filter sessions for real modules only and meaningful sessions (with actual duration)
    const meaningfulSessions = sessionHistory.filter(
      (session) => 
        Object.keys(REAL_MODULES).includes(session.moduleId) && 
        session.totalTimeSpent && 
        session.totalTimeSpent > 10 // At least 10 seconds
    );

    console.log("📊 Profile: Total sessions:", sessionHistory.length);
    console.log("📊 Profile: Meaningful sessions for real modules:", meaningfulSessions.length);

    // Calculate comprehensive stats
    const completedSessions = meaningfulSessions.filter(
      (s) => s.completedAt && s.isSuccess,
    );

    const totalTimeSpent = meaningfulSessions.reduce(
      (sum, s) => sum + (s.totalTimeSpent || 0),
      0,
    );

    // Calculate average quiz score from sessions with quiz data
    const sessionsWithQuiz = meaningfulSessions.filter(
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
        : 0;

    const completionRate =
      meaningfulSessions.length > 0
        ? (completedSessions.length / meaningfulSessions.length) * 100
        : 0;

    // Calculate fastest completion
    const fastestCompletion =
      completedSessions.length > 0
        ? Math.min(
            ...completedSessions
              .map((s) => s.totalTimeSpent || Infinity)
              .filter((t) => t !== Infinity && t > 0),
          )
        : undefined;

    // Calculate current week time
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const currentWeekSessions = meaningfulSessions.filter(
      (s) => new Date(s.startedAt).getTime() > oneWeekAgo,
    );
    const currentWeekTime = currentWeekSessions.reduce(
      (sum, s) => sum + (s.totalTimeSpent || 0),
      0,
    );

    // Calculate streak days
    const streakDays = calculateStreakDays(meaningfulSessions);

    setProfileStats({
      totalSessions: meaningfulSessions.length,
      completedSessions: completedSessions.length,
      totalTimeSpent,
      averageScore,
      completionRate,
      streakDays,
      currentWeekTime,
      fastestCompletion:
        fastestCompletion !== Infinity ? fastestCompletion : undefined,
    });

    setEditedUser({
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      institution: currentUser.institution,
    });
  }, [currentUser?.id, sessionHistory]);

  const calculateStreakDays = (sessions: Session[]): number => {
    if (sessions.length === 0) return 0;

    const sessionDates = [
      ...new Set(sessions.map((s) => new Date(s.startedAt).toDateString())),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < sessionDates.length; i++) {
      const sessionDate = new Date(sessionDates[i]);
      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === streak) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const formatDuration = (seconds: number, includeSeconds = false) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (includeSeconds && seconds < 3600) {
      return `${minutes}m ${secs}s`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getModuleName = (moduleId: string) => {
    return REAL_MODULES[moduleId as keyof typeof REAL_MODULES] || `Module ${moduleId}`;
  };

  const handleSaveProfile = async () => {
    if (!currentUser?.id) return;

    try {
      db.read();
      const userIndex = db.data!.users.findIndex(
        (u) => u.id === currentUser.id,
      );
      if (userIndex !== -1) {
        db.data!.users[userIndex] = {
          ...db.data!.users[userIndex],
          ...editedUser,
        };
        db.write();
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleModuleClick = (moduleId: string, progress: ModuleProgress) => {
    navigate(`/module/${moduleId}`);
  };

  // Get fastest completion times for the 3 real modules
  const getFastestCompletions = () => {
    const moduleIds = Object.keys(REAL_MODULES);
    const fastestTimes: { [moduleId: string]: number } = {};

    sessionHistory.forEach((session) => {
      if (session.completedAt && session.isSuccess && session.totalTimeSpent && 
          Object.keys(REAL_MODULES).includes(session.moduleId)) {
        const moduleId = session.moduleId;
        if (
          !fastestTimes[moduleId] ||
          session.totalTimeSpent < fastestTimes[moduleId]
        ) {
          fastestTimes[moduleId] = session.totalTimeSpent;
        }
      }
    });

    return moduleIds.map((id) => ({
      moduleId: id,
      moduleName: getModuleName(id),
      time: fastestTimes[id]
        ? formatDuration(fastestTimes[id], true)
        : "Not completed",
    }));
  };

  const fastestCompletions = getFastestCompletions();

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Profile</h2>

      {/* User Info Card */}
      <div className="bg-white shadow-lg rounded-3xl mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editedUser.name || ""}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, name: e.target.value })
                        }
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded-md px-2 py-1 w-full"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                      Role/Title
                      </label>
                      <input
                      type="text"
                      value={editedUser.role || ""}
                      disabled
                      className="text-sm text-gray-400 bg-gray-100 border border-gray-200 rounded-md px-2 py-1 w-full cursor-not-allowed"
                      placeholder="e.g., Cardiac Nurse, Medical Student"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={editedUser.institution || ""}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            institution: e.target.value,
                          })
                        }
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded-md px-2 py-1 w-full"
                        placeholder="e.g., Johns Hopkins Hospital"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {currentUser.name}
                    </h3>
                    <p className="text-gray-600">
                      {currentUser.role || "Medical Professional"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentUser.institution || "Johns Hopkins Hospital"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    title="Save changes"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUser({
                        name: currentUser.name,
                        email: currentUser.email,
                        role: currentUser.role,
                        institution: currentUser.institution,
                      });
                    }}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    title="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                  title="Edit profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="w-4 h-4" />
              {isEditing ? (
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editedUser.email || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, email: e.target.value })
                    }
                    className="text-sm bg-gray-50 border border-gray-300 rounded-md px-2 py-1 w-full"
                    placeholder="your@email.com"
                  />
                </div>
              ) : (
                <span className="text-sm">{currentUser.email}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Joined {formatDate(currentUser.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Training Statistics */}
      <div className="bg-white shadow-lg rounded-3xl mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Training Statistics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {profileStats.completedSessions}
              </p>
              <p className="text-sm text-gray-500">Sessions Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(profileStats.totalTimeSpent)}
              </p>
              <p className="text-sm text-gray-500">Total Training Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(profileStats.averageScore)}%
              </p>
              <p className="text-sm text-gray-500">Average Quiz Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(profileStats.completionRate)}%
              </p>
              <p className="text-sm text-gray-500">Success Rate</p>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {profileStats.totalSessions}
              </p>
              <p className="text-sm text-gray-500">Total Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(profileStats.currentWeekTime)}
              </p>
              <p className="text-sm text-gray-500">This Week</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {profileStats.streakDays}
              </p>
              <p className="text-sm text-gray-500">Day Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {profileStats.fastestCompletion
                  ? formatDuration(profileStats.fastestCompletion, true)
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-500">Personal Best</p>
            </div>
          </div>

          {/* Fastest Completion Times - Now for 3 modules */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center mb-3">
              <Zap className="w-4 h-4 text-green-500 mr-2" />
              <h4 className="font-medium text-gray-900">
                Fastest Completion Times by Module
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fastestCompletions.map((module) => (
                <div
                  key={module.moduleId}
                  className="text-center p-3 bg-gray-50 rounded-lg"
                >
                  <p className="text-xs text-gray-500 mb-1">
                    Module {module.moduleId}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {module.time}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {module.moduleName.replace(/^Scenario \d+: /, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module Progress */}
      <div className="bg-white shadow-lg rounded-3xl mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Module Progress
            <span className="ml-2 text-sm text-gray-500">
              ({moduleProgress.length}/3 modules attempted)
            </span>
          </h3>

          {moduleProgress.length > 0 ? (
            <div className="space-y-3">
              {moduleProgress.map((progress) => (
                <div
                  key={progress.moduleId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleModuleClick(progress.moduleId, progress)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <Play className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getModuleName(progress.moduleId)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {progress.attempts} attempt
                        {progress.attempts !== 1 ? "s" : ""} • Best score:{" "}
                        {progress.bestScore}% • Last:{" "}
                        {progress.lastAttempt
                          ? formatDate(progress.lastAttempt)
                          : "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        progress.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : progress.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {progress.status === "completed"
                        ? "Completed"
                        : progress.status === "in_progress"
                          ? "Resume"
                          : "Start"}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Show modules not yet attempted */}
              {Object.keys(REAL_MODULES).filter(id => 
                !moduleProgress.some(p => p.moduleId === id)
              ).map((moduleId) => (
                <div
                  key={moduleId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate(`/module/${moduleId}`)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                      <Play className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getModuleName(moduleId)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Not started yet
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Start
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No module progress yet.</p>
              <p className="text-sm text-gray-400 mb-4">
                Start your first training session from the available modules:
              </p>
              <div className="space-y-2">
                {Object.entries(REAL_MODULES).map(([id, name]) => (
                  <button
                    key={id}
                    onClick={() => navigate(`/module/${id}`)}
                    className="block w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-blue-900">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Session History with Debugging Info */}
      <div className="bg-white shadow-lg rounded-3xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-500" />
              Training Session History (DEBUG MODE)
              <span className="ml-2 text-sm text-gray-500">
                ({sessionHistory.length} total sessions)
              </span>
            </h3>

            {sessionHistory.length > 15 && (
              <button
                onClick={() => setShowAllSessions(!showAllSessions)}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span>{showAllSessions ? "Show Recent" : "Show All"}</span>
                {showAllSessions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {sessionHistory.filter(s => s.completedAt && s.isSuccess).length}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {sessionHistory.filter(s => s.completedAt && !s.isSuccess).length}
              </div>
              <div className="text-xs text-gray-500">Failed/Ended</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {sessionHistory.filter(s => !s.completedAt).length}
              </div>
              <div className="text-xs text-gray-500">Incomplete</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">
                {sessionHistory.filter(s => s.totalTimeSpent && s.totalTimeSpent < 30).length}
              </div>
              <div className="text-xs text-gray-500">&lt; 30 seconds</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(sessionHistory.reduce((sum, s) => sum + (s.totalTimeSpent || 0), 0) / 60)}m
              </div>
              <div className="text-xs text-gray-500">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {Math.round((sessionHistory.reduce((sum, s) => sum + (s.totalTimeSpent || 0), 0) / Math.max(sessionHistory.length, 1)) / 60)}m
              </div>
              <div className="text-xs text-gray-500">Avg per Session</div>
            </div>
          </div>

          {sessionHistory.length > 0 ? (
            <div className="space-y-3">
              {sessionHistory
                .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
                .slice(0, showAllSessions ? undefined : 15)
                .map((session) => {
                  const isIncomplete = !session.completedAt;
                  const isVeryShort = session.totalTimeSpent && session.totalTimeSpent < 30;
                  const hasQuizProgress = session.quizState?.answers?.length > 0;
                  const hasParameterChanges = session.practiceState?.parameterChanges?.length > 0;

                  return (
                    <div
                      key={session.id}
                      className={`border rounded-lg p-4 ${
                        isIncomplete
                          ? 'border-yellow-300 bg-yellow-50'
                          : session.isSuccess
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            isIncomplete
                              ? 'bg-yellow-500'
                              : session.isSuccess
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`} />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Module {session.moduleId}: {session.moduleName}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>ID: {session.id.slice(-8)}</span>
                              <span>Started: {formatDateTime(session.startedAt)}</span>
                              {session.completedAt && (
                                <span>Ended: {formatDateTime(session.completedAt)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isIncomplete
                              ? "bg-yellow-100 text-yellow-800"
                              : session.isSuccess
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {isIncomplete ? "🔄 INCOMPLETE" : session.isSuccess ? "✅ Success" : "❌ Failed"}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Debug Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
                        <div className={`p-2 rounded ${isVeryShort ? 'bg-red-100' : 'bg-white'}`}>
                          <div className="text-gray-500">Total Duration</div>
                          <div className={`font-medium ${isVeryShort ? 'text-red-700' : 'text-gray-900'}`}>
                            {session.totalTimeSpent ? formatDuration(session.totalTimeSpent, true) : "0s"}
                            {isVeryShort && " ⚠️"}
                          </div>
                        </div>

                        <div className="p-2 bg-white rounded">
                          <div className="text-gray-500">Current Step</div>
                          <div className="font-medium text-gray-900">{session.currentStep}</div>
                        </div>

                        <div className={`p-2 rounded ${hasQuizProgress ? 'bg-blue-100' : 'bg-white'}`}>
                          <div className="text-gray-500">Quiz Progress</div>
                          <div className="font-medium text-gray-900">
                            {session.quizState?.isCompleted ? (
                              `${session.quizState.score}/${session.quizState.totalQuestions} ✓`
                            ) : hasQuizProgress ? (
                              `${session.quizState?.answers?.length || 0} answers`
                            ) : (
                              "Not started"
                            )}
                          </div>
                        </div>

                        <div className={`p-2 rounded ${hasParameterChanges ? 'bg-purple-100' : 'bg-white'}`}>
                          <div className="text-gray-500">Parameter Changes</div>
                          <div className="font-medium text-gray-900">
                            {session.practiceState?.parameterChanges?.length || 0}
                            {hasParameterChanges && " 🔧"}
                          </div>
                        </div>

                        <div className="p-2 bg-white rounded">
                          <div className="text-gray-500">Hints Used</div>
                          <div className="font-medium text-gray-900">{session.hintsUsed || 0}</div>
                        </div>

                        <div className="p-2 bg-white rounded">
                          <div className="text-gray-500">Errors</div>
                          <div className="font-medium text-gray-900">{session.errorsCount || 0}</div>
                        </div>
                      </div>

                      {/* Step Progress Debug */}
                      {session.practiceState?.stepProgress && (
                        <div className="mt-3 p-2 bg-purple-50 rounded text-xs">
                          <div className="font-medium text-purple-800">Step Progress:</div>
                          <div className="text-purple-700">
                            Current: {session.practiceState.stepProgress.currentStepIndex + 1} •
                            Completed: [{session.practiceState.stepProgress.completedSteps.join(', ')}] •
                            All Done: {session.practiceState.stepProgress.allStepsCompleted ? 'Yes' : 'No'}
                          </div>
                        </div>
                      )}

                      {/* Practice Time Debug */}
                      {session.practiceState?.timeSpentInPractice && session.practiceState.timeSpentInPractice > 0 && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                          <div className="font-medium text-blue-800">Practice Time:</div>
                          <div className="text-blue-700">
                            {formatDuration(session.practiceState.timeSpentInPractice, true)} spent in practice mode
                          </div>
                        </div>
                      )}

                      {/* Quiz Details Debug */}
                      {session.quizState?.answers && session.quizState.answers.length > 0 && (
                        <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                          <details>
                            <summary className="font-medium text-green-800 cursor-pointer">
                              Quiz Answers ({session.quizState.answers.length})
                            </summary>
                            <div className="mt-2 space-y-1">
                              {session.quizState.answers.slice(-3).map((answer, index) => (
                                <div key={index} className="text-green-700">
                                  Q{answer.questionIndex + 1}: Answer {answer.selectedAnswer} 
                                  {answer.isCorrect ? ' ✓' : ' ✗'} 
                                  ({new Date(answer.timestamp).toLocaleTimeString()})
                                </div>
                              ))}
                              {session.quizState.answers.length > 3 && (
                                <div className="text-green-600">
                                  ... and {session.quizState.answers.length - 3} more answers
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      )}

                      {/* Parameter Changes Debug */}
                      {session.practiceState?.parameterChanges && session.practiceState.parameterChanges.length > 0 && (
                        <div className="mt-3 p-2 bg-orange-50 rounded text-xs">
                          <details>
                            <summary className="font-medium text-orange-800 cursor-pointer">
                              Parameter Changes ({session.practiceState.parameterChanges.length})
                            </summary>
                            <div className="mt-2 space-y-1">
                              {session.practiceState.parameterChanges.slice(-3).map((change, index) => (
                                <div key={index} className="text-orange-700">
                                  {change.parameter}: {change.oldValue} → {change.newValue}
                                  {change.reason && ` (${change.reason})`}
                                  ({new Date(change.timestamp).toLocaleTimeString()})
                                </div>
                              ))}
                              {session.practiceState.parameterChanges.length > 3 && (
                                <div className="text-orange-600">
                                  ... and {session.practiceState.parameterChanges.length - 3} more changes
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      )}

                      {/* Warning Messages */}
                      <div className="mt-3 space-y-1">
                        {isVeryShort && (
                          <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                            ⚠️ Very short session - possible navigation/refresh issue
                          </div>
                        )}
                        {isIncomplete && (
                          <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                            🔄 This session should be resumable - check getIncompleteSession logic
                          </div>
                        )}
                        {!hasQuizProgress && !hasParameterChanges && session.totalTimeSpent && session.totalTimeSpent > 60 && (
                          <div className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                            📱 No meaningful progress recorded despite long session - possible tracking issue
                          </div>
                        )}
                        {session.currentStep === "practice" && !hasParameterChanges && (
                          <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">
                            🎛️ In practice step but no parameter changes recorded
                          </div>
                        )}
                        {session.currentStep === "quiz" && !hasQuizProgress && session.totalTimeSpent && session.totalTimeSpent > 30 && (
                          <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            📝 In quiz step but no answers recorded
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No training sessions yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Complete your first training module to see your session history here.
              </p>
            </div>
          )}

          {/* Session Summary Analysis */}
          {sessionHistory.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">📊 Session Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Avg Session Duration</div>
                  <div className="font-bold text-blue-600">
                    {formatDuration(
                      sessionHistory.reduce((sum, s) => sum + (s.totalTimeSpent || 0), 0) / 
                      Math.max(sessionHistory.length, 1),
                      true
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Sessions with Quiz Progress</div>
                  <div className="font-bold text-green-600">
                    {sessionHistory.filter(s => s.quizState?.answers && s.quizState.answers.length > 0).length}/
                    {sessionHistory.length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Sessions with Practice</div>
                  <div className="font-bold text-purple-600">
                    {sessionHistory.filter(s => s.practiceState?.parameterChanges && s.practiceState.parameterChanges.length > 0).length}/
                    {sessionHistory.length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Very Short Sessions</div>
                  <div className="font-bold text-orange-600">
                    {sessionHistory.filter(s => s.totalTimeSpent && s.totalTimeSpent < 30).length}/
                    {sessionHistory.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Raw Session Data for Development */}
          {process.env.NODE_ENV === 'development' && sessionHistory.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <details className="text-sm">
                <summary className="font-medium cursor-pointer">🐛 Raw Session Data (Dev Only)</summary>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-gray-600">
                    {JSON.stringify(
                      sessionHistory.slice(0, 2).map(s => ({
                        id: s.id.slice(-8),
                        moduleId: s.moduleId,
                        startedAt: s.startedAt,
                        completedAt: s.completedAt,
                        isSuccess: s.isSuccess,
                        currentStep: s.currentStep,
                        totalTimeSpent: s.totalTimeSpent,
                        hintsUsed: s.hintsUsed,
                        errorsCount: s.errorsCount,
                        quizState: {
                          currentQuestionIndex: s.quizState?.currentQuestionIndex,
                          answersCount: s.quizState?.answers?.length,
                          isCompleted: s.quizState?.isCompleted,
                          score: s.quizState?.score,
                          totalQuestions: s.quizState?.totalQuestions
                        },
                        practiceState: {
                          parameterChangesCount: s.practiceState?.parameterChanges?.length,
                          timeSpentInPractice: s.practiceState?.timeSpentInPractice,
                          currentParameters: s.practiceState?.currentParameters,
                          stepProgress: s.practiceState?.stepProgress
                        }
                      })),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;