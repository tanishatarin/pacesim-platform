import { Link } from 'react-router-dom';
import { Clock, Award, TrendingUp, BookOpen } from 'lucide-react';

const Dashboard = () => {
  // Mock data - replace with real data later
  const stats = {
    totalTime: '12.5 hrs',
    completedModules: 3,
    averageScore: '85%',
    lastSession: 'Yesterday'
  };

  const recentModules = [
    { id: 1, name: 'Scenario 1', status: 'Completed', score: '92%' },
    { id: 2, name: 'Scenario 2', status: 'In Progress', score: '-' },
    { id: 3, name: 'Scenario 3', status: 'Not Started', score: '-' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-black">
          Welcome to the Pacemaker Simulator!
        </h1>
        <p className="text-xl text-gray-900">
          External Pacemaker Simulation Platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="w-full p-8 bg-white shadow-lg rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Training Time</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTime}</p>
        </div>

        <div className="w-full p-8 bg-white shadow-lg rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Modules Completed</h3>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completedModules}</p>
        </div>

        <div className="w-full p-8 bg-white shadow-lg rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.averageScore}</p>
        </div>

        <div className="w-full p-8 bg-white shadow-lg rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Last Session</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.lastSession}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="w-full px-4 py-3 bg-white shadow-lg rounded-3xl">
        <div className="px-4 py-4 border-b"> 
          <h3 className="text-lg font-bold text-gray-900">Recent Modules</h3>
        </div>
        <div className="divide-y divide-gray-200 p">
          {recentModules.map((module) => (
            <div key={module.id} className="px-4 py-4 hover:bg-gray-50">
              <Link to={`/module/${module.id}`} className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Module {module.id}: {module.name}</h4>
                  <p className="text-sm text-gray-500">Status: {module.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{module.score}</p>
                  <p className="text-sm text-gray-500">Score</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="px-4 py-4">
          <Link
            to="/modules"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all modules →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





// import { useNavigate } from 'react-router-dom';

// const Dashboard = () => {
//   const navigate = useNavigate();

//   const modules = [
//     { id: 1, title: 'Scenario 1' },
//     { id: 2, title: 'Scenario 2' },
//     { id: 3, title: 'Scenario 3' },
//     { id: 4, title: 'Capture Calibration' },
//     { id: 5, title: 'Failure to Capture' },
//   ];

//   return (
//     <div className="w-full p-8 bg-white shadow-lg rounded-3xl">
//       {/* Header Section */}
//       <div className="mb-12">
//         <h1 className="mb-2 text-3xl font-bold text-black">
//           Welcome to the Pacemaker Simulator!
//         </h1>
//         <p className="text-xl text-gray-900">
//           External Pacemaker Simulation Platform
//         </p>
//       </div>

//       {/* Modules Section */}
//       <div>
//         <h2 className="mb-4 text-xl font-semibold">Modules:</h2>
//         <div className="space-y-3">
//           {modules.map((module) => (
//             <div
//               key={module.id}
//               className="p-4 bg-[#F0F6FE] hover:bg-blue-100 transition-colors duration-200 rounded-lg cursor-pointer"
//               onClick={() => navigate(`/module/${module.id}`)}
//             >
//               <p className="font-medium text-gray-900">
//                 Module {module.id}: {module.title}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;