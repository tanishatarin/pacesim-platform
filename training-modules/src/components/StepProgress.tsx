// import { useEffect } from 'react';
// import { CheckCircle } from 'lucide-react';

// interface StepProgressProps {
//   steps: Array<{
//     id: string;
//     objective: string;
//     instruction: string;
//     targetValues?: Record<string, any>;
//     hint?: string;
//     flashingSensor?: "left" | "right" | null;
//   }>;
//   currentStepIndex: number;
//   completedSteps: Set<string>;
//   currentParams: Record<string, any>;
//   onStepComplete?: (stepId: string) => void;
//   className?: string;
// }

// const StepProgress = ({
//   steps,
//   currentStepIndex,
//   completedSteps,
//   currentParams,
//   onStepComplete,
//   className = ""
// }: StepProgressProps) => {
//   const currentStep = steps[currentStepIndex];

//   // Check if current step is complete based on target values
//   const isCurrentStepComplete = () => {
//     if (!currentStep?.targetValues) return false;

//     return Object.entries(currentStep.targetValues).every(([key, targetValue]) => {
//       const currentValue = currentParams[key];
//       if (typeof targetValue === 'number' && typeof currentValue === 'number') {
//         const tolerance = Math.max(0.1, Math.abs(targetValue) * 0.1);
//         return Math.abs(currentValue - targetValue) <= tolerance;
//       }
//       return currentValue === targetValue;
//     });
//   };

//   const stepComplete = isCurrentStepComplete();

//   // Auto-advance to next step when current is complete
//   useEffect(() => {
//     if (stepComplete && !completedSteps.has(currentStep?.id || '')) {
//       const timer = setTimeout(() => {
//         if (currentStep && onStepComplete) {
//           onStepComplete(currentStep.id);
//         }
//       }, 1000); // 1.5 second delay to show completion

//       return () => clearTimeout(timer);
//     }
//   }, [stepComplete, currentStep?.id, completedSteps, onStepComplete]);

//   if (!currentStep) {
//     return (
//       <div className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 ${className}`}>
//         <div className="flex items-center">
//           <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
//           <div>
//             <h3 className="font-semibold text-green-900 mb-1">
//               All Steps Complete!
//             </h3>
//             <p className="text-sm text-green-700">
//               You have successfully completed all the steps for this module.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`bg-[#F0F6FE] rounded-xl p-6 ${className}`}>
//       {/* Header with step counter and progress dots */}
//       <div className="flex items-center justify-between">
//         <div className="font-bold mb-1 text-gray-700">
//           Step {currentStepIndex + 1}: {currentStep.objective}
//         </div>
        
//         {/* Progress dots */}
//         <div className="flex space-x-1">
//           {steps.map((step, index) => {
//             const isCompleted = completedSteps.has(step.id);
//             const isCurrent = index === currentStepIndex;
            
//             return (
//               <div
//                 key={step.id}
//                 className={`w-3 h-3 rounded-full transition-colors ${
//                   isCompleted
//                     ? 'bg-green-500'
//                     : isCurrent
//                     ? stepComplete ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
//                     : 'bg-gray-300'
//                 }`}
//               />
//             );
//           })}
//         </div>
//       </div>

//       {/* Current Step Content */}
//       <div className="flex items-start justify-between">
//           <p className={`text-sm font-semibold leading-relaxed text-blue-700`}>
//             {currentStep.instruction}
//           </p>
        
//         {stepComplete && (
//           <div className="ml-4 flex-shrink-0">
//             <CheckCircle className="w-5 h-5 text-green-600" />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StepProgress;