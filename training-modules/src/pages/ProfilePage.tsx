import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  RotateCcw,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Target,
  Zap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSession } from "../hooks/useSession";
import { useNavigate } from "react-router-dom";
import db from "../lib/db";
import type { Session, ModuleProgress, User as UserType } from "../lib/db";

interface SessionGroup {
  id: string;
  moduleId: string;
  moduleName: string;
  sessions: Session[];
  firstStarted: string;
  lastActivity: string;
  totalDuration: number;
  finalStatus: "completed" | "ended" | "in_progress";
  bestQuizScore?: { score: number; total: number };
  totalChanges: number;
}

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { sessionHistory, getSessionStats } = useSession(currentUser?.id);
  const navigate = useNavigate();

  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [sessionGroups, setSessionGroups] = useState<SessionGroup[]>([]);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserType>>({});

  useEffect(() => {
    if (!currentUser?.id) return;

    // Load module progress
    db.read();
    const userModuleProgress =
      db.data?.moduleProgress?.filter((p) => p.userId === currentUser.id) || [];
    setModuleProgress(userModuleProgress);

    // Filter out sessions with no meaningful data (no duration)
    const meaningfulSessions = sessionHistory.filter(
      (session) => session.totalTimeSpent && session.totalTimeSpent > 0,
    );

    // Group sessions by "session attempts" - each continuous attempt at a module
    const groups: SessionGroup[] = [];

    // Sort all sessions by start time
    const sortedSessions = [...meaningfulSessions].sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    );

    // Group sessions that are close in time for the same module
    sortedSessions.forEach((session) => {
      const moduleId = session.moduleId;
      const sessionStart = new Date(session.startedAt).getTime();

      // Look for an existing group for this module that's recent (within 1 hour gap)
      const recentGroup = groups.find(
        (group) =>
          group.moduleId === moduleId &&
          sessionStart - new Date(group.lastActivity).getTime() < 3600000 && // 1 hour
          group.finalStatus !== "completed", // Don't add to completed groups
      );

      if (recentGroup) {
        // Add to existing group
        recentGroup.sessions.push(session);
        recentGroup.lastActivity = session.completedAt || session.lastActiveAt;
        recentGroup.totalDuration += session.totalTimeSpent || 0;
        recentGroup.totalChanges +=
          session.practiceState?.parameterChanges?.length || 0;

        // Update final status
        if (session.completedAt && session.isSuccess) {
          recentGroup.finalStatus = "completed";
        } else if (session.completedAt) {
          recentGroup.finalStatus = "ended";
        }

        // Update best quiz score
        if (
          session.quizState?.score !== undefined &&
          session.quizState?.totalQuestions
        ) {
          if (
            !recentGroup.bestQuizScore ||
            session.quizState.score / session.quizState.totalQuestions >
              recentGroup.bestQuizScore.score / recentGroup.bestQuizScore.total
          ) {
            recentGroup.bestQuizScore = {
              score: session.quizState.score,
              total: session.quizState.totalQuestions,
            };
          }
        }
      } else {
        // Create new group
        const newGroup: SessionGroup = {
          id: `group_${session.id}`,
          moduleId,
          moduleName: getModuleName(moduleId),
          sessions: [session],
          firstStarted: session.startedAt,
          lastActivity: session.completedAt || session.lastActiveAt,
          totalDuration: session.totalTimeSpent || 0,
          finalStatus: session.completedAt
            ? session.isSuccess
              ? "completed"
              : "ended"
            : "in_progress",
          totalChanges: session.practiceState?.parameterChanges?.length || 0,
          bestQuizScore:
            session.quizState?.score !== undefined &&
            session.quizState?.totalQuestions
              ? {
                  score: session.quizState.score,
                  total: session.quizState.totalQuestions,
                }
              : undefined,
        };
        groups.push(newGroup);
      }
    });

    // Sort groups by most recent activity
    groups.sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
    );

    setSessionGroups(groups);
    setEditedUser({
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      institution: currentUser.institution,
    });
  }, [currentUser?.id, sessionHistory]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const stats = getSessionStats();

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
    const moduleNames: Record<string, string> = {
      "1": "Scenario 1: Bradycardia",
      "2": "Scenario 2: Oversensing",
      "3": "Scenario 3: Undersensing",
      "4": "Capture Calibration",
      "5": "Failure to Capture",
    };
    return moduleNames[moduleId] || `Module ${moduleId}`;
  };

  const getStatusIcon = (group: SessionGroup) => {
    switch (group.finalStatus) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "ended":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RotateCcw className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (group: SessionGroup) => {
    switch (group.finalStatus) {
      case "completed":
        return "Completed";
      case "ended":
        return "Ended";
      default:
        return "In Progress";
    }
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
    if (progress.status === "in_progress") {
      navigate(`/module/${moduleId}`);
    } else {
      navigate(`/module/${moduleId}`);
    }
  };

  // Get fastest completion times for all 5 modules
  const getFastestCompletions = () => {
    const moduleIds = ["1", "2", "3", "4", "5"];
    const fastestTimes: { [moduleId: string]: number } = {};

    sessionHistory.forEach((session) => {
      if (session.completedAt && session.isSuccess && session.totalTimeSpent) {
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
  const overallFastest = Math.min(
    ...Object.values(
      sessionHistory
        .filter((s) => s.completedAt && s.isSuccess && s.totalTimeSpent)
        .reduce(
          (acc, s) => {
            acc[s.moduleId] = Math.min(
              acc[s.moduleId] || Infinity,
              s.totalTimeSpent!,
            );
            return acc;
          },
          {} as { [key: string]: number },
        ),
    ),
  );

  // Get session groups to display (limited or all)
  const getDisplayedSessionGroups = () => {
    if (showAllSessions) {
      return sessionGroups;
    }
    return sessionGroups.slice(0, 5);
  };

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
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, role: e.target.value })
                        }
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded-md px-2 py-1 w-full"
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

      {/* Training Statistics */}
      <div className="bg-white shadow-lg rounded-3xl mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Training Statistics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.completedSessions || 0}
              </p>
              <p className="text-sm text-gray-500">Sessions Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalTimeSpent
                  ? formatDuration(stats.totalTimeSpent)
                  : "0m"}
              </p>
              <p className="text-sm text-gray-500">Total Training Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.averageScore ? Math.round(stats.averageScore) : 0}%
              </p>
              <p className="text-sm text-gray-500">Average Quiz Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.completionRate ? Math.round(stats.completionRate) : 0}%
              </p>
              <p className="text-sm text-gray-500">Success Rate</p>
            </div>
          </div>

          {/* Fastest Completion Times */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center mb-3">
              <Zap className="w-4 h-4 text-green-500 mr-2" />
              <h4 className="font-medium text-gray-900">
                Fastest Completion Times
              </h4>
              {overallFastest !== Infinity && (
                <span className="ml-auto text-sm text-green-600 font-medium">
                  Best: {formatDuration(overallFastest, true)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {fastestCompletions.map((module) => (
                <div
                  key={module.moduleId}
                  className="text-center p-2 bg-gray-50 rounded-lg"
                >
                  <p className="text-xs text-gray-500">
                    Module {module.moduleId}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {module.time}
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
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No module progress yet. Start your first training session!
            </p>
          )}
        </div>
      </div>

      {/* Session History - OLD --> Grouped by Attempts */}
      {/* <div className="bg-white shadow-lg rounded-3xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-500" />
              Training Session History
              <span className="ml-2 text-sm text-gray-500">
                ({sessionGroups.length} attempts)
              </span>
            </h3>

            {sessionGroups.length > 5 && (
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

          {sessionGroups.length > 0 ? (
            <div className="space-y-4">
              {getDisplayedSessionGroups().map((group) => (
                <div
                  key={group.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(group)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {group.moduleName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(group.firstStarted)}
                          {group.sessions.length > 1 &&
                            ` (${group.sessions.length} sessions)`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.finalStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : group.finalStatus === "ended"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {getStatusText(group)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-1 font-medium">
                        {formatDuration(group.totalDuration, true)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Quiz Score:</span>
                      <span className="ml-1 font-medium">
                        {group.bestQuizScore
                          ? `${group.bestQuizScore.score}/${group.bestQuizScore.total}`
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Adjustments:</span>
                      <span className="ml-1 font-medium">
                        {group.totalChanges}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sessions:</span>
                      <span className="ml-1 font-medium">
                        {group.sessions.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No training sessions yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Complete your first training module to see your session history
                here.
              </p>
            </div>
          )}
        </div>
      </div> */}

      {/* new session history to help debuig july 2nd  */}
      {/* Enhanced Session History - Now with Debug Info */}
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

            {sessionHistory.length > 10 && (
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
          <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
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
              <div className="text-xs text-gray-500"> 30 seconds</div>
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

                      {/* Debug Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                        <div className={`p-2 rounded ${isVeryShort ? 'bg-red-100' : 'bg-white'}`}>
                          <div className="text-gray-500">Duration</div>
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
                        
                        <div className={`p-2 rounded ${hasParameterChanges ? 'bg-green-100' : 'bg-white'}`}>
                          <div className="text-gray-500">Parameter Changes</div>
                          <div className="font-medium text-gray-900">
                            {session.practiceState?.parameterChanges?.length || 0}
                            {hasParameterChanges && " 🔧"}
                          </div>
                        </div>
                        
                        <div className="p-2 bg-white rounded">
                          <div className="text-gray-500">Last Active</div>
                          <div className="font-medium text-gray-900">
                            {formatDateTime(session.lastActiveAt)}
                          </div>
                        </div>
                      </div>

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
                        {!isIncomplete && !session.isSuccess && session.totalTimeSpent && session.totalTimeSpent > 60 && (
                          <div className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                            📝 Failed session with significant progress - check endSession logic
                          </div>
                        )}
                      </div>

                      {/* Step Progress Debug */}
                      {session.practiceState?.stepProgress && (
                        <div className="mt-3 p-2 bg-purple-50 rounded text-xs">
                          <div className="font-medium text-purple-800">Step Progress:</div>
                          <div className="text-purple-700">
                            Current: {session.practiceState.stepProgress.currentStepIndex} • 
                            Completed: [{session.practiceState.stepProgress.completedSteps.join(', ')}] • 
                            All Done: {session.practiceState.stepProgress.allStepsCompleted ? 'Yes' : 'No'}
                          </div>
                        </div>
                      )}
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

          {/* Debug Raw Data (Development Only) */}
          {process.env.NODE_ENV === 'development' && sessionHistory.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <details className="text-sm">
                <summary className="font-medium cursor-pointer">🐛 Raw Session Data (Dev Only)</summary>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-gray-600">
                    {JSON.stringify(
                      sessionHistory.slice(0, 3).map(s => ({
                        id: s.id.slice(-8),
                        moduleId: s.moduleId,
                        startedAt: s.startedAt,
                        completedAt: s.completedAt,
                        isSuccess: s.isSuccess,
                        currentStep: s.currentStep,
                        totalTimeSpent: s.totalTimeSpent,
                        quizCompleted: s.quizState?.isCompleted,
                        paramChanges: s.practiceState?.parameterChanges?.length,
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

      



      {/* Debug Info for Quiz Score Issue */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-yellow-800 mb-2">
            Debug Info - Quiz Scores
          </h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>Sessions with unusual quiz scores:</p>
            {sessionHistory
              .filter(
                (s) =>
                  s.quizState?.totalQuestions &&
                  s.quizState.totalQuestions !== 3,
              )
              .slice(0, 3)
              .map((s) => (
                <div key={s.id} className="ml-4">
                  Session {s.id.slice(-8)}: {s.quizState?.score}/
                  {s.quizState?.totalQuestions}
                </div>
              ))}
            <p className="mt-2">
              Empty sessions (no duration):{" "}
              {
                sessionHistory.filter(
                  (s) => !s.totalTimeSpent || s.totalTimeSpent === 0,
                ).length
              }
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ProfilePage;
