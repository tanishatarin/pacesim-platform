// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Clock,
//   Award,
//   BookOpen,
//   Star,
//   Target,
//   Zap,
//   Calendar,
//   CheckCircle,
//   PlayCircle,
//   Flame,
//   Activity,
//   XCircle,
// } from "lucide-react";
// import { useAuth } from "../hooks/useAuth";
// import { useSession } from "../hooks/useSession";
// import db from "../lib/db";
// import type { ModuleProgress, Session } from "../lib/db";

// interface DashboardStats {
//   totalTime: number;
//   completedModules: number;
//   averageScore: number;
//   lastSessionDate?: string;
//   streakDays: number;
//   totalSessions: number;
//   fastestTime?: number;
//   currentWeekTime: number;
// }

// interface RecentModule {
//   id: string;
//   name: string;
//   status: "Completed" | "In Progress" | "Failed";
//   score?: number;
//   date: string;
//   duration?: number;
// }

// interface ModuleData {
//   id: number;
//   title: string;
//   description: string;
//   estimatedDuration: string;
//   difficulty: "Beginner" | "Intermediate" | "Advanced";
// }

// const Dashboard = () => {
//   const { currentUser } = useAuth();
//   const { sessionHistory, getSessionStats } = useSession(currentUser?.id);
//   const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
//     totalTime: 0,
//     completedModules: 0,
//     averageScore: 0,
//     streakDays: 0,
//     totalSessions: 0,
//     currentWeekTime: 0,
//   });
//   const [recentModules, setRecentModules] = useState<RecentModule[]>([]);
//   const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
//   const [recommendedNext, setRecommendedNext] = useState<ModuleData | null>(
//     null,
//   );

//   const modules: ModuleData[] = [
//     {
//       id: 1,
//       title: "Scenario 1: Bradycardia Management",
//       description:
//         "Learn to diagnose and correct failure to sense conditions. Practice with atrial pacing and sensitivity adjustments.",
//       estimatedDuration: "15-20 min",
//       difficulty: "Beginner",
//     },
//     {
//       id: 2,
//       title: "Scenario 2: Oversensing Issues",
//       description:
//         "Identify and correct oversensing problems that cause inappropriate pacing inhibition.",
//       estimatedDuration: "20-25 min",
//       difficulty: "Intermediate",
//     },
//     {
//       id: 3,
//       title: "Scenario 3: Undersensing Problems",
//       description:
//         "Correct undersensing issues where the pacemaker fails to detect intrinsic cardiac activity.",
//       estimatedDuration: "15-20 min",
//       difficulty: "Intermediate",
//     },
//     {
//       id: 4,
//       title: "Capture Calibration Module",
//       description:
//         "Master the techniques for establishing and verifying proper cardiac capture.",
//       estimatedDuration: "25-30 min",
//       difficulty: "Advanced",
//     },
//     {
//       id: 5,
//       title: "Failure to Capture",
//       description:
//         "Diagnose and correct situations where pacing spikes fail to generate cardiac response.",
//       estimatedDuration: "20-25 min",
//       difficulty: "Advanced",
//     },
//   ];

//   useEffect(() => {
//     if (!currentUser?.id) return;

//     // Load real data from database
//     db.read();
//     const userProgress =
//       db.data?.moduleProgress?.filter((p) => p.userId === currentUser.id) || [];
//     const userSessions =
//       db.data?.sessions?.filter(
//         (s) =>
//           s.userId === currentUser.id &&
//           s.totalTimeSpent &&
//           s.totalTimeSpent > 0,
//       ) || [];

//     // Filter out very short sessions (less than 30 seconds) for recent activity
//     const meaningfulSessions = userSessions.filter(
//       (s) => s.totalTimeSpent! > 30,
//     );

//     setModuleProgress(userProgress);

//     // Calculate dashboard stats from real data
//     const stats = getSessionStats();
//     const completedSessions = userSessions.filter(
//       (s) => s.completedAt && s.isSuccess,
//     );
//     const fastestTime =
//       completedSessions.length > 0
//         ? Math.min(
//             ...completedSessions
//               .map((s) => s.totalTimeSpent || Infinity)
//               .filter((t) => t !== Infinity),
//           )
//         : undefined;

//     // Calculate current week training time
//     const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
//     const currentWeekSessions = userSessions.filter(
//       (s) => new Date(s.startedAt).getTime() > oneWeekAgo,
//     );
//     const currentWeekTime = currentWeekSessions.reduce(
//       (sum, s) => sum + (s.totalTimeSpent || 0),
//       0,
//     );

//     // Calculate streak (consecutive days with activity)
//     const streakDays = calculateStreakDays(userSessions);

//     // Get last session date
//     const lastSession =
//       userSessions.length > 0
//         ? userSessions.sort(
//             (a, b) =>
//               new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
//           )[0]
//         : null;

//     setDashboardStats({
//       totalTime: stats?.totalTimeSpent || 0,
//       completedModules: stats?.completedSessions || 0,
//       averageScore: stats?.averageScore || 0,
//       lastSessionDate: lastSession?.startedAt,
//       streakDays,
//       totalSessions: userSessions.length,
//       fastestTime: fastestTime !== Infinity ? fastestTime : undefined,
//       currentWeekTime,
//     });

//     // Get recent modules (last 5 meaningful sessions)
//     const recentSessions = meaningfulSessions
//       .sort(
//         (a, b) =>
//           new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
//       )
//       .slice(0, 5);

//     const recentModulesData: RecentModule[] = recentSessions.map((session) => ({
//       id: session.moduleId,
//       name: getModuleName(session.moduleId),
//       status: session.completedAt
//         ? session.isSuccess
//           ? "Completed"
//           : "Failed"
//         : "In Progress",
//       score:
//         session.quizState?.score && session.quizState?.totalQuestions
//           ? Math.round(
//               (session.quizState.score / session.quizState.totalQuestions) *
//                 100,
//             )
//           : undefined,
//       date: new Date(session.startedAt).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         hour: "numeric",
//         minute: "2-digit",
//         hour12: true,
//       }),
//       duration: session.totalTimeSpent,
//     }));

//     setRecentModules(recentModulesData);

//     // Find recommended next module
//     const completedModuleIds = userProgress
//       .filter((p) => p.status === "completed")
//       .map((p) => parseInt(p.moduleId));

//     const nextModule = modules.find((m) => !completedModuleIds.includes(m.id));
//     setRecommendedNext(nextModule || null);
//   }, [currentUser?.id, sessionHistory]);

//   const calculateStreakDays = (sessions: Session[]): number => {
//     if (sessions.length === 0) return 0;

//     const sessionDates = [
//       ...new Set(sessions.map((s) => new Date(s.startedAt).toDateString())),
//     ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

//     let streak = 0;
//     const today = new Date().toDateString();
//     let currentDate = new Date();

//     for (let i = 0; i < sessionDates.length; i++) {
//       const sessionDate = new Date(sessionDates[i]);
//       const daysDiff = Math.floor(
//         (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24),
//       );

//       if (daysDiff === streak) {
//         streak++;
//         currentDate = sessionDate;
//       } else {
//         break;
//       }
//     }

//     return streak;
//   };

//   const getModuleName = (moduleId: string) => {
//     const moduleNames: Record<string, string> = {
//       "1": "Scenario 1: Bradycardia",
//       "2": "Scenario 2: Oversensing",
//       "3": "Scenario 3: Undersensing",
//       "4": "Capture Calibration",
//       "5": "Failure to Capture",
//     };
//     return moduleNames[moduleId] || `Module ${moduleId}`;
//   };

//   const formatDuration = (seconds: number) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     if (hours > 0) {
//       return `${hours}h ${minutes}m`;
//     }
//     return `${minutes}m`;
//   };

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}m ${remainingSeconds}s`;
//   };

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good morning";
//     if (hour < 17) return "Good afternoon";
//     return "Good evening";
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "Completed":
//         return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case "Failed":
//         return <XCircle className="w-4 h-4 text-red-500" />;
//       case "In Progress":
//         return <Clock className="w-4 h-4 text-yellow-500" />;
//       default:
//         return <PlayCircle className="w-4 h-4 text-gray-400" />;
//     }
//   };

//   const getProgressPercentage = () => {
//     // Only count actually completed modules, not in-progress
//     return Math.round((dashboardStats.completedModules / modules.length) * 100);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Welcome Header */}
//       <div className="mb-4">
//         <h1 className="mb-2 text-3xl font-bold text-black">
//           {getGreeting()}, {currentUser?.name?.split(" ")[0] || "Nurse"}!
//         </h1>
//         <p className="text-xl text-gray-900">
//           Welcome back to your Interactive External Pacemaker Training Platform
//         </p>
//       </div>

//       {/* Recommended Next Module */}
//       {recommendedNext && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//           <div className="flex items-center space-x-2 mb-2">
//             <Star className="w-5 h-5 text-blue-600" />
//             <h3 className="font-medium text-blue-900">Recommended Next</h3>
//           </div>
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="font-medium text-blue-800">
//                 {recommendedNext.title}
//               </p>
//               <p className="text-sm text-blue-600">
//                 Estimated: {recommendedNext.estimatedDuration}
//               </p>
//             </div>
//             <Link
//               to={`/module/${recommendedNext.id}`}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Start Now
//             </Link>
//           </div>
//         </div>
//       )}

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//         <div className="w-full p-4 bg-white shadow-lg rounded-3xl">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-sm font-medium text-gray-500">Training Time</h3>
//             <Clock className="w-5 h-5 text-blue-500" />
//           </div>
//           <p className="text-2xl font-bold text-gray-900">
//             {formatDuration(dashboardStats.totalTime)}
//           </p>
//           <p className="text-sm text-gray-600">
//             {formatDuration(dashboardStats.currentWeekTime)} this week
//           </p>
//         </div>

//         <div className="w-full p-4 bg-white shadow-lg rounded-3xl">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-sm font-medium text-gray-500">
//               Modules Completed
//             </h3>
//             <BookOpen className="w-5 h-5 text-yellow-500" />
//           </div>
//           <p className="text-2xl font-bold text-gray-900">
//             {dashboardStats.completedModules}
//           </p>
//           <p className="text-sm text-gray-600">of {modules.length} modules</p>
//         </div>

//         <div className="w-full p-4 bg-white shadow-lg rounded-3xl">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-sm font-medium text-gray-500">
//               Average Quiz Score
//             </h3>
//             <Award className="w-5 h-5 text-green-500" />
//           </div>
//           <p className="text-2xl font-bold text-gray-900">
//             {Math.round(dashboardStats.averageScore)}%
//           </p>
//           <p className="text-sm text-gray-600">
//             {dashboardStats.totalSessions} total sessions
//           </p>
//         </div>

//         <div className="w-full p-4 bg-white shadow-lg rounded-3xl">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-sm font-medium text-gray-500">Personal Best</h3>
//             <Zap className="w-5 h-5 text-purple-600" />
//           </div>
//           <p className="text-2xl font-bold text-gray-900">
//             {dashboardStats.fastestTime
//               ? formatTime(dashboardStats.fastestTime)
//               : "N/A"}
//           </p>
//           <p className="text-sm text-gray-600">Fastest completion</p>
//         </div>
//       </div>

//       {/* Activity Overview */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Recent Activity */}
//         <div className="lg:col-span-2 bg-white shadow-lg rounded-3xl">
//           <div className="p-6 border-b border-gray-100">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-bold text-gray-900 flex items-center">
//                 <Activity className="w-5 h-5 mr-2 text-blue-500" />
//                 Recent Training Sessions
//               </h3>
//               <Link
//                 to="/modules"
//                 className="text-sm font-medium text-blue-600 hover:text-blue-800"
//               >
//                 View all modules →
//               </Link>
//             </div>
//           </div>
//           <div className="divide-y divide-gray-100">
//             {recentModules.length > 0 ? (
//               recentModules.map((module, index) => (
//                 <div
//                   key={`${module.id}-${index}`}
//                   className="p-4 hover:bg-gray-50 transition-colors"
//                 >
//                   <Link
//                     to={`/module/${module.id}`}
//                     className="flex justify-between items-center"
//                   >
//                     <div className="flex items-center space-x-3">
//                       {getStatusIcon(module.status)}
//                       <div>
//                         <h4 className="text-sm font-medium text-gray-900">
//                           {module.name}
//                         </h4>
//                         <p className="text-xs text-gray-500">{module.date}</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="flex items-center space-x-3">
//                         {module.score && (
//                           <span className="text-sm font-medium text-gray-700">
//                             {module.score}%
//                           </span>
//                         )}
//                         {module.duration && (
//                           <span className="text-sm text-gray-500">
//                             {formatTime(module.duration)}
//                           </span>
//                         )}
//                         <span
//                           className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                             module.status === "Completed"
//                               ? "bg-green-100 text-green-800"
//                               : module.status === "Failed"
//                                 ? "bg-red-100 text-red-800"
//                                 : module.status === "In Progress"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : "bg-gray-100 text-gray-800"
//                           }`}
//                         >
//                           {module.status}
//                         </span>
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               ))
//             ) : (
//               <div className="p-8 text-center">
//                 <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//                 <p className="text-gray-500">No training sessions yet.</p>
//                 <p className="text-sm text-gray-400 mt-1">
//                   Start your first module to see your activity here.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quick Stats & Achievements */}
//         <div className="space-y-6">
//           {/* This Week */}
//           <div className="bg-white shadow-lg rounded-2xl p-6">
//             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
//               <Calendar className="w-5 h-5 mr-2 text-green-500" />
//               This Week
//             </h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Training Time</span>
//                 <span className="font-medium">
//                   {formatDuration(dashboardStats.currentWeekTime)}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Streak</span>
//                 <span className="font-medium flex items-center">
//                   {dashboardStats.streakDays > 0 && (
//                     <Flame className="w-4 h-4 text-orange-500 mr-1" />
//                   )}
//                   {dashboardStats.streakDays} day
//                   {dashboardStats.streakDays !== 1 ? "s" : ""}
//                 </span>
//               </div>
//               {dashboardStats.lastSessionDate && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Last Session</span>
//                   <span className="font-medium">
//                     {new Date(
//                       dashboardStats.lastSessionDate,
//                     ).toLocaleDateString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                     })}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Progress Overview */}
//           <div className="bg-white shadow-lg rounded-2xl p-6">
//             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
//               <Target className="w-5 h-5 mr-2 text-purple-500" />
//               Learning Progress
//             </h3>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex justify-between text-sm mb-2">
//                   <span className="text-gray-600">Overall Completion</span>
//                   <span className="font-medium">
//                     {getProgressPercentage()}%
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${getProgressPercentage()}%` }}
//                   />
//                 </div>
//               </div>

//               {moduleProgress.length > 0 && (
//                 <div className="space-y-2">
//                   {moduleProgress.slice(0, 3).map((progress) => (
//                     <div
//                       key={progress.moduleId}
//                       className="flex justify-between text-sm"
//                     >
//                       <span className="text-gray-600">
//                         Module {progress.moduleId}
//                       </span>
//                       <span
//                         className={`font-medium ${
//                           progress.status === "completed"
//                             ? "text-green-600"
//                             : progress.status === "in_progress"
//                               ? "text-yellow-600"
//                               : "text-gray-400"
//                         }`}
//                       >
//                         {progress.status === "completed"
//                           ? `${progress.bestScore}%`
//                           : progress.status === "in_progress"
//                             ? "In Progress"
//                             : "Not Started"}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// july 2 3pm trying to fix with new db updates

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Award,
  BookOpen,
  Star,
  Target,
  Zap,
  Calendar,
  CheckCircle,
  PlayCircle,
  Flame,
  Activity,
  XCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSession } from "../hooks/useSession";
import db from "../lib/db";
import type { ModuleProgress, Session } from "../lib/db";

interface DashboardStats {
  totalTime: number;
  completedModules: number;
  averageScore: number;
  lastSessionDate?: string;
  streakDays: number;
  totalSessions: number;
  fastestTime?: number;
  currentWeekTime: number;
  successRate: number;
}

interface RecentModule {
  id: string;
  name: string;
  status: "Completed" | "In Progress" | "Failed";
  score?: number;
  date: string;
  duration?: number;
}

interface ModuleData {
  id: number;
  title: string;
  description: string;
  estimatedDuration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { sessionHistory } = useSession(currentUser?.id);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTime: 0,
    completedModules: 0,
    averageScore: 0,
    streakDays: 0,
    totalSessions: 0,
    currentWeekTime: 0,
    successRate: 0,
  });
  const [recentModules, setRecentModules] = useState<RecentModule[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [recommendedNext, setRecommendedNext] = useState<ModuleData | null>(
    null,
  );

  const modules: ModuleData[] = [
    {
      id: 1,
      title: "Scenario 1: Bradycardia Management",
      description:
        "Learn to diagnose and correct failure to sense conditions. Practice with atrial pacing and sensitivity adjustments.",
      estimatedDuration: "15-20 min",
      difficulty: "Beginner",
    },
    {
      id: 2,
      title: "Scenario 2: Oversensing Issues",
      description:
        "Identify and correct oversensing problems that cause inappropriate pacing inhibition.",
      estimatedDuration: "20-25 min",
      difficulty: "Intermediate",
    },
    {
      id: 3,
      title: "Scenario 3: Undersensing Problems",
      description:
        "Correct undersensing issues where the pacemaker fails to detect intrinsic cardiac activity.",
      estimatedDuration: "15-20 min",
      difficulty: "Intermediate",
    },
    {
      id: 4,
      title: "Capture Calibration Module",
      description:
        "Master the techniques for establishing and verifying proper cardiac capture.",
      estimatedDuration: "25-30 min",
      difficulty: "Advanced",
    },
    {
      id: 5,
      title: "Failure to Capture",
      description:
        "Diagnose and correct situations where pacing spikes fail to generate cardiac response.",
      estimatedDuration: "20-25 min",
      difficulty: "Advanced",
    },
  ];

  useEffect(() => {
    if (!currentUser?.id) return;

    console.log("🔍 Dashboard: Loading data for user:", currentUser.id);

    // Load real data from database
    db.read();
    const userProgress =
      db.data?.moduleProgress?.filter((p) => p.userId === currentUser.id) || [];
    const userSessions =
      db.data?.sessions?.filter((s) => s.userId === currentUser.id) || [];

    console.log("📊 Dashboard: Found sessions:", userSessions.length);
    console.log("📊 Dashboard: Found progress:", userProgress.length);

    // Filter meaningful sessions (not empty/broken ones)
    const meaningfulSessions = userSessions.filter(
      (s) => s.totalTimeSpent && s.totalTimeSpent > 10, // At least 10 seconds
    );

    console.log(
      "📊 Dashboard: Meaningful sessions:",
      meaningfulSessions.length,
    );

    setModuleProgress(userProgress);

    // Calculate stats from REAL data
    const completedSessions = meaningfulSessions.filter(
      (s) => s.completedAt && s.isSuccess,
    );

    const totalTime = meaningfulSessions.reduce(
      (sum, s) => sum + (s.totalTimeSpent || 0),
      0,
    );

    // Calculate average quiz score from completed sessions with quiz data
    const sessionsWithQuiz = completedSessions.filter(
      (s) => s.quizState?.score !== undefined && s.quizState?.totalQuestions,
    );

    const averageScore =
      sessionsWithQuiz.length > 0
        ? sessionsWithQuiz.reduce(
            (sum, s) =>
              sum + (s.quizState!.score / s.quizState!.totalQuestions) * 100,
            0,
          ) / sessionsWithQuiz.length
        : 0;

    // Get fastest completion time
    const fastestTime =
      completedSessions.length > 0
        ? Math.min(
            ...completedSessions
              .map((s) => s.totalTimeSpent || Infinity)
              .filter((t) => t !== Infinity && t > 0),
          )
        : undefined;

    // Calculate current week training time
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const currentWeekSessions = meaningfulSessions.filter(
      (s) => new Date(s.startedAt).getTime() > oneWeekAgo,
    );
    const currentWeekTime = currentWeekSessions.reduce(
      (sum, s) => sum + (s.totalTimeSpent || 0),
      0,
    );

    // Calculate streak (consecutive days with activity)
    const streakDays = calculateStreakDays(meaningfulSessions);

    // Get completed modules count from module progress
    const completedModulesCount = userProgress.filter(
      (p) => p.status === "completed",
    ).length;

    // Calculate success rate
    const totalAttempts = meaningfulSessions.length;
    const successRate =
      totalAttempts > 0 ? (completedSessions.length / totalAttempts) * 100 : 0;

    // Get last session date
    const lastSession =
      meaningfulSessions.length > 0
        ? meaningfulSessions.sort(
            (a, b) =>
              new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
          )[0]
        : null;

    console.log("📊 Dashboard: Calculated stats:", {
      totalTime,
      completedModulesCount,
      averageScore,
      totalAttempts,
      successRate,
      streakDays,
    });

    setDashboardStats({
      totalTime,
      completedModules: completedModulesCount,
      averageScore,
      lastSessionDate: lastSession?.startedAt,
      streakDays,
      totalSessions: totalAttempts,
      fastestTime: fastestTime !== Infinity ? fastestTime : undefined,
      currentWeekTime,
      successRate,
    });

    // Get recent modules (last 5 meaningful sessions)
    const recentSessions = meaningfulSessions
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      )
      .slice(0, 5);

    const recentModulesData: RecentModule[] = recentSessions.map((session) => ({
      id: session.moduleId,
      name: getModuleName(session.moduleId),
      status: session.completedAt
        ? session.isSuccess
          ? "Completed"
          : "Failed"
        : "In Progress",
      score:
        session.quizState?.score && session.quizState?.totalQuestions
          ? Math.round(
              (session.quizState.score / session.quizState.totalQuestions) *
                100,
            )
          : undefined,
      date: new Date(session.startedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      duration: session.totalTimeSpent,
    }));

    setRecentModules(recentModulesData);

    // Find recommended next module
    const completedModuleIds = userProgress
      .filter((p) => p.status === "completed")
      .map((p) => parseInt(p.moduleId));

    const nextModule = modules.find((m) => !completedModuleIds.includes(m.id));
    setRecommendedNext(nextModule || null);
  }, [currentUser?.id, sessionHistory]);

  const calculateStreakDays = (sessions: Session[]): number => {
    if (sessions.length === 0) return 0;

    const sessionDates = [
      ...new Set(sessions.map((s) => new Date(s.startedAt).toDateString())),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "In Progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <PlayCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressPercentage = () => {
    return Math.round((dashboardStats.completedModules / modules.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-4">
        <h1 className="mb-2 text-3xl font-bold text-black">
          {getGreeting()}, {currentUser?.name?.split(" ")[0] || "Nurse"}!
        </h1>
        <p className="text-xl text-gray-900">
          Welcome back to your Interactive External Pacemaker Training Platform
        </p>
      </div>

      {/* Recommended Next Module */}
      {recommendedNext && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-5 h-5 text-blue-600" />
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="w-full p-4 bg-white shadow-lg rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Training Time</h3>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatDuration(dashboardStats.totalTime)}
          </p>
          <p className="text-sm text-gray-600">
            {formatDuration(dashboardStats.currentWeekTime)} this week
          </p>
        </div>

        <div className="w-full p-4 bg-white shadow-lg rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Modules Completed
            </h3>
            <BookOpen className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {dashboardStats.completedModules}
          </p>
          <p className="text-sm text-gray-600">of {modules.length} modules</p>
        </div>

        <div className="w-full p-4 bg-white shadow-lg rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Average Quiz Score
            </h3>
            <Award className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(dashboardStats.averageScore)}%
          </p>
          <p className="text-sm text-gray-600">
            {dashboardStats.totalSessions} total sessions
          </p>
        </div>

        <div className="w-full p-4 bg-white shadow-lg rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(dashboardStats.successRate)}%
          </p>
          <p className="text-sm text-gray-600">
            {dashboardStats.fastestTime
              ? `Best: ${formatTime(dashboardStats.fastestTime)}`
              : "No completions yet"}
          </p>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white shadow-lg rounded-3xl">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Recent Training Sessions
              </h3>
              <Link
                to="/modules"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all modules →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentModules.length > 0 ? (
              recentModules.map((module, index) => (
                <div
                  key={`${module.id}-${index}`}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <Link
                    to={`/module/${module.id}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(module.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {module.name}
                        </h4>
                        <p className="text-xs text-gray-500">{module.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        {module.score && (
                          <span className="text-sm font-medium text-gray-700">
                            {module.score}%
                          </span>
                        )}
                        {module.duration && (
                          <span className="text-sm text-gray-500">
                            {formatTime(module.duration)}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            module.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : module.status === "Failed"
                                ? "bg-red-100 text-red-800"
                                : module.status === "In Progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {module.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No training sessions yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start your first module to see your activity here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats & Achievements */}
        <div className="space-y-6">
          {/* This Week */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-500" />
              This Week
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Training Time</span>
                <span className="font-medium">
                  {formatDuration(dashboardStats.currentWeekTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Streak</span>
                <span className="font-medium flex items-center">
                  {dashboardStats.streakDays > 0 && (
                    <Flame className="w-4 h-4 text-orange-500 mr-1" />
                  )}
                  {dashboardStats.streakDays} day
                  {dashboardStats.streakDays !== 1 ? "s" : ""}
                </span>
              </div>
              {dashboardStats.lastSessionDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Session</span>
                  <span className="font-medium">
                    {new Date(
                      dashboardStats.lastSessionDate,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-500" />
              Learning Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Completion</span>
                  <span className="font-medium">
                    {getProgressPercentage()}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>

              {moduleProgress.length > 0 && (
                <div className="space-y-2">
                  {moduleProgress.slice(0, 3).map((progress) => (
                    <div
                      key={progress.moduleId}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        Module {progress.moduleId}
                      </span>
                      <span
                        className={`font-medium ${
                          progress.status === "completed"
                            ? "text-green-600"
                            : progress.status === "in_progress"
                              ? "text-yellow-600"
                              : "text-gray-400"
                        }`}
                      >
                        {progress.status === "completed"
                          ? `${progress.bestScore}%`
                          : progress.status === "in_progress"
                            ? "In Progress"
                            : "Not Started"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
