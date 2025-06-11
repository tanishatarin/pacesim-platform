// import { useState } from 'react'
// import ECGVisualizer from './components/ECGVisualizer'

// function App() {
//   const [currentPage, setCurrentPage] = useState('home')

//   const renderPage = () => {
//     switch (currentPage) {
//       case 'home':
//         return (
//           <div className="min-h-screen bg-[#E5EDF8] p-6">
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-white p-8 rounded-3xl shadow-lg">
//                 <h1 className="text-3xl font-bold mb-2 text-black">
//                   Welcome to the Pacemaker Simulator!
//                 </h1>
//                 <p className="text-xl text-gray-900 mb-8">
//                   External Pacemaker Simulation Platform
//                 </p>
                
//                 <div>
//                   <h2 className="text-xl font-semibold mb-4">Modules:</h2>
//                   <div className="space-y-3">
//                     <div className="p-4 bg-[#F0F6FE] hover:bg-blue-100 transition-colors duration-200 rounded-lg cursor-pointer">
//                       <div className="flex justify-between">
//                         <p className="font-medium text-gray-900">
//                           Module 1: Scenario 1
//                         </p>
//                       </div>
//                       <p className="text-sm text-gray-600 mb-2">
//                         Diagnose and correct a failure to sense condition
//                       </p>
//                       <button 
//                         onClick={() => setCurrentPage('module1')}
//                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                       >
//                         Start Module
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )
      
//       case 'module1':
//         return (
//           <div className="min-h-screen bg-[#E5EDF8] p-6">
//             <div className="max-w-6xl mx-auto">
//               <div className="bg-white p-8 rounded-3xl shadow-lg">
//                 <div className="flex items-start justify-between mb-8">
//                   <h2 className="text-2xl font-bold">Module 1: Scenario 1</h2>
//                   <button 
//                     onClick={() => setCurrentPage('home')}
//                     className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded"
//                   >
//                     ← Back to Home
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-3 gap-8">
//                   {/* Left side - Instructions and ECG */}
//                   <div className="col-span-2 space-y-4">
//                     <div className="bg-[#F0F6FE] rounded-xl p-4">
//                       <h3 className="mb-2 font-bold">Objective:</h3>
//                       <p className="whitespace-pre-line">
//                         Diagnose and correct a failure to sense condition. Answer the multiple choice at the bottom and then adjust the pacemaker.
//                         {'\n'}Scenario: You come back into a patient's room the next day and see this pattern on their ECG. Their heart rate has dropped to 40 and attached to the patient, you have A leads.
//                       </p>
//                     </div>

//                     <div className="p-2 rounded-xl text-sm bg-yellow-100 text-yellow-800">
//                       Simulated Mode Active
//                     </div>

//                     {/* ECG Display */}
//                     <div className="mt-6">
//                       <ECGVisualizer
//                         rate={40}
//                         aOutput={5}
//                         vOutput={5}
//                         sensitivity={1}
//                         mode="sensitivity"
//                       />
//                       <div className="py-1 mt-2 text-xs text-center text-yellow-700 rounded-lg bg-yellow-50">
//                         Simulated ECG - Connect hardware for real data
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right side - Controls and Status */}
//                   <div className="space-y-6">
//                     <div className="bg-[#F0F6FE] rounded-xl p-4">
//                       <h3 className="mb-4 font-bold">Sensing Lights:</h3>
//                       <div className="flex justify-around">
//                         <div className="flex flex-col items-center">
//                           <div className="w-16 h-16 rounded-full bg-green-400" />
//                           <span className="mt-2 text-sm text-gray-600">Left</span>
//                         </div>
//                         <div className="flex flex-col items-center">
//                           <div className="w-16 h-16 rounded-full bg-blue-400" />
//                           <span className="mt-2 text-sm text-gray-600">Right</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-[#F0F6FE] rounded-xl p-4 h-32">
//                       <h3 className="mb-2 font-bold">Patient HR</h3>
//                       <div className="flex justify-center">
//                         <span className="text-5xl text-gray-600 font">40</span>
//                       </div>
//                     </div>

//                     <div className="bg-[#F0F6FE] rounded-xl p-4 h-32">
//                       <h3 className="mb-2 font-bold">Patient Blood Pressure</h3>
//                       <div className="flex justify-center">
//                         <span className="text-5xl text-gray-600 font">120/80</span>
//                       </div>
//                     </div>

//                     <div className="bg-[#F0F6FE] rounded-xl p-4 h-32">
//                       <h3 className="mb-2 font-bold">Pacemaker HR</h3>
//                       <div className="flex justify-center">
//                         <span className="text-5xl text-gray-600 font">40</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )
      
//       default:
//         return <div>Page not found</div>
//     }
//   }

//   return renderPage()
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
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;