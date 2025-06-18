import { useState, useEffect } from 'react';
import {
  HelpCircle,
  Shield, 
  Monitor, 
  BookHeart, 
  Wifi,
  Volume2,
  Bell,
  LogOut,
  User,
  ChevronRight
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notifications: true,
    darkMode: false,
    language: 'en',
    hardwareConnection: 'disconnected'
  });

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedConnectionMode = localStorage.getItem('connectionMode');
    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    const savedNotifications = localStorage.getItem('notifications');
    
    if (savedConnectionMode) {
      setSettings(prev => ({
        ...prev,
        hardwareConnection: savedConnectionMode
      }));
    }
    
    if (savedSoundEnabled) {
      setSettings(prev => ({
        ...prev,
        soundEnabled: JSON.parse(savedSoundEnabled)
      }));
    }
    
    if (savedNotifications) {
      setSettings(prev => ({
        ...prev,
        notifications: JSON.parse(savedNotifications)
      }));
    }
  }, []);

  const handleConnectionModeChange = (newMode: string) => {
    setSettings(prev => ({
      ...prev,
      hardwareConnection: newMode
    }));
    
    // Save to localStorage so ModulePage can access it
    localStorage.setItem('connectionMode', newMode);
    
    // Trigger storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'connectionMode',
      newValue: newMode
    }));
  };

  const handleToggle = (setting: keyof typeof settings) => {
    const newValue = !settings[setting];
    setSettings(prev => ({
      ...prev,
      [setting]: newValue
    }));
    
    // Save to localStorage
    localStorage.setItem(setting, JSON.stringify(newValue));
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-black">
          Settings
        </h1>
        <p className="text-xl text-gray-900">
          Configure your PaceSim preferences
        </p>
      </div>

      {/* Hardware Connection */}
      <div className="w-full px-8 py-6 bg-white shadow-lg rounded-3xl mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Wifi className="w-5 h-5 mr-2 text-blue-600" />
          Hardware Connection
        </h3>

        {/* Pacemaker Device Status */}
        <div className="flex items-center justify-between p-4 mb-4">
          <div className="flex items-center space-x-3">
            <BookHeart className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Pacemaker Device</p>
              <p className="text-sm text-gray-500">
                Current Status: {settings.hardwareConnection}
              </p>
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-3xl font-medium text-sm ${
              settings.hardwareConnection === "pacemaker"
                ? "bg-green-100 text-green-700"
                : settings.hardwareConnection === "simulated"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
            }`}
          >
            {settings.hardwareConnection === "pacemaker"
              ? "Hardware Connected"
              : settings.hardwareConnection === "simulated"
                ? "Simulation Mode"
                : "Disconnected"}
          </div>
        </div>

        {/* Connection Mode Selector */}
        <div className="flex items-center justify-between p-4 mb-4">
          <div className="flex items-center space-x-3">
            <Monitor className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Connection Mode</span>
          </div>
          <div className="relative w-48">
            <select
              name="connection_mode"
              id="mode"
              className="block w-full appearance-none bg-white border border-gray-300 text-gray-900 py-2 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={settings.hardwareConnection}
              onChange={(e) => handleConnectionModeChange(e.target.value)}
            >
              <option value="disconnected">Disconnected</option>
              <option value="pacemaker">Pacemaker Device</option>
              <option value="simulated">Simulation Mode</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Connection Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>WebSocket URL:</strong> ws://raspberrypi.local:5001
            </p>
            <p>
              <strong>Auth Token:</strong> secondary_app_token_456
            </p>
            {settings.hardwareConnection === "disconnected" && (
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-gray-600">
                  No connection established
                </span>
              </div>
            )}
            {settings.hardwareConnection === "pacemaker" && (
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-600">
                  Connected to hardware device
                </span>
              </div>
            )}
            {settings.hardwareConnection === "simulated" && (
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-blue-600">
                  Using simulation controls in modules
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="w-full px-8 py-6 bg-white shadow-lg rounded-3xl mb-6">
        <div className="flex items-center mb-6">
          <HelpCircle className="w-6 h-6 mr-3 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Help & Support</h3>
        </div>

        <div className="space-y-4">
          {/* View Tutorial */}
          <div className="p-4 bg-[#F0F6FE] rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-bold text-gray-900">View Tutorial</span>
                  <p className="text-sm text-gray-600">Learn how to use PaceSim effectively</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* About PaceSim */}
          <div 
            onClick={() => navigate('/about')}
            className="p-4 bg-[#F0F6FE] rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-bold text-gray-900">About PaceSim</span>
                  <p className="text-sm text-gray-600">Version info and credits</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="w-full px-8 py-6 bg-white shadow-lg rounded-3xl border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Debug Info</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Connection Mode:</strong> {settings.hardwareConnection}</p>
            <p><strong>Sound Enabled:</strong> {settings.soundEnabled ? 'Yes' : 'No'}</p>
            <p><strong>Notifications:</strong> {settings.notifications ? 'Yes' : 'No'}</p>
            <p><strong>LocalStorage Keys:</strong></p>
            <ul className="ml-4 list-disc space-y-1">
              <li>connectionMode: {localStorage.getItem('connectionMode') || 'not set'}</li>
              <li>soundEnabled: {localStorage.getItem('soundEnabled') || 'not set'}</li>
              <li>notifications: {localStorage.getItem('notifications') || 'not set'}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;