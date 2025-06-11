import { User, Mail, Calendar, Award } from 'lucide-react';

const ProfilePage = () => {
  // Mock user data - replace with real data later
  const user = {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.edu',
    role: 'Cardiology Fellow',
    institution: 'Johns Hopkins Hospital',
    joinDate: '2024-01-15',
    stats: {
      modulesCompleted: 3,
      totalTrainingTime: '12.5 hrs',
      averageScore: '85%',
      lastActive: 'Yesterday'
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Profile</h2>

      {/* User Info Card */}
      <div className="bg-white shadow-lg rounded-3xl mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.role}</p>
              <p className="text-sm text-gray-500">{user.institution}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Joined {new Date(user.joinDate).toLocaleDateString()}</span>
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
              <p className="text-2xl font-bold text-gray-900">{user.stats.modulesCompleted}</p>
              <p className="text-sm text-gray-500">Modules Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.stats.totalTrainingTime}</p>
              <p className="text-sm text-gray-500">Training Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.stats.averageScore}</p>
              <p className="text-sm text-gray-500">Average Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.stats.lastActive}</p>
              <p className="text-sm text-gray-500">Last Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;