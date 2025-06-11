import { useState } from 'react';
import { Wifi, Volume2, Bell, Moon, Globe } from 'lucide-react';
import {
  ArrowLeft,
  Bluetooth,
  HelpCircle,
  Shield, Monitor

} from "lucide-react";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notifications: true,
    darkMode: false,
    language: 'en',
    hardwareConnection: 'disconnected'
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>

      {/* Hardware Connection */}
      <div className="bg-white shadow-lg rounded-3xl mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wifi className="w-5 h-5 mr-2" />
            Hardware Connection
          </h3>

          <div className="space-y-4">
            <div className="  rounded-3xl mb-6 flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">Pacemaker Device</p>
                <p className="text-sm text-gray-500">Status: {settings.hardwareConnection}</p>
              </div>

               <div className="px-4 py-2 text-blue-700 bg-blue-200 rounded-3xl">
                status ?? chnages color if connected or not?
               </div>
            </div>


            {/* Connection Mode */}
          <div className="flex items-center justify-between p-4">
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
                    onChange={e => setSettings(prev => ({ ...prev, hardwareConnection: e.target.value }))}
                >
                    <option value="disconnected" disabled>Select mode</option>
                    <option value="pacemaker">Pacemaker Device</option>
                    <option value="simulated">Sliders to Simulate</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </div>
          </div>
            
            <div className="text-sm text-gray-600">
              <p>WebSocket URL: ws://raspberrypi.local:5001</p>
              <p>Token: secondary_app_token_456</p>
            </div>
          </div>
        </div>
      </div>


      {/*  Help & support */}
      <div className="bg-white shadow-lg rounded-3xl mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            Help & Support
          </h3>

          <div className="space-y-2">
            {/* View Tutorial */}
            <div className="flex items-center p-4 space-x-3 rounded-lg cursor-pointer hover:bg-gray-50">
                <ArrowLeft className="w-5 h-5 text-gray-600 rotate-180" />
                <span className="font-medium">View Tutorial</span>
            </div>

            {/* About PaceSim */}
            <div className="flex items-center p-4 space-x-3 rounded-lg cursor-pointer hover:bg-gray-50">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="font-medium">About PaceSim</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;