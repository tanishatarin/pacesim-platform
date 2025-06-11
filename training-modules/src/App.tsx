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

function App() {
  // Simple auth state - replace with proper auth context later
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <LoginPage onLogin={() => setIsAuthenticated(true)} />
          } 
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? 
              <Layout onLogout={() => setIsAuthenticated(false)} /> : 
              <Navigate to="/login" replace />
          }
        >
          {/* Nested routes with Layout */}
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
    </Router>
  );
}

export default App;