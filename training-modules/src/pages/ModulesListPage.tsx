import { Link } from 'react-router-dom';
import { PlayCircle, CheckCircle, Clock } from 'lucide-react';

const ModulesListPage = () => {
  const modules = [
    {
      id: 1,
      title: 'Scenario 1',
      description: 'Diagnose and correct a failure to sense condition',
      status: 'completed',
      score: 92,
      duration: '15 min'
    },
    {
      id: 2,
      title: 'Scenario 2',
      description: 'Diagnose and correct scenario for notes: failure to capture, oversensing module',
      status: 'in-progress',
      score: null,
      duration: '20 min'
    },
    {
      id: 3,
      title: 'Scenario 3',
      description: 'Diagnose and correct scenario for notes: failure to sense, undersensing module',
      status: 'not-started',
      score: null,
      duration: '15 min'
    },
    {
      id: 4,
      title: 'Capture Calibration',
      description: 'Learn to correctly capture',
      status: 'not-started',
      score: null,
      duration: '25 min'
    },
    {
      id: 5,
      title: 'Failure to Capture',
      description: 'Correct a failure to capture',
      status: 'not-started',
      score: null,
      duration: '20 min'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <PlayCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, score: number | null) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed {score && `- ${score}%`}
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Started
          </span>
        );
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Training Modules</h2>

      <div className="grid gap-6">
        {modules.map((module) => (
          <Link
            key={module.id}
            to={`/module/${module.id}`}
            className="w-full py- px- bg-white shadow-lg rounded-3xl"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center h-7">{getStatusIcon(module.status)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      Module {module.id}: {module.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{module.description}</p>
                    <p className="mt-2 text-sm text-gray-400">
                      Estimated duration: {module.duration}
                    </p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(module.status, module.score)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ModulesListPage;