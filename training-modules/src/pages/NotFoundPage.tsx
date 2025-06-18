import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#E5EDF8] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex justify-center space-x-4">
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

export default NotFoundPage;
