// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import Layout from "./components/Layout";
// import Dashboard from "./pages/Dashboard";
// import LoginPage from "./pages/LoginPage";
// import ProfilePage from "./pages/ProfilePage";
// import SettingsPage from "./pages/SettingsPage";
// import ModulePage from "./pages/ModulePage";
// import ModulesListPage from "./pages/ModulesListPage";
// import AboutPage from "./pages/AboutPage";
// import NotFoundPage from "./pages/NotFoundPage";
// import { useAuth } from "./hooks/useAuth";
// import DebugPage from "./pages/DebugPage";

// function App() {
//   const { isAuthenticated, logout, isLoading } = useAuth();

//   // Show loading screen while checking auth
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#E5EDF8] flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <Routes>
//         {/* Public routes */}
//         <Route
//           path="/login"
//           element={
//             isAuthenticated ? (
//               <Navigate to="/dashboard" replace />
//             ) : (
//               <LoginPage />
//             )
//           }
//         />

//         {/* Protected routes */}
//         <Route
//           path="/"
//           element={
//             isAuthenticated ? (
//               <Layout onLogout={logout} />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           }
//         >
//           <Route index element={<Navigate to="/dashboard" replace />} />
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="profile" element={<ProfilePage />} />
//           <Route path="settings" element={<SettingsPage />} />
//           <Route path="modules" element={<ModulesListPage />} />
//           <Route path="module/:moduleId" element={<ModulePage />} />
//           <Route path="about" element={<AboutPage />} />
//           <Route path="debug" element={<DebugPage />} />
//         </Route>

//         {/* 404 page */}
//         <Route path="*" element={<NotFoundPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;




import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ModulePage from "./pages/ModulePage";
import ModulesListPage from "./pages/ModulesListPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminDashboard from "./pages/AdminDashboard"; // New import
import { useAuth } from "./hooks/useAuth";
import DebugPage from "./pages/DebugPage";

function App() {
  const { isAuthenticated, logout, isLoading } = useAuth();

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
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<AdminDashboard />} /> {/* New admin route */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="modules" element={<ModulesListPage />} />
          <Route path="module/:moduleId" element={<ModulePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="debug" element={<DebugPage />} />
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;