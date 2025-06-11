import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [institution, setInstitution] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isLogin && (role === '' || institution === '')) {
      // no error bc these fields are optional :)
      return;
    }

    // TODO: Add actual authentication logic
    onLogin();
    navigate('/dashboard');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setRole('');
    setInstitution('');
  };

  return (
    <div className="min-h-screen bg-[#E5EDF8] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            PaceSim
          </h1>
          <p className="text-gray-600">
            External Pacemaker Simulation Platform
          </p>
        </div>
        
        <div className="bg-white px-8 py-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
              />
            </div>

            {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                className="w-full p-2 border rounded-md"
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                placeholder="Enter your name"

              />
            </div>
          )}
          
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role/Title
              </label>
              <input
                id="role"
                type="text"
                className="w-full p-2 border rounded-md"
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Cardiac Nurse"
              />
            </div>
          )}
          
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="institution" className="text-sm font-medium">
                Institution
              </label>
              <input
                id="institution"
                type="text"
                className="w-full p-2 border rounded-md"
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g., Johns Hopkins Hospital"
              />
            </div>
          )}

            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirm-password" className="block mb-1 text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-600 rounded-lg bg-red-50">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md shadow hover:bg-blue-700"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-sm text-center text-gray-500">
          © {new Date().getFullYear()} PaceSim. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;