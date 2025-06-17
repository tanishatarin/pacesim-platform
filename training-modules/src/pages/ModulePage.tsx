import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';
import ECGVisualizer from '../components/ECGVisualizer';
import MultipleChoiceQuiz from '../components/MultipleChoiceQuiz';

interface ModuleConfig {
  title: string;
  objective: string;
  mode: "sensitivity" | "oversensing" | "undersensing" | "capture_module" | "failure_to_capture";
  initialParams: {
    rate: number;
    aOutput: number;
    vOutput: number;
    aSensitivity: number;
    vSensitivity: number;
  };
  controlsNeeded: {
    rate: boolean;
    aOutput: boolean;
    vOutput: boolean;
    aSensitivity: boolean;
    vSensitivity: boolean;
  };
}

// Custom slider component with variable step sizes
const CustomSlider = ({ 
  label, 
  value, 
  onChange, 
  type 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void;
  type: 'aOutput' | 'vOutput' | 'rate' | 'aSensitivity' | 'vSensitivity';
}) => {
  const getStepSize = (currentValue: number, type: string) => {
    switch (type) {
      case 'aOutput':
        if (currentValue <= 0.4) return 0.1;
        if (currentValue <= 1.0) return 0.2;
        if (currentValue <= 5.0) return 0.5;
        return 1.0;
      
      case 'vOutput':
        if (currentValue <= 0.4) return 0.1;
        if (currentValue <= 1.0) return 0.2;
        if (currentValue <= 5.0) return 0.5;
        return 1.0;
      
      case 'rate':
        if (currentValue <= 50) return 5;
        if (currentValue <= 100) return 2;
        if (currentValue <= 170) return 5;
        return 6;
      
      case 'aSensitivity':
        if (currentValue >= 3) return 1;
        if (currentValue >= 2) return 0.5;
        if (currentValue >= 0.8) return 0.2;
        return 0.1;
      
      case 'vSensitivity':
        if (currentValue >= 10) return 2;
        if (currentValue >= 3) return 1;
        if (currentValue >= 1) return 0.5;
        return 0.2;
      
      default:
        return 0.1;
    }
  };

  const getRange = (type: string) => {
    switch (type) {
      case 'aOutput': return { min: 0.1, max: 20.0 };
      case 'vOutput': return { min: 0.1, max: 25.0 };
      case 'rate': return { min: 30, max: 180 };
      case 'aSensitivity': return { min: 0.4, max: 10 };
      case 'vSensitivity': return { min: 0.8, max: 20 };
      default: return { min: 0, max: 100 };
    }
  };

  const range = getRange(type);
  const step = getStepSize(value, type);

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(range.max, value + step);
    onChange(parseFloat(newValue.toFixed(1)));
  }, [value, step, range.max, onChange]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(range.min, value - step);
    onChange(parseFloat(newValue.toFixed(1)));
  }, [value, step, range.min, onChange]);

  const getUnit = (type: string) => {
    switch (type) {
      case 'aOutput':
      case 'vOutput': return 'mA';
      case 'rate': return 'BPM';
      case 'aSensitivity':
      case 'vSensitivity': return 'mV';
      default: return '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}: <span className="font-mono text-blue-600">{value} {getUnit(type)}</span>
      </label>
      <div className="flex items-center space-x-3">
        <button
          onClick={handleDecrement}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
          disabled={value <= range.min}
        >
          −
        </button>
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <button
          onClick={handleIncrement}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
          disabled={value >= range.max}
        >
          +
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{range.min} {getUnit(type)}</span>
        <span>{range.max} {getUnit(type)}</span>
      </div>
    </div>
  );
};

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [quizPassed, setQuizPassed] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  
  // Get connection mode from localStorage (set in settings)
  const [connectionMode, setConnectionMode] = useState(() => {
    return localStorage.getItem('connectionMode') || 'disconnected';
  });
  
  const isConnected = connectionMode === 'pacemaker';
  const isSimulated = connectionMode === 'simulated';
  
  // Module configurations
  const moduleConfigs: Record<string, ModuleConfig> = {
    '1': {
      title: 'Scenario 1: Bradycardia Management',
      objective: 'Diagnose and correct a failure to sense condition. Complete the knowledge check and then adjust the pacemaker.\n\nScenario: You return to a patient\'s room and observe this ECG pattern. Their heart rate has dropped to 40 BPM and atrial leads are connected.',
      mode: 'sensitivity',
      initialParams: { rate: 40, aOutput: 2, vOutput: 3, aSensitivity: 1, vSensitivity: 2 },
      controlsNeeded: { rate: true, aOutput: true, vOutput: false, aSensitivity: true, vSensitivity: false }
    },
    '2': {
      title: 'Scenario 2: Oversensing Issues',
      objective: 'Identify and correct oversensing problems that are causing inappropriate pacing inhibition.\n\nScenario: The pacemaker is detecting signals that shouldn\'t inhibit pacing.',
      mode: 'oversensing',
      initialParams: { rate: 70, aOutput: 5, vOutput: 5, aSensitivity: 4, vSensitivity: 4 },
      controlsNeeded: { rate: true, aOutput: true, vOutput: true, aSensitivity: true, vSensitivity: true }
    },
    '3': {
      title: 'Scenario 3: Undersensing Problems',
      objective: 'Correct undersensing issues where the pacemaker fails to detect intrinsic cardiac activity.\n\nScenario: The pacemaker is not sensing the patient\'s own heartbeats.',
      mode: 'undersensing',
      initialParams: { rate: 60, aOutput: 5, vOutput: 5, aSensitivity: 0.5, vSensitivity: 0.8 },
      controlsNeeded: { rate: true, aOutput: false, vOutput: true, aSensitivity: true, vSensitivity: true }
    },
    '4': {
      title: 'Capture Calibration Module',
      objective: 'Learn to establish and verify proper cardiac capture.\n\nScenario: Practice adjusting output levels to achieve consistent capture.',
      mode: 'capture_module',
      initialParams: { rate: 80, aOutput: 3, vOutput: 2, aSensitivity: 2, vSensitivity: 2 },
      controlsNeeded: { rate: true, aOutput: true, vOutput: true, aSensitivity: false, vSensitivity: false }
    },
    '5': {
      title: 'Failure to Capture',
      objective: 'Diagnose and correct failure to capture situations.\n\nScenario: Pacing spikes are present but not followed by cardiac depolarization.',
      mode: 'failure_to_capture',
      initialParams: { rate: 70, aOutput: 1, vOutput: 1, aSensitivity: 2, vSensitivity: 2 },
      controlsNeeded: { rate: true, aOutput: true, vOutput: true, aSensitivity: false, vSensitivity: false }
    }
  };

  const currentModule = moduleId ? moduleConfigs[moduleId] : undefined;
  
  // Pacemaker parameters - initialize with currentModule's initial params
  const [pacemakerParams, setPacemakerParams] = useState(() => {
    return currentModule?.initialParams || {
      rate: 60,
      aOutput: 5,
      vOutput: 5,
      aSensitivity: 2,
      vSensitivity: 2
    };
  });
  
  // Sensor states - only flash when conditions are met
  const [sensorStates, setSensorStates] = useState({
    left: false,
    right: false
  });

  // ✅ FIXED: Only initialize module parameters when moduleId changes
  useEffect(() => {
    if (currentModule) {
      setPacemakerParams(currentModule.initialParams);
    }
  }, [moduleId]); // ✅ Only depend on moduleId

  useEffect(() => {
  if (!currentModule) return;

  const leftShouldFlash = pacemakerParams.aOutput > 0 && pacemakerParams.aSensitivity > 0;
  const rightShouldFlash = pacemakerParams.vOutput > 0 && pacemakerParams.vSensitivity > 0;

  // ✅ Prevent infinite loop: only update if changed
  setSensorStates((prev) => {
    if (
      prev.left === leftShouldFlash &&
      prev.right === rightShouldFlash
    ) {
      return prev; // no change → no re-render
    }
    return {
      left: leftShouldFlash,
      right: rightShouldFlash,
    };
  });
}, [
  pacemakerParams.aOutput,
  pacemakerParams.aSensitivity,
  pacemakerParams.vOutput,
  pacemakerParams.vSensitivity,
  currentModule
]);


  // ✅ FIXED: Listen for connection mode changes - only run once
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'connectionMode') {
        setConnectionMode(e.newValue || 'disconnected');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check initial value
    const initialMode = localStorage.getItem('connectionMode') || 'disconnected';
    setConnectionMode(initialMode);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // ✅ Empty dependency array - only run once

  if (!currentModule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Module Not Found</h2>
          <p className="text-gray-600 mb-4">The requested module could not be found.</p>
          <button
            onClick={() => navigate('/modules')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Modules
          </button>
        </div>
      </div>
    );
  }

  const handleQuizComplete = useCallback((passed: boolean, score: number, totalQuestions: number) => {
    setQuizPassed(passed);
    console.log('Quiz completed:', { passed, score, totalQuestions, moduleId });
  }, [moduleId]);

  const handleComplete = useCallback((success: boolean) => {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    setIsSuccess(success);
    setShowCompletion(true);
    
    console.log('Module completed:', {
      moduleId,
      success,
      duration: sessionDuration,
      quizPassed,
      finalParams: pacemakerParams,
      connectionMode
    });
  }, [sessionStartTime, moduleId, quizPassed, pacemakerParams, connectionMode]);

  const handleParameterChange = useCallback((param: string, value: number) => {
    setPacemakerParams(prev => ({
      ...prev,
      [param]: value
    }));
    
    // TODO: Send to WebSocket if connected
    if (isConnected) {
      console.log('Sending to hardware:', { [param]: value });
    }
  }, [isConnected]);

  const getHint = useCallback(() => {
    const hints: Record<string, string> = {
      '1': 'Try decreasing the pacing rate first to see the intrinsic rhythm, then adjust sensitivity.',
      '2': 'Look for inappropriate sensing. Consider decreasing sensitivity or checking for interference.',
      '3': 'The pacemaker isn\'t seeing the patient\'s beats. Try increasing sensitivity.',
      '4': 'Gradually increase output until you see consistent capture after each pacing spike.',
      '5': 'No capture despite pacing spikes. Increase the output or check lead connections.'
    };
    
    return hints[moduleId || ''] || 'Review the ECG pattern and think about what adjustments might help.';
  }, [moduleId]);

  return (
    <>
      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-lg text-center">
            <div className="flex flex-col items-center justify-center py-6">
              {isSuccess ? (
                <>
                  <CheckCircle className="w-24 h-24 mb-6 text-green-500" />
                  <h2 className="mb-4 text-3xl font-bold">Module Completed!</h2>
                  <p className="mb-8 text-lg text-gray-600">
                    Excellent work! You've successfully completed {currentModule.title}.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-800 text-sm">
                      <strong>Session Summary:</strong><br />
                      Quiz Passed: {quizPassed ? '✅' : '❌'}<br />
                      Connection Mode: {connectionMode}<br />
                      Duration: {Math.floor((Date.now() - sessionStartTime) / 60000)} minutes
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-24 h-24 mb-6 text-red-500" />
                  <h2 className="mb-4 text-3xl font-bold">Keep Practicing!</h2>
                  <p className="mb-8 text-lg text-gray-600">
                    No worries! This module can be challenging. Review the concepts and try again.
                  </p>
                </>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/modules')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Return to Modules
                </button>
                <button
                  onClick={() => {
                    setShowCompletion(false);
                    setQuizPassed(false);
                    setPacemakerParams(currentModule.initialParams);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Module Content */}
      <div className="w-full px-8 py-8 bg-white shadow-lg rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Module {moduleId}: {currentModule.title}
            </h2>
            
            {/* Connection Status */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : isSimulated
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Hardware Connected
                </>
              ) : isSimulated ? (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Simulation Mode
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Disconnected
                </>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => alert(getHint())}
            className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center hover:bg-blue-200 ml-4"
            title="Get a hint"
          >
            <Lightbulb className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="col-span-2 space-y-6">
            {/* Objective */}
            <div className="bg-[#F0F6FE] rounded-xl p-6">
              <h3 className="mb-3 font-bold text-lg">Objective:</h3>
              <p className="whitespace-pre-line text-gray-700">{currentModule.objective}</p>
            </div>

            {/* ECG Display */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">ECG Monitor</h3>
              <ECGVisualizer
                rate={pacemakerParams.rate}
                aOutput={pacemakerParams.aOutput}
                vOutput={pacemakerParams.vOutput}
                sensitivity={pacemakerParams.aSensitivity}
                mode={currentModule.mode}
              />
            </div>

            {/* Quiz Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Knowledge Assessment</h3>
              <MultipleChoiceQuiz
                moduleId={parseInt(moduleId || '1')}
                onComplete={handleQuizComplete}
              />
            </div>

            {/* Simulation Controls - Show below quiz when in simulation mode and quiz passed */}
            {isSimulated && quizPassed && (
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="font-bold text-lg mb-6 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
                  Simulation Controls
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentModule.controlsNeeded.rate && (
                    <CustomSlider
                      label="Pacing Rate"
                      value={pacemakerParams.rate}
                      onChange={(value) => handleParameterChange('rate', value)}
                      type="rate"
                    />
                  )}
                  {currentModule.controlsNeeded.aOutput && (
                    <CustomSlider
                      label="Atrial Output"
                      value={pacemakerParams.aOutput}
                      onChange={(value) => handleParameterChange('aOutput', value)}
                      type="aOutput"
                    />
                  )}
                  {currentModule.controlsNeeded.vOutput && (
                    <CustomSlider
                      label="Ventricular Output"
                      value={pacemakerParams.vOutput}
                      onChange={(value) => handleParameterChange('vOutput', value)}
                      type="vOutput"
                    />
                  )}
                  {currentModule.controlsNeeded.aSensitivity && (
                    <CustomSlider
                      label="Atrial Sensitivity"
                      value={pacemakerParams.aSensitivity}
                      onChange={(value) => handleParameterChange('aSensitivity', value)}
                      type="aSensitivity"
                    />
                  )}
                  {currentModule.controlsNeeded.vSensitivity && (
                    <CustomSlider
                      label="Ventricular Sensitivity"
                      value={pacemakerParams.vSensitivity}
                      onChange={(value) => handleParameterChange('vSensitivity', value)}
                      type="vSensitivity"
                    />
                  )}
                </div>
                
                {/* Real-time parameter display */}
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-gray-700 mb-3">Current Parameters:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Rate:</span>
                      <span className="ml-2 font-mono font-medium">{pacemakerParams.rate} BPM</span>
                    </div>
                    <div>
                      <span className="text-gray-500">A Output:</span>
                      <span className="ml-2 font-mono font-medium">{pacemakerParams.aOutput} mA</span>
                    </div>
                    <div>
                      <span className="text-gray-500">V Output:</span>
                      <span className="ml-2 font-mono font-medium">{pacemakerParams.vOutput} mA</span>
                    </div>
                    <div>
                      <span className="text-gray-500">A Sens:</span>
                      <span className="ml-2 font-mono font-medium">{pacemakerParams.aSensitivity} mV</span>
                    </div>
                    <div>
                      <span className="text-gray-500">V Sens:</span>
                      <span className="ml-2 font-mono font-medium">{pacemakerParams.vSensitivity} mV</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Sensing Lights */}
            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-4 font-bold">Sensing Status</h3>
              <div className="flex justify-around">
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full transition-all duration-300 ${
                    sensorStates.left 
                      ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' 
                      : 'bg-gray-300'
                  }`} />
                  <span className="mt-2 text-sm text-gray-600">Atrial</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full transition-all duration-300 ${
                    sensorStates.right 
                      ? 'bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50' 
                      : 'bg-gray-300'
                  }`} />
                  <span className="mt-2 text-sm text-gray-600">Ventricular</span>
                </div>
              </div>
            </div>

            {/* Vital Signs */}
            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Patient HR</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">{pacemakerParams.rate}</span>
                <span className="text-lg text-gray-500 ml-1">BPM</span>
              </div>
            </div>

            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Blood Pressure</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">120/80</span>
                <span className="text-lg text-gray-500 ml-1">mmHg</span>
              </div>
            </div>

            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Pacemaker Rate</h3>
              <div className="text-center">
                <span className="text-4xl font-mono text-gray-700">{pacemakerParams.rate}</span>
                <span className="text-lg text-gray-500 ml-1">BPM</span>
              </div>
            </div>

            {/* Action Buttons */}
            {quizPassed && (
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => handleComplete(false)}
                  className="w-full py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  End Session
                </button>
                <button 
                  onClick={() => handleComplete(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete Module
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button 
            onClick={() => navigate('/modules')}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Module List
          </button>
        </div>
      </div>

      {/* Add some custom CSS for the sliders */}
      <style>
        {`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        `}
      </style>
    </>
  );
};

export default ModulePage;