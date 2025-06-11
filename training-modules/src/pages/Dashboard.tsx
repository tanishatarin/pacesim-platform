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
                  {module.score !== '-' ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          module.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-700'
                            : parseInt(module.score) >= 85
                            ? 'bg-green-100 text-green-800'
                            : parseInt(module.score) >= 70
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-800'
                        }
                      `}
                    >
                      {module.score}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                      -
                    </span>
                  )}
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