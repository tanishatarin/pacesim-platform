// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useState } from 'react';
// import Layout from './components/Layout';
// import Dashboard from './pages/Dashboard';
// import LoginPage from './pages/LoginPage';
// import ProfilePage from './pages/ProfilePage';
// import SettingsPage from './pages/SettingsPage';
// import ModulePage from './pages/ModulePage';
// import ModulesListPage from './pages/ModulesListPage';
// import AboutPage from './pages/AboutPage';
// import NotFoundPage from './pages/NotFoundPage';
// import { useAuth } from "./hooks/useAuth";
// import db from './lib/db';

// function App() {
//   const [showDebug, setShowDebug] = useState(false);
//   const { isAuthenticated, currentUser, logout } = useAuth();

//   return (
//     <Router>
//       <Routes>
//         <Route 
//           path="/login" 
//           element={
//             isAuthenticated ? 
//               <Navigate to="/dashboard" replace /> : 
//               <LoginPage />
//           } 
//         />

//         <Route
//           path="/"
//           element={
//             isAuthenticated ? 
//               <Layout onLogout={logout} /> : 
//               <Navigate to="/login" replace />
//           }
//         >
//           <Route index element={<Navigate to="/dashboard" replace />} />
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="profile" element={<ProfilePage />} />
//           <Route path="settings" element={<SettingsPage />} />
//           <Route path="modules" element={<ModulesListPage />} />
//           <Route path="module/:moduleId" element={<ModulePage />} />
//           <Route path="about" element={<AboutPage />} />
//         </Route>

//         <Route path="*" element={<NotFoundPage />} />
//       </Routes>

//       {/* Debug panel */}
//       {showDebug && (
//         <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-auto">
//           <div className="flex justify-between items-center mb-2">
//             <h3 className="font-bold">Database Data</h3>
//             <button onClick={() => setShowDebug(false)} className="text-gray-500">×</button>
//           </div>
//           <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
//             {JSON.stringify(db.data, null, 2)}
//           </pre>
//           <button 
//             onClick={() => {localStorage.clear(); window.location.reload();}} 
//             className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2"
//           >
//             Clear All Data
//           </button>
//         </div>
//       )}

//       <button 
//         onClick={() => setShowDebug(!showDebug)}
//         className="fixed bottom-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm"
//       >
//         {showDebug ? 'Hide' : 'Show'} Debug
//       </button>
//     </Router>
//   );
// }

// export default App;












import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ModulePage from './pages/ModulePage';
import ModulesListPage from './pages/ModulesListPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from "./hooks/useAuth";
import db from './lib/db';

function App() {
  const [showDebug, setShowDebug] = useState(false);
  const { isAuthenticated, currentUser, logout, isLoading } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E5EDF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <LoginPage />
          } 
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? 
              <Layout onLogout={logout} /> : 
              <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="modules" element={<ModulesListPage />} />
          <Route path="module/:moduleId" element={<ModulePage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Debug panel */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-auto z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Database Data</h3>
            <button onClick={() => setShowDebug(false)} className="text-gray-500">×</button>
          </div>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(db.data, null, 2)}
          </pre>
          <div className="mt-2 text-xs text-gray-600">
            <p><strong>Current User:</strong> {currentUser?.name || 'None'}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.clear(); 
              window.location.reload();
            }} 
            className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2 w-full"
          >
            Clear All Data
          </button>
        </div>
      )}

      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm z-40"
      >
        {showDebug ? 'Hide' : 'Show'} Debug
      </button>
    </Router>
  );
}

export default App;