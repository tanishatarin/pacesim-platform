import { Link } from 'react-router-dom';
import { Home, ArrowLeft, HelpCircle } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#E5EDF8] flex items- justify-center">
      <div className="text-center">
        
        <div className="flex items-center justify-center space-x-2 p-8">
          <HelpCircle className="w-10 h-10" />
          <h2 className="text-3xl font-semibold text-gray-900">
            About Pacemaker Simulator!
          </h2>
        </div>
        <p className="text-gray-600 mt-2 p-4">
            🚧 This page is being built!🚧 
        </p>
        <p className="text-gray-600 mt-2 p-4">
            Come back later to see who built this, what it's form, and how cool it is!! 
        </p>
        
        <div className="mt-8 flex justify-center space-x-4 p-4 ">
          <Link
            to="/dashboard"
            className="shadow-lg rounded-3xl inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Home className="w-4 h-4 mr-2 " />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="shadow-lg rounded-3xl bg-white inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;