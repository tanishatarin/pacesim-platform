import { useState, useEffect } from "react";
import {
  Users,
  Activity,
  BookOpen,
  BarChart3,
  Download,
  Clock,
  Award,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import db from "../lib/db";
import type { User, Session, ModuleProgress } from "../lib/db";

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [isLoading, setIsLoading] = useState(true);
  
  const { currentUser } = useAuth();

  // Check if user has admin privileges
  const isAdmin = currentUser?.role === "Head Nurse" || currentUser?.role === "Nursing Supervisor";

  console.log("🔧 AdminDashboard: Component mounted/updated", {
    currentUser: currentUser?.name || "No user",
    currentUserRole: currentUser?.role || "No role", 
    isAdmin,
    isLoading
  });

  useEffect(() => {
    console.log("🚀 AdminDashboard: useEffect triggered", { 
      isAdmin, 
      currentUser: currentUser?.name || "No user",
      currentUserRole: currentUser?.role || "No role",
      hasCurrentUser: !!currentUser
    });
    
    // Don't do anything if no current user yet (still loading auth)
    if (!currentUser) {
      console.log("⏳ AdminDashboard: No current user yet, waiting for auth to load...");
      return;
    }
    
    if (!isAdmin) {
      console.log("❌ AdminDashboard: User is not admin, should not see this page");
      return;
    }

    console.log("✅ AdminDashboard: User is admin, calling loadData()...");
    loadData();
  }, [currentUser, isAdmin]); // Include dependencies to trigger when user loads

  const loadData = () => {
    console.log("📊 AdminDashboard: loadData() called");
    setIsLoading(true);
    
    try {
      console.log("📖 AdminDashboard: Reading database...");
      db.read();
      
      console.log("📦 AdminDashboard: Database data:", {
        dbData: db.data ? "exists" : "null",
        usersArray: db.data?.users ? `${db.data.users.length} users` : "no users array",
        sessionsArray: db.data?.sessions ? `${db.data.sessions.length} sessions` : "no sessions array", 
        progressArray: db.data?.moduleProgress ? `${db.data.moduleProgress.length} progress records` : "no progress array"
      });
      
      const loadedUsers = db.data?.users || [];
      const loadedSessions = db.data?.sessions || [];
      const loadedProgress = db.data?.moduleProgress || [];

      console.log("📋 AdminDashboard: Loaded data:", {
        users: loadedUsers.length,
        sessions: loadedSessions.length,
        progress: loadedProgress.length
      });

      setUsers(loadedUsers);
      setSessions(loadedSessions);
      setModuleProgress(loadedProgress);
      
      console.log("✅ AdminDashboard: Data loaded successfully, setting isLoading to false");
    } catch (error) {
      console.error("❌ AdminDashboard: Error loading data:", error);
    } finally {
      console.log("🏁 AdminDashboard: Setting isLoading to false in finally block");
      setIsLoading(false);
    }
  };

  // Filter data by time range
  const getFilteredData = () => {
    console.log("🔍 AdminDashboard: getFilteredData() called with timeRange:", timeRange);
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        cutoffDate.setFullYear(2000); // Show all data
    }

    console.log("📅 AdminDashboard: Date filter", {
      now: now.toISOString(),
      cutoffDate: cutoffDate.toISOString(),
      timeRange
    });

    const filteredSessions = sessions.filter(
      (session) => new Date(session.startedAt) >= cutoffDate
    );

    const filteredProgress = moduleProgress.filter(
      (progress) => progress.lastAttempt && new Date(progress.lastAttempt) >= cutoffDate
    );

    console.log("🔍 AdminDashboard: Filtered data:", {
      originalSessions: sessions.length,
      filteredSessions: filteredSessions.length,
      originalProgress: moduleProgress.length,
      filteredProgress: filteredProgress.length
    });

    return { filteredSessions, filteredProgress };
  };

  // Calculate key metrics
  const getMetrics = () => {
    console.log("📊 AdminDashboard: getMetrics() called");
    
    const { filteredSessions, filteredProgress } = getFilteredData();
    
    const meaningfulSessions = filteredSessions.filter(
      (s) => s.totalTimeSpent && s.totalTimeSpent > 10
    );

    const completedSessions = meaningfulSessions.filter(
      (s) => s.completedAt && s.isSuccess
    );

    const totalUsers = users.length;
    const activeUsers = new Set(meaningfulSessions.map((s) => s.userId)).size;
    const totalTime = meaningfulSessions.reduce((sum, s) => sum + (s.totalTimeSpent || 0), 0);
    const avgSessionTime = meaningfulSessions.length > 0 ? totalTime / meaningfulSessions.length : 0;
    const completionRate = meaningfulSessions.length > 0 ? (completedSessions.length / meaningfulSessions.length) * 100 : 0;

    // Quiz performance
    const sessionsWithQuiz = completedSessions.filter(
      (s) => s.quizState?.score !== undefined && s.quizState?.totalQuestions
    );
    const avgQuizScore = sessionsWithQuiz.length > 0
      ? sessionsWithQuiz.reduce((sum, s) => {
          const percentage = (s.quizState!.score / s.quizState!.totalQuestions) * 100;
          return sum + percentage;
        }, 0) / sessionsWithQuiz.length
      : 0;

    const metrics = {
      totalUsers,
      activeUsers,
      totalSessions: meaningfulSessions.length,
      completedSessions: completedSessions.length,
      completionRate,
      totalTime,
      avgSessionTime,
      avgQuizScore,
      modulesStarted: filteredProgress.length,
      modulesCompleted: filteredProgress.filter((p) => p.status === "completed").length,
    };

    console.log("📈 AdminDashboard: Calculated metrics:", metrics);
    return metrics;
  };

  // Get module-specific analytics
  const getModuleAnalytics = () => {
    console.log("📊 AdminDashboard: getModuleAnalytics() called");
    
    const { filteredSessions } = getFilteredData();
    const modules = ["1", "2", "3"]; // Module IDs
    
    const moduleStats = modules.map(moduleId => {
      // Get all sessions for this module
      const moduleSessions = filteredSessions.filter(s => s.moduleId === moduleId);
      const meaningfulSessions = moduleSessions.filter(s => s.totalTimeSpent && s.totalTimeSpent > 10);
      const completedSessions = meaningfulSessions.filter(s => s.completedAt && s.isSuccess);
      
      // Calculate average quiz score for this module
      const sessionsWithQuiz = completedSessions.filter(
        s => s.quizState?.score !== undefined && s.quizState?.totalQuestions
      );
      
      const avgScore = sessionsWithQuiz.length > 0
        ? sessionsWithQuiz.reduce((sum, s) => {
            const percentage = (s.quizState!.score / s.quizState!.totalQuestions) * 100;
            return sum + percentage;
          }, 0) / sessionsWithQuiz.length
        : 0;

      // Calculate completion rate for this module
      const completionRate = meaningfulSessions.length > 0 
        ? (completedSessions.length / meaningfulSessions.length) * 100
        : 0;

      // Calculate incompletion rate
      const incompletionRate = 100 - completionRate;

      return {
        moduleId,
        moduleName: `Module ${moduleId}`,
        totalAttempts: meaningfulSessions.length,
        completedAttempts: completedSessions.length,
        completionRate,
        incompletionRate,
        avgScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal
        uniqueUsers: new Set(meaningfulSessions.map(s => s.userId)).size
      };
    });

    // Calculate users who completed all modules
    const userModuleCompletion = users.map(user => {
      const userCompletedModules = modules.filter(moduleId => {
        const userModuleSessions = filteredSessions.filter(
          s => s.userId === user.id && s.moduleId === moduleId && s.completedAt && s.isSuccess
        );
        return userModuleSessions.length > 0;
      });
      
      return {
        userId: user.id,
        userName: user.name,
        completedModules: userCompletedModules,
        completedAllModules: userCompletedModules.length === modules.length
      };
    });

    const usersCompletedAll = userModuleCompletion.filter(u => u.completedAllModules).length;

    console.log("📊 AdminDashboard: Module analytics:", {
      moduleStats,
      usersCompletedAll,
      totalUsers: users.length
    });

    return {
      moduleStats,
      usersCompletedAll,
      userModuleCompletion,
      allModulesCompletionRate: users.length > 0 ? (usersCompletedAll / users.length) * 100 : 0
    };
  };

  // Get user performance data with module-specific details
  const getUserPerformanceData = () => {
    console.log("👥 AdminDashboard: getUserPerformanceData() called");
    
    const performanceData = users.map((user) => {
      const userSessions = sessions.filter((s) => s.userId === user.id);
      const userProgress = moduleProgress.filter((p) => p.userId === user.id);
      
      const meaningfulSessions = userSessions.filter(
        (s) => s.totalTimeSpent && s.totalTimeSpent > 10
      );
      
      const completedSessions = meaningfulSessions.filter(
        (s) => s.completedAt && s.isSuccess
      );

      const totalTime = meaningfulSessions.reduce(
        (sum, s) => sum + (s.totalTimeSpent || 0), 0
      );

      const sessionsWithQuiz = completedSessions.filter(
        (s) => s.quizState?.score !== undefined && s.quizState?.totalQuestions
      );

      const avgQuizScore = sessionsWithQuiz.length > 0
        ? sessionsWithQuiz.reduce((sum, s) => {
            const percentage = (s.quizState!.score / s.quizState!.totalQuestions) * 100;
            return sum + percentage;
          }, 0) / sessionsWithQuiz.length
        : 0;

      // Get module-specific data for this user
      const moduleData = ["1", "2", "3"].map(moduleId => {
        const moduleAttempts = userSessions.filter(s => s.moduleId === moduleId);
        const meaningfulModuleAttempts = moduleAttempts.filter(s => s.totalTimeSpent && s.totalTimeSpent > 10);
        const completedModuleAttempts = meaningfulModuleAttempts.filter(s => s.completedAt && s.isSuccess);
        
        const moduleQuizSessions = completedModuleAttempts.filter(
          s => s.quizState?.score !== undefined && s.quizState?.totalQuestions
        );
        
        const moduleAvgScore = moduleQuizSessions.length > 0
          ? moduleQuizSessions.reduce((sum, s) => {
              const percentage = (s.quizState!.score / s.quizState!.totalQuestions) * 100;
              return sum + percentage;
            }, 0) / moduleQuizSessions.length
          : 0;

        let status: "never" | "in-progress" | "completed" = "never";
        if (completedModuleAttempts.length > 0) {
          status = "completed";
        } else if (meaningfulModuleAttempts.length > 0) {
          status = "in-progress";
        }

        return {
          moduleId,
          status,
          attempts: meaningfulModuleAttempts.length,
          completed: completedModuleAttempts.length,
          avgScore: Math.round(moduleAvgScore * 10) / 10
        };
      });

      return {
        user,
        totalSessions: meaningfulSessions.length,
        completedSessions: completedSessions.length,
        totalTime,
        modulesCompleted: userProgress.filter((p) => p.status === "completed").length,
        avgQuizScore,
        lastActive: meaningfulSessions.length > 0 
          ? new Date(Math.max(...meaningfulSessions.map(s => new Date(s.startedAt).getTime())))
          : null,
        moduleData // Add module-specific data
      };
    }).sort((a, b) => b.totalSessions - a.totalSessions);

    console.log("👥 AdminDashboard: Performance data calculated for", performanceData.length, "users");
    return performanceData;
  };

  // Export data to CSV
  const exportData = () => {
    console.log("💾 AdminDashboard: exportData() called");
    
    const performanceData = getUserPerformanceData();
    
    const csvContent = [
      ["User Name", "Role", "Institution", "Total Sessions", "Completed Sessions", "Total Time (min)", "Modules Completed", "Avg Quiz Score (%)", "Last Active"].join(","),
      ...performanceData.map(data => [
        data.user.name,
        data.user.role || "",
        data.user.institution || "",
        data.totalSessions,
        data.completedSessions,
        Math.round(data.totalTime / 60),
        data.modulesCompleted,
        Math.round(data.avgQuizScore),
        data.lastActive ? data.lastActive.toLocaleDateString() : "Never"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pacesim-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    console.log("💾 AdminDashboard: CSV export completed");
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!isAdmin) {
    console.log("🚫 AdminDashboard: Rendering permission denied - user is not admin");
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="bg-white shadow-lg rounded-3xl p-8 max-w-md mx-auto">
            <div className="text-red-500 mb-4">
              <XCircle className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-2">
              Sorry! You do not have permission to access this page.
            </p>
            <p className="text-gray-500 text-sm">
              You can review your progress within the dashboard and profile page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    console.log("⏳ AdminDashboard: Rendering loading state");
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading analytics data...</p>
          <p className="text-sm text-gray-500 mt-2">Check console for debug info</p>
        </div>
      </div>
    );
  }

  console.log("🎉 AdminDashboard: Rendering main dashboard");

  const metrics = getMetrics();
  const moduleAnalytics = getModuleAnalytics();
  const performanceData = getUserPerformanceData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrative Dashboard</h1>
          <p className="text-gray-600">PaceSim Training Analytics & User Management</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => {
              console.log("📅 AdminDashboard: Time range changed to:", e.target.value);
              setTimeRange(e.target.value as any);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              console.log("🔄 AdminDashboard: Manual refresh triggered");
              loadData();
            }}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-lg rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
              <p className="text-sm text-gray-500">{metrics.activeUsers} active</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Training Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalSessions}</p>
              <p className="text-sm text-gray-500">{metrics.completedSessions} completed</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.completionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Success rate</p>
            </div>
            <Award className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed All Modules</p>
              <p className="text-2xl font-bold text-gray-900">{moduleAnalytics.usersCompletedAll}</p>
              <p className="text-sm text-gray-500">{moduleAnalytics.allModulesCompletionRate.toFixed(1)}% of users</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Module Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Quiz Scores by Module */}
        <div className="bg-white shadow-lg rounded-3xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Average Quiz Scores by Module
          </h3>
          <div className="space-y-4">
            {moduleAnalytics.moduleStats.map((module, index) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
              const lightColors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100'];
              return (
                <div key={module.moduleId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{module.moduleName}</span>
                    <span className="text-sm font-bold text-gray-900">{module.avgScore}%</span>
                  </div>
                  <div className={`w-full ${lightColors[index]} rounded-full h-3`}>
                    <div
                      className={`${colors[index]} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${module.avgScore}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {module.completedAttempts} completions from {module.uniqueUsers} users
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Rates by Module */}
        <div className="bg-white shadow-lg rounded-3xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-green-500" />
            Completion Rates by Module
          </h3>
          <div className="space-y-4">
            {moduleAnalytics.moduleStats.map((module, index) => {
              const colors = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500'];
              const lightColors = ['bg-emerald-100', 'bg-teal-100', 'bg-cyan-100'];
              return (
                <div key={module.moduleId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{module.moduleName}</span>
                    <span className="text-sm font-bold text-gray-900">{module.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className={`w-full ${lightColors[index]} rounded-full h-3`}>
                    <div
                      className={`${colors[index]} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${module.completionRate}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {module.completedAttempts}/{module.totalAttempts} attempts successful
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Incompletion Rates Chart */}
      <div className="bg-white shadow-lg rounded-3xl p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-red-500" />
          Module Incompletion Rates (Areas for Improvement)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {moduleAnalytics.moduleStats.map((module, index) => {
            const colors = ['border-red-500', 'border-orange-500', 'border-yellow-500'];
            const bgColors = ['bg-red-50', 'bg-orange-50', 'bg-yellow-50'];
            const textColors = ['text-red-700', 'text-orange-700', 'text-yellow-700'];
            
            return (
              <div key={module.moduleId} className={`${bgColors[index]} border-2 ${colors[index]} shadow-lg rounded-3xl p-4`}>
                <div className="text-center">
                  <h4 className="font-medium text-gray-900">{module.moduleName}</h4>
                  <p className={`text-2xl font-bold ${textColors[index]} mt-2`}>
                    {module.incompletionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Incompletion Rate</p>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>{module.totalAttempts - module.completedAttempts} incomplete attempts</p>
                    <p>out of {module.totalAttempts} total</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Completion Summary - FIXED */}
      <div className="bg-white shadow-lg rounded-3xl p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
          User Module Completion Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 shadow-lg rounded-3xl p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{moduleAnalytics.usersCompletedAll}</p>
              <p className="text-sm text-green-600">Completed All 3 Modules</p>
              <p className="text-xs text-green-500 mt-1">
                {moduleAnalytics.allModulesCompletionRate.toFixed(1)}% of users
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 shadow-lg rounded-3xl p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">
                {moduleAnalytics.userModuleCompletion.filter(u => u.completedModules.length === 2).length}
              </p>
              <p className="text-sm text-blue-600">Completed 2 Modules</p>
              <p className="text-xs text-blue-500 mt-1">Close to finishing</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 shadow-lg rounded-3xl p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {moduleAnalytics.userModuleCompletion.filter(u => u.completedModules.length === 1).length}
              </p>
              <p className="text-sm text-yellow-600">Completed 1 Module</p>
              <p className="text-xs text-yellow-500 mt-1">Getting started</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 shadow-lg rounded-3xl p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">
                {moduleAnalytics.userModuleCompletion.filter(u => u.completedModules.length === 0).length}
              </p>
              <p className="text-sm text-red-600">No Modules Completed</p>
              <p className="text-xs text-red-500 mt-1">Need follow-up</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-3xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">Training Time</h3>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatTime(metrics.totalTime)}</p>
          <p className="text-sm text-gray-500">
            Avg: {formatTime(metrics.avgSessionTime)} per session
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-gray-900">Module Progress</h3>
          </div>
          <p className="text-xl font-bold text-gray-900">{metrics.modulesCompleted}</p>
          <p className="text-sm text-gray-500">
            {metrics.modulesStarted} started
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium text-gray-900">Engagement</h3>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {metrics.totalUsers > 0 ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-sm text-gray-500">Active user rate</p>
        </div>
      </div>

      {/* User Performance Table with Module Details */}
      <div className="bg-white shadow-lg rounded-3xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">User Performance & Module Progress</h3>
          <p className="text-sm text-gray-500">Detailed analytics with module-specific data for all users</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module 3
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.map((data) => {
                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case "completed":
                      return <CheckCircle className="w-4 h-4 text-green-500" />;
                    case "in-progress":
                      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
                    default:
                      return <XCircle className="w-4 h-4 text-gray-400" />;
                  }
                };

                const getStatusText = (status: string) => {
                  switch (status) {
                    case "completed":
                      return "Completed";
                    case "in-progress":
                      return "In Progress";
                    default:
                      return "Never Attempted";
                  }
                };

                const getStatusColor = (status: string) => {
                  switch (status) {
                    case "completed":
                      return "text-green-600";
                    case "in-progress":
                      return "text-yellow-600";
                    default:
                      return "text-gray-500";
                  }
                };

                return (
                  <tr key={data.user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {data.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {data.user.role} • {data.user.institution}
                        </div>
                      </div>
                    </td>
                    
                    {/* Module 1, 2, 3 columns */}
                    {data.moduleData.map((module) => (
                      <td key={module.moduleId} className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(module.status)}
                          <div>
                            <div className={`text-sm font-medium ${getStatusColor(module.status)}`}>
                              {getStatusText(module.status)}
                            </div>
                            {module.status === "completed" && (
                              <div className="text-sm text-gray-600">
                                Score: {module.avgScore > 0 ? `${module.avgScore}%` : 'N/A'}
                              </div>
                            )}
                            {module.attempts > 0 && (
                              <div className="text-xs text-gray-500">
                                {module.attempts} attempt{module.attempts !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    ))}

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {data.completedSessions}/{data.totalSessions} sessions
                        </div>
                        <div className="text-gray-500">
                          {formatTime(data.totalTime)} total
                        </div>
                        <div className="text-gray-500">
                          Overall avg: {data.avgQuizScore > 0 ? `${data.avgQuizScore.toFixed(1)}%` : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.lastActive ? data.lastActive.toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;