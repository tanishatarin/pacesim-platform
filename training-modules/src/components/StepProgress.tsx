import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ArrowRight, Lightbulb, Target, ChevronRight } from 'lucide-react';

interface StepProgressProps {
  steps: Array<{
    id: string;
    objective: string;
    instruction: string;
    targetValues?: Record<string, any>;
    hint?: string;
    flashingSensor?: "left" | "right" | null;
  }>;
  currentStepIndex: number;
  completedSteps: Set<string>;
  currentParams: Record<string, any>;
  onStepComplete?: (stepId: string) => void;
  className?: string;
}

const StepProgress = ({
  steps,
  currentStepIndex,
  completedSteps,
  currentParams,
  onStepComplete,
  className = ""
}: StepProgressProps) => {
  const [showHint, setShowHint] = useState(false);
  const currentStep = steps[currentStepIndex];

  // Auto-hide hint after 10 seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => setShowHint(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  // Check if current step is complete based on target values
  const isCurrentStepComplete = () => {
    if (!currentStep?.targetValues) return false;

    return Object.entries(currentStep.targetValues).every(([key, targetValue]) => {
      const currentValue = currentParams[key];
      if (typeof targetValue === 'number' && typeof currentValue === 'number') {
        const tolerance = Math.max(0.1, Math.abs(targetValue) * 0.1);
        return Math.abs(currentValue - targetValue) <= tolerance;
      }
      return currentValue === targetValue;
    });
  };

  const stepComplete = isCurrentStepComplete();

  // Auto-advance to next step when current is complete
  useEffect(() => {
    if (stepComplete && !completedSteps.has(currentStep?.id || '')) {
      const timer = setTimeout(() => {
        if (currentStep && onStepComplete) {
          onStepComplete(currentStep.id);
        }
      }, 1500); // 1.5 second delay to show completion

      return () => clearTimeout(timer);
    }
  }, [stepComplete, currentStep?.id, completedSteps, onStepComplete]);

  if (!currentStep) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
          <h3 className="text-lg font-bold text-green-900 mb-2">
            All Steps Complete!
          </h3>
          <p className="text-green-700">
            You have successfully completed all the steps for this module.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-2 border-blue-200 rounded-xl p-6 ${className}`}>
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-blue-900">
            Step {currentStepIndex + 1} of {steps.length}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Progress dots */}
          <div className="flex space-x-1">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStepIndex;
              
              return (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>
          
          {/* Hint button */}
          {currentStep.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              title="Show hint"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="space-y-4">
        {/* Step Objective */}
        <div className={`p-4 rounded-lg transition-colors ${
          stepComplete 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                stepComplete ? 'text-green-900' : 'text-blue-900'
              }`}>
                {currentStep.objective}
              </h4>
              <p className={`text-sm ${
                stepComplete ? 'text-green-700' : 'text-blue-700'
              }`}>
                {currentStep.instruction}
              </p>
            </div>
            
            {stepComplete && (
              <CheckCircle className="w-6 h-6 text-green-600 ml-3 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Target Values Display */}
        {currentStep.targetValues && Object.keys(currentStep.targetValues).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Target Values:</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(currentStep.targetValues).map(([key, targetValue]) => {
                const currentValue = currentParams[key];
                const isMatch = typeof targetValue === 'number' && typeof currentValue === 'number'
                  ? Math.abs(currentValue - targetValue) <= Math.max(0.1, Math.abs(targetValue) * 0.1)
                  : currentValue === targetValue;

                const getDisplayName = (key: string) => {
                  const names: Record<string, string> = {
                    'rate': 'Rate',
                    'aOutput': 'Atrial Output',
                    'vOutput': 'Ventricular Output',
                    'aSensitivity': 'Atrial Sensitivity',
                    'vSensitivity': 'Ventricular Sensitivity',
                    'mode': 'Pacing Mode'
                  };
                  return names[key] || key;
                };

                const getUnit = (key: string) => {
                  const units: Record<string, string> = {
                    'rate': 'BPM',
                    'aOutput': 'mA',
                    'vOutput': 'mA',
                    'aSensitivity': 'mV',
                    'vSensitivity': 'mV',
                    'mode': ''
                  };
                  return units[key] || '';
                };

                return (
                  <div
                    key={key}
                    className={`flex justify-between items-center px-2 py-1 rounded ${
                      isMatch ? 'bg-green-100 text-green-800' : 'bg-white'
                    }`}
                  >
                    <span className="font-medium">{getDisplayName(key)}:</span>
                    <span className="font-mono">
                      {targetValue} {getUnit(key)}
                      {isMatch && <span className="ml-1">✓</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hint Display */}
        {showHint && currentStep.hint && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-amber-900 mb-1">Hint:</h5>
                <p className="text-sm text-amber-800">{currentStep.hint}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Complete Message */}
        {stepComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Step completed! 
                {currentStepIndex < steps.length - 1 && (
                  <span className="ml-1">Moving to next step...</span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepProgress;