// src/pages/DebugPage.tsx
import { useState, useEffect } from "react";
import {
  User,
  Database,
  Eye,
  LogIn,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import db from "../lib/db";
import type { User as UserType, Session, ModuleProgress } from "../lib/db";

const DebugPage = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Load all data
  const loadData = () => {
    db.read();
    setUsers(db.data?.users || []);
    setSessions(db.data?.sessions || []);
    setModuleProgress(db.data?.moduleProgress || []);
  };

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== "development") {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [navigate]);

  // Quick login as any user
  const handleQuickLogin = (user: UserType) => {
    localStorage.setItem("currentUserId", user.id);
    window.location.reload();
  };

  // Delete user and all their data
  const handleDeleteUser = (userId: string) => {
    if (!confirm("Delete this user and ALL their data? This cannot be undone!"))
      return;

    db.read();

    // Remove user
    db.data!.users = db.data!.users.filter((u) => u.id !== userId);

    // Remove their sessions
    db.data!.sessions = db.data!.sessions.filter((s) => s.userId !== userId);

    // Remove their module progress
    db.data!.moduleProgress = db.data!.moduleProgress.filter(
      (p) => p.userId !== userId,
    );

    db.write();
    loadData();

    // If we deleted the current user, log out
    if (currentUser?.id === userId) {
      logout();
    }
  };

  // Export all data as JSON
  const handleExportData = () => {
    const data = {
      users: users.map((u) => ({ ...u, passwordHash: "[REDACTED]" })), // Don't export password hashes
      sessions,
      moduleProgress,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.name || "Unknown",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacesim-debug-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear all data
  const handleClearAllData = () => {
    if (
      !confirm(
        "DELETE ALL DATA? This will remove all users, sessions, and progress. This cannot be undone!",
      )
    )
      return;
    if (!confirm("Are you REALLY sure? This will delete everything!")) return;

    db.data = { users: [], sessions: [], moduleProgress: [] };
    db.write();
    logout();
    navigate("/login");
  };

  // Get user stats
  const getUserStats = (userId: string) => {
    const userSessions = sessions.filter((s) => s.userId === userId);
    const userProgress = moduleProgress.filter((p) => p.userId === userId);

    return {
      totalSessions: userSessions.length,
      completedSessions: userSessions.filter(
        (s) => s.completedAt && s.isSuccess,
      ).length,
      totalTime: userSessions.reduce(
        (sum, s) => sum + (s.totalTimeSpent || 0),
        0,
      ),
      modulesStarted: userProgress.length,
      modulesCompleted: userProgress.filter((p) => p.status === "completed")
        .length,
      lastActive:
        userSessions.length > 0
          ? new Date(
              Math.max(
                ...userSessions.map((s) => new Date(s.lastActiveAt).getTime()),
              ),
            )
          : null,
    };
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-red-600" />
            <h1 className="text-xl font-bold text-red-800">
              🚨 Developer Debug Panel
            </h1>
          </div>
          <div className="text-sm text-red-600">
            Development Environment Only
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-3xl p-6">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            <Download className="w-4 h-4" />
            <span>Export All Data</span>
          </button>

          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
          >
            <Eye className="w-4 h-4" />
            <span>{showPasswords ? "Hide" : "Show"} Password Info</span>
          </button>

          <button
            onClick={handleClearAllData}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Current User Info */}
      {currentUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            Currently Logged In As:
          </h3>
          <div className="text-sm text-blue-800">
            <strong>{currentUser.name}</strong> ({currentUser.email}) - ID:{" "}
            {currentUser.id}
          </div>
        </div>
      )}

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow-lg rounded-2xl p-4">
          <h3 className="font-medium text-gray-900 mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-4">
          <h3 className="font-medium text-gray-900 mb-2">Total Sessions</h3>
          <p className="text-2xl font-bold text-green-600">{sessions.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-4">
          <h3 className="font-medium text-gray-900 mb-2">
            Module Progress Records
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {moduleProgress.length}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow-lg rounded-3xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold">All Users ({users.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Active
                </th>
                {showPasswords && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Auth Info
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const stats = getUserStats(user.id);
                return (
                  <tr
                    key={user.id}
                    className={selectedUser === user.id ? "bg-blue-50" : ""}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.role} • {user.institution}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>
                          {stats.completedSessions}/{stats.totalSessions}{" "}
                          sessions completed
                        </div>
                        <div>
                          {stats.modulesCompleted}/{stats.modulesStarted}{" "}
                          modules completed
                        </div>
                        <div className="text-gray-500">
                          {formatTime(stats.totalTime)} total time
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {stats.lastActive ? (
                          <div>
                            <div>{formatDate(stats.lastActive)}</div>
                            <div className="text-gray-500">
                              (
                              {Math.floor(
                                (Date.now() - stats.lastActive.getTime()) /
                                  (1000 * 60 * 60 * 24),
                              )}{" "}
                              days ago)
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never active</span>
                        )}
                      </div>
                    </td>

                    {showPasswords && (
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono">
                          <div className="text-gray-500">
                            Hash: {user.passwordHash.slice(0, 20)}...
                          </div>
                          <div className="text-gray-400">
                            Created:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-gray-400">
                            Last Login:{" "}
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuickLogin(user)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Login As</span>
                        </button>

                        <button
                          onClick={() =>
                            setSelectedUser(
                              selectedUser === user.id ? null : user.id,
                            )
                          }
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found. Create some accounts to see data here.
          </div>
        )}
      </div>

      {/* User Details */}
      {selectedUser && (
        <div className="bg-white shadow-lg rounded-3xl">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold">
              User Details: {users.find((u) => u.id === selectedUser)?.name}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Sessions */}
            <div>
              <h3 className="font-medium mb-3">
                Sessions (
                {sessions.filter((s) => s.userId === selectedUser).length})
              </h3>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {sessions
                  .filter((s) => s.userId === selectedUser)
                  .sort(
                    (a, b) =>
                      new Date(b.startedAt).getTime() -
                      new Date(a.startedAt).getTime(),
                  )
                  .map((session) => (
                    <div
                      key={session.id}
                      className="p-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            Module {session.moduleId}: {session.moduleName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Started:{" "}
                            {new Date(session.startedAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Status:{" "}
                            {session.completedAt
                              ? session.isSuccess
                                ? "Completed"
                                : "Failed"
                              : "In Progress"}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div>
                            Time: {formatTime(session.totalTimeSpent || 0)}
                          </div>
                          {session.quizState?.score !== undefined && (
                            <div>
                              Quiz: {session.quizState.score}/
                              {session.quizState.totalQuestions}
                            </div>
                          )}
                          <div>
                            Changes:{" "}
                            {session.practiceState?.parameterChanges?.length ||
                              0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Module Progress */}
            <div>
              <h3 className="font-medium mb-3">Module Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {moduleProgress
                  .filter((p) => p.userId === selectedUser)
                  .map((progress) => (
                    <div
                      key={progress.moduleId}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="font-medium">
                        Module {progress.moduleId}
                      </div>
                      <div className="text-sm text-gray-500">
                        Status: {progress.status} • Best Score:{" "}
                        {progress.bestScore}% • {progress.attempts} attempts
                      </div>
                      {progress.lastAttempt && (
                        <div className="text-xs text-gray-400">
                          Last:{" "}
                          {new Date(progress.lastAttempt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPage;

// Add this to your App.tsx routes:
/*
In src/App.tsx, add this route:

import DebugPage from "./pages/DebugPage";

// In your Routes section, add:
<Route path="debug" element={<DebugPage />} />

// Or add a debug link in your Layout component for easy access:
{process.env.NODE_ENV === 'development' && (
  <Link 
    to="/debug" 
    className="text-xs text-red-600 hover:text-red-800"
    title="Developer Debug Panel"
  >
    🐛 Debug
  </Link>
)}
*/
