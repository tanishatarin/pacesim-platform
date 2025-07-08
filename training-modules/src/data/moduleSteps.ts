// export interface ModuleStep {
//   id: string;
//   objective: string;
//   instruction: string;
//   targetValues?: {
//     rate?: number;
//     aOutput?: number;
//     vOutput?: number;
//     aSensitivity?: number;
//     vSensitivity?: number;
//     mode?: number;
//   };
//   allowedControls: string[];
//   flashingSensor?: "left" | "right" | null;
//   completionCriteria?: (currentParams: any, targetValues: any) => boolean;
//   hint?: string;
// }

// export interface ModuleConfig {
//   id: string;
//   title: string;
//   objective: string;
//   scenario: string;
//   steps: ModuleStep[];
//   ecgMode: "sensitivity" | "third_degree_block" | "atrial_fibrillation";
//   initialParams: {
//     rate: number;
//     aOutput: number;
//     vOutput: number;
//     aSensitivity: number;
//     vSensitivity: number;
//   };
// }

// // Default completion criteria - checks if values are within 10% or exact match
// const defaultCompletionCriteria = (
//   currentParams: any,
//   targetValues: any,
// ): boolean => {
//   for (const [key, targetValue] of Object.entries(targetValues)) {
//     const currentValue = currentParams[key];
//     if (typeof targetValue === "number" && typeof currentValue === "number") {
//       const tolerance = Math.max(0.05, targetValue * 0.05); // 5% tolerance or 0.05 minimum
//       if (Math.abs(currentValue - targetValue) > tolerance) {
//         return false;
//       }
//     } else if (targetValue !== currentValue) {
//       return false;
//     }
//   }
//   return true;
// };

// // Custom completion criteria for sensing threshold steps
// const sensingThresholdCriteria = (
//   currentParams: any,
//   targetValues: any,
// ): boolean => {
//   const currentSens = currentParams.aSensitivity;
//   const targetSens = targetValues.aSensitivity;
//   const tolerance = 0.1;

//   const isAtTarget = Math.abs(currentSens - targetSens) <= tolerance;

//   // Log for debugging
//   console.log(
//     `🔍 Sensing threshold check: current=${currentSens}, target=${targetSens}, tolerance=${tolerance}, met=${isAtTarget}`,
//   );

//   return isAtTarget;
// };

// // Custom completion criteria for ventricular sensing threshold
// const vSensingThresholdCriteria = (
//   currentParams: any,
//   targetValues: any,
// ): boolean => {
//   const currentSens = currentParams.vSensitivity;
//   const targetSens = targetValues.vSensitivity;
//   const tolerance = 0.1;

//   const isAtTarget = Math.abs(currentSens - targetSens) <= tolerance;

//   console.log(
//     `🔍 V-Sensing threshold check: current=${currentSens}, target=${targetSens}, tolerance=${tolerance}, met=${isAtTarget}`,
//   );

//   return isAtTarget;
// };

// // Auto-complete function for observation steps
// const autoCompleteCriteria = (
//   currentParams: any,
//   targetValues: any,
// ): boolean => {
//   // Always return true for observation steps - they auto-complete after a delay
//   return true;
// };

// export const moduleConfigs: Record<string, ModuleConfig> = {
//   "1": {
//     id: "1",
//     title: "Scenario 1: Bradycardia Management",
//     objective:
//       "Diagnose and correct a failure to sense condition. Complete the knowledge check and then adjust the pacemaker.",
//     scenario:
//       "You return to a patient's room and observe this ECG pattern. Their heart rate has dropped to 40 BPM and atrial leads are connected.",
//     ecgMode: "sensitivity",
//     initialParams: {
//       rate: 40,
//       aOutput: 2,
//       vOutput: 3,
//       aSensitivity: 1,
//       vSensitivity: 2,
//     },
//     steps: [
//       {
//         id: "step1",
//         objective: "Decrease heart rate to 30 BPM",
//         instruction:
//           "Lower the pacing rate to 30 BPM to evaluate the patient's intrinsic rhythm",
//         targetValues: { rate: 30 },
//         allowedControls: ["rate"],
//         flashingSensor: "right",
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Use the rate control to decrease the pacing rate below the patient's intrinsic rate",
//       },
//       {
//         id: "step2",
//         objective: "Set atrial output to 0.1 mA",
//         instruction:
//           "Reduce atrial output to minimal level for threshold testing",
//         targetValues: { aOutput: 0.1 },
//         allowedControls: ["aOutput"],
//         flashingSensor: "left",
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Lower the atrial output to find the minimum capture threshold",
//       },
//       {
//         id: "step3",
//         objective: "Adjust aSensitivity to 0.4 mV",
//         instruction:
//           "Set atrial sensitivity to 0.4 mV to start sensitivity testing",
//         targetValues: { aSensitivity: 0.4 },
//         allowedControls: ["aSensitivity"],
//         flashingSensor: "left",
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Start with a lower sensitivity value and gradually increase",
//       },
//       {
//         id: "step4",
//         objective: "Find sensing threshold",
//         instruction:
//           "Slowly increase atrial sensitivity to 1.6 mV. Watch the sensing light - it will stop flashing when you reach the threshold.",
//         targetValues: { aSensitivity: 1.6 },
//         allowedControls: ["aSensitivity"],
//         flashingSensor: "left",
//         completionCriteria: sensingThresholdCriteria, // USE THE CUSTOM FUNCTION HERE
//         hint: "The sensing light represents the pacemaker detecting intrinsic cardiac activity. When you reach the threshold, it stops flashing.",
//       },
//       {
//         id: "step5",
//         objective: "Set aSensitivity to safety margin",
//         instruction:
//           "Set atrial sensitivity to half of the threshold (0.8 mV) for a safety margin",
//         targetValues: { aSensitivity: 0.8 },
//         allowedControls: ["aSensitivity"],
//         flashingSensor: "left",
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Use half the threshold value to ensure reliable sensing with a safety margin",
//       },
//       {
//         id: "step6",
//         objective: "Set rate 10 bpm above intrinsic",
//         instruction:
//           "Increase pacing rate to 50 BPM (10 bpm above patient's intrinsic rate of 40)",
//         targetValues: { rate: 50 },
//         allowedControls: ["rate"],
//         flashingSensor: "left",
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Set the rate slightly above the patient's intrinsic rate to ensure pacing",
//       },
//       {
//         id: "step7",
//         objective: "Find capture threshold",
//         instruction:
//           "Slowly increase atrial output until you achieve consistent capture",
//         targetValues: { aOutput: 4 },
//         allowedControls: ["aOutput"],
//         flashingSensor: "left",
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Gradually increase output until you see consistent capture after each pacing spike",
//       },
//       {
//         id: "step8",
//         objective: "Set output to 2x threshold",
//         instruction:
//           "Set atrial output to double the threshold (8 mA) for safety margin",
//         targetValues: { aOutput: 8 },
//         allowedControls: ["aOutput"],
//         flashingSensor: "left",
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Double the threshold ensures reliable capture with safety margin",
//       },
//       {
//         id: "step9",
//         objective: "Restore physician-ordered rate",
//         instruction: "Set final pacing rate to 80 BPM as ordered by physician",
//         targetValues: { rate: 80 },
//         allowedControls: ["rate"],
//         flashingSensor: null,
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Return to the prescribed pacing rate now that thresholds are established",
//       },
//     ],
//   },

//   // Module 2: Third Degree Block - Real steps from clinical document
//   "2": {
//     id: "2",
//     title: "Scenario 2: Third Degree Heart Block",
//     objective:
//       "Diagnose and manage third degree heart block with appropriate VVI pacing settings.",
//     scenario:
//       "50-year-old male, POD 3 from MVR. Patient feeling 'funny', HR is 30, BP is 85/50 MAP (62). You have 1V and 1 skin wire.",
//     ecgMode: "third_degree_block",
//     initialParams: {
//       rate: 30, // Patient's ventricular escape rate
//       aOutput: 1,
//       vOutput: 1,
//       aSensitivity: 1,
//       vSensitivity: 1,
//     },
//     steps: [
//       {
//         id: "td_step1",
//         objective: "Set heart rate to 30 BPM",
//         instruction:
//           "Set the heart rate to 30 (at least 10 beats/min lower than patient's intrinsic rate)",
//         targetValues: { rate: 30 },
//         allowedControls: ["rate"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Ensures non-pacing because set rate is below patient's intrinsic rate",
//       },
//       {
//         id: "td_step2",
//         objective: "Set ventricular output to 0.1mA",
//         instruction:
//           "Adjust ventricular output to 0.1mA to prevent asynchronous pacing",
//         targetValues: { vOutput: 0.1 },
//         allowedControls: ["vOutput"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Capture is not likely because output is at minimum",
//       },
//       {
//         id: "td_step3",
//         objective: "Set V sensitivity to maximum (0.8mV)",
//         instruction:
//           "Adjust vSensitivity to 0.8mV (highest possible sensitivity for V wires)",
//         targetValues: { vSensitivity: 0.8 },
//         allowedControls: ["vSensitivity"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Start with highest sensitivity for V wires",
//       },
//       {
//         id: "td_step4",
//         objective: "Find V sensing threshold at 2.0mV",
//         instruction:
//           "Slowly increase vSensitivity to 2.0mV until sense indicator stops flashing",
//         targetValues: { vSensitivity: 2.0 },
//         allowedControls: ["vSensitivity"],
//         completionCriteria: vSensingThresholdCriteria,
//         hint: "Sensing threshold occurs at 2.0mV in this scenario",
//       },
//       {
//         id: "td_step5",
//         objective: "Set V sensitivity to half threshold (1.0mV)",
//         instruction:
//           "Set vSensitivity to half the sensing threshold (1.0mV) for safety margin",
//         targetValues: { vSensitivity: 1.0 },
//         allowedControls: ["vSensitivity"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Half threshold provides safety margin",
//       },
//       {
//         id: "td_step6",
//         objective: "Set rate to 40 BPM",
//         instruction:
//           "Turn pacemaker rate up to 40 (10 beats/min higher than patient's intrinsic rate)",
//         targetValues: { rate: 40 },
//         allowedControls: ["rate"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "10 BPM above patient's intrinsic escape rate",
//       },
//       {
//         id: "td_step7",
//         objective: "Find V capture threshold at 5mA",
//         instruction:
//           "Slowly increase vOutput. Close to 1:1 capture shows HR=37 at 5mA",
//         targetValues: { vOutput: 5 },
//         allowedControls: ["vOutput"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Getting close to capture at 5mA",
//       },
//       {
//         id: "td_step8",
//         objective: "Achieve full V capture at 7mA",
//         instruction:
//           "Continue increasing vOutput until HR=40 on monitor (full capture at 7mA)",
//         targetValues: { vOutput: 7 },
//         allowedControls: ["vOutput"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Full 1:1 capture occurs at 7mA",
//       },
//       {
//         id: "td_step9",
//         objective: "Set safety margin to 14mA",
//         instruction:
//           "Set vOutput to two times the stimulation threshold (14mA) for safety",
//         targetValues: { vOutput: 14 },
//         allowedControls: ["vOutput"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Double the threshold for safety margin",
//       },
//       {
//         id: "td_step10",
//         objective: "Set final rate to 80 BPM",
//         instruction: "Set pacemaker to 80 BPM per prescriber order",
//         targetValues: { rate: 80 },
//         allowedControls: ["rate"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Final prescribed rate",
//       },
//     ],
//   },

//   // Module 3: A Fib Scenario - Real steps from clinical document
//   "3": {
//     id: "3",
//     title: "Scenario 3: Atrial Fibrillation with Bradycardia",
//     objective:
//       "Manage atrial fibrillation patient who developed bradycardia after rate control medications.",
//     scenario:
//       "68-year-old male, POD 3 from AVR. Developed A fib with HR=160. After amiodarone and metoprolol, HR=38, BP=77/43 (54). You have 2A and 2V wires.",
//     ecgMode: "atrial_fibrillation",
//     initialParams: {
//       rate: 74, // Normal rate during initial wire testing
//       aOutput: 5,
//       vOutput: 5,
//       aSensitivity: 2,
//       vSensitivity: 2,
//     },
//     steps: [
//       // Initial wire testing (before A fib develops)
//       {
//         id: "afib_step1",
//         objective: "FAKE LOL but set rate to 80",
//         instruction:
//           "Set rate to 64, A sensitivity to 0.4mV, then slowly increase until sensing threshold found",
//         targetValues: { rate: 80 },
//         allowedControls: ["rate"],
//         completionCriteria: sensingThresholdCriteria,
//         hint: "A wire sensing threshold is 0.4mV in this scenario",
//       },
//       {
//         id: "afib_step2",
//         objective: "FAKE LOL but set rate to 180",
//         instruction:
//           "Set aSensitivity to half the threshold (0.2mV) for safety margin",
//         targetValues: { rate: 180},
//         allowedControls: ["rate"],
//         completionCriteria: defaultCompletionCriteria,
//         hint: "Half threshold for safety",
//       },
//       // {
//       //   id: "afib_step1",
//       //   objective: "Check A wire sensitivity to 4mV threshold",
//       //   instruction:
//       //     "Set rate to 64, A sensitivity to 0.4mV, then slowly increase to 4mV until sensing threshold found",
//       //   targetValues: { aSensitivity: 4, rate: 64 },
//       //   allowedControls: ["aSensitivity", "rate"],
//       //   completionCriteria: sensingThresholdCriteria,
//       //   hint: "A wire sensing threshold is 4mV in this scenario",
//       // },
//       // {
//       //   id: "afib_step2",
//       //   objective: "Set A sensitivity safety margin to 2mV",
//       //   instruction:
//       //     "Set aSensitivity to half the threshold (2mV) for safety margin",
//       //   targetValues: { aSensitivity: 2 },
//       //   allowedControls: ["aSensitivity"],
//       //   completionCriteria: defaultCompletionCriteria,
//       //   hint: "Half threshold for safety",
//       // },
//       // {
//       //   id: "afib_step3",
//       //   objective: "Find A capture threshold at 10mA",
//       //   instruction:
//       //     "Set rate to 84, slowly increase aOutput until close to capture at 10mA (HR shows 80)",
//       //   targetValues: { aOutput: 10, rate: 84 },
//       //   allowedControls: ["aOutput", "rate"],
//       //   completionCriteria: defaultCompletionCriteria,
//       //   hint: "Close to A capture at 10mA",
//       // },
//       // {
//       //   id: "afib_step4",
//       //   objective: "Achieve A full capture at 12mA",
//       //   instruction:
//       //     "Continue increasing aOutput until full 1:1 A capture (HR=84) at 12mA",
//       //   targetValues: { aOutput: 12 },
//       //   allowedControls: ["aOutput"],
//       //   completionCriteria: defaultCompletionCriteria,
//       //   hint: "Full atrial capture at 12mA",
//       // },
//       // {
//       //   id: "afib_step5",
//       //   objective: "Set A output safety margin to 24mA",
//       //   instruction:
//       //     "Set aOutput to double the threshold (24mA) for safety margin",
//       //   targetValues: { aOutput: 24 },
//       //   allowedControls: ["aOutput"],
//       //   completionCriteria: defaultCompletionCriteria,
//       //   hint: "Double threshold for safety",
//       // },
//       // // V wire testing
//       // {
//       //   id: "afib_step6",
//       //   objective: "Find V sensing threshold at 5mV",
//       //   instruction:
//       //     "Test V wires: slowly increase vSensitivity from 0.8mV to 5mV threshold",
//       //   targetValues: { vSensitivity: 5 },
//       //   allowedControls: ["vSensitivity"],
//       //   completionCriteria: vSensingThresholdCriteria,
//       //   hint: "V sensing threshold is 5mV in this scenario",
//       // },
//       // {
//       //   id: "afib_step7",
//       //   objective: "Set V sensitivity safety margin to 2.5mV",
//       //   instruction:
//       //     "Set vSensitivity to half the threshold (2.5mV) for safety",
//       //   targetValues: { vSensitivity: 2.5 },
//       //   allowedControls: ["vSensitivity"],
//       //   completionCriteria: defaultCompletionCriteria,
//       //   hint: "Half threshold for safety margin",
//       // },
//       // {
//       //   id: "afib_step8",
//       //   objective: "Find V capture threshold at 8mA",
//       //   instruction:
//       //     "Test V capture: slowly increase vOutput until close to capture at 8mA (HR shows 80)",
//       //   targetValues: { vOutput: 8 },
//       //   allowedControls: ["vOutput"],
//       //   completionCriteria: defaultCompletionCriteria,
//       //   hint: "Close to V capture at 8mA",
//       // },
//       // {
//       //   id: "afib_step9",
//       //   objective: "Achieve V full capture at 10mA",
//       //   instruction:
//       //     "Continue increasing vOutput until full 1:1 V capture (HR=84) at 10mA",
//       //   targetValues: { vOutput: 10 },
//       //   allowedControls: ["vOutput"],
//       //   completionCriteria: defaultCompletionCriteria,
//       //   hint: "Full ventricular capture at 10mA",
//       // },
//       // {
//       //   id: "afib_step10",
//       //   objective: "Set V output safety margin to 20mA",
//       //   instruction: "Set vOutput to double the threshold (20mA) for safety",
//       //   targetValues: { vOutput: 20 },
//       //   allowedControls: ["vOutput"],
//       //   completionCriteria: defaultCompletionCriteria,
//       //   hint: "Double threshold for safety",
//       // },
//       // // Patient develops A fib and needs VVI pacing
//       // {
//       //   id: "afib_step11",
//       //   objective: "Patient develops A fib - turn on VVI at 80 BPM",
//       //   instruction:
//       //     "Patient now in A fib with bradycardia after medications. Set VVI pacing at 80 BPM",
//       //   targetValues: { rate: 80 },
//       //   allowedControls: ["rate"],
//       //   completionCriteria: defaultCompletionCriteria,
//       //   hint: "VVI pacing needed due to medication-induced bradycardia in A fib",
//       // },
//     ],
//   },
// };








export interface ModuleStep {
  id: string;
  objective: string;
  instruction: string;
  targetValues?: {
    rate?: number;
    aOutput?: number;
    vOutput?: number;
    aSensitivity?: number;
    vSensitivity?: number;
    mode?: number;
  };
  allowedControls: string[];
  flashingSensor?: "left" | "right" | null;
  completionCriteria?: (currentParams: any, targetValues: any) => boolean;
  hint?: string;
  // NEW: Expected vital signs at this step
  expectedVitals?: {
    heartRate?: number;
    bloodPressure?: string;
    mapPressure?: number;
  };
}

export interface ModuleConfig {
  id: string;
  title: string;
  objective: string;
  scenario: string;
  steps: ModuleStep[];
  ecgMode: "sensitivity" | "third_degree_block" | "atrial_fibrillation";
  initialParams: {
    rate: number;
    aOutput: number;
    vOutput: number;
    aSensitivity: number;
    vSensitivity: number;
  };
  // NEW: Initial patient vital signs from Feb 2025 document
  initialVitals: {
    heartRate: number;
    bloodPressure: string;
    mapPressure: number;
  };
}

// Default completion criteria - checks if values are within tolerance
const defaultCompletionCriteria = (
  currentParams: any,
  targetValues: any,
): boolean => {
  for (const [key, targetValue] of Object.entries(targetValues)) {
    const currentValue = currentParams[key];
    if (typeof targetValue === "number" && typeof currentValue === "number") {
      const tolerance = Math.max(0.05, targetValue * 0.05); // 5% tolerance or 0.05 minimum
      if (Math.abs(currentValue - targetValue) > tolerance) {
        return false;
      }
    } else if (targetValue !== currentValue) {
      return false;
    }
  }
  return true;
};

// Custom completion criteria for sensing threshold steps
const sensingThresholdCriteria = (
  currentParams: any,
  targetValues: any,
): boolean => {
  const currentSens = currentParams.aSensitivity || currentParams.vSensitivity;
  const targetSens = targetValues.aSensitivity || targetValues.vSensitivity;
  const tolerance = 0.1;

  const isAtTarget = Math.abs(currentSens - targetSens) <= tolerance;

  console.log(
    `🔍 Sensing threshold check: current=${currentSens}, target=${targetSens}, tolerance=${tolerance}, met=${isAtTarget}`,
  );

  return isAtTarget;
};

// Custom completion criteria for capture threshold steps
const captureThresholdCriteria = (
  currentParams: any,
  targetValues: any,
): boolean => {
  const currentOutput = currentParams.aOutput || currentParams.vOutput;
  const targetOutput = targetValues.aOutput || targetValues.vOutput;
  const tolerance = 0.5; // 0.5mA tolerance for capture

  const isAtTarget = Math.abs(currentOutput - targetOutput) <= tolerance;

  console.log(
    `🔍 Capture threshold check: current=${currentOutput}, target=${targetOutput}, tolerance=${tolerance}, met=${isAtTarget}`,
  );

  return isAtTarget;
};

export const moduleConfigs: Record<string, ModuleConfig> = {
  "1": {
    id: "1",
    title: "Scenario 1: Bradycardia Management",
    objective:
      "70-year-old female with past medical history of hypertension, hypercholesteremia, stroke, angina. Patient had a CABG and MVR yesterday. HR=40, BP=90/58 MAP(69). She has 1V and 1 skin wire, 3 CT.",
    scenario:
      "70-year-old female, POD 1 CABG and MVR. HR dropped to 40 BPM, BP=90/58 MAP(69). You have 1V and 1 skin wire available.",
    ecgMode: "sensitivity",
    initialParams: {
      rate: 40,
      aOutput: 0.1, // Start at minimum as per document
      vOutput: 0.1, // Start at minimum as per document
      aSensitivity: 0.8, // Highest sensitivity for V wires
      vSensitivity: 0.8, // Highest sensitivity for V wires
    },
    initialVitals: {
      heartRate: 40,
      bloodPressure: "90/58",
      mapPressure: 69
    },
    steps: [
      {
        id: "brady_step1",
        objective: "Check connections and turn on pacer",
        instruction: "Ensure V wire is connected to negative port and skin lead to positive port. Turn on pacer (auto-sets to VVI).",
        targetValues: {},
        allowedControls: [],
        completionCriteria: () => true, // Auto-complete observation step
        hint: "Check all connections before proceeding",
      },
      {
        id: "brady_step2", 
        objective: "Set heart rate to 30 BPM (10 below intrinsic)",
        instruction: "Set the heart rate to 30 BPM - this is at least 10 beats/min lower than patient's intrinsic rate of 40",
        targetValues: { rate: 30 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Must be 10 BPM below intrinsic rate to ensure non-pacing",
      },
      {
        id: "brady_step3",
        objective: "Set ventricular output to 0.1mA",
        instruction: "Adjust ventricular output to 0.1mA to prevent asynchronous pacing",
        targetValues: { vOutput: 0.1 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Minimum output prevents capture during sensitivity testing",
      },
      {
        id: "brady_step4",
        objective: "Set V wire sensitivity to 0.8mV (highest)",
        instruction: "Adjust sensitivity to 0.8mV - highest possible sensitivity for V wires",
        targetValues: { vSensitivity: 0.8 },
        allowedControls: ["vSensitivity"],
        completionCriteria: sensingThresholdCriteria,
        hint: "Start with maximum sensitivity",
        flashingSensor: "right",
      },
      {
        id: "brady_step5",
        objective: "Find sensing threshold at 3mV",
        instruction: "Slowly decrease sensitivity (increase mV) until sense indicator stops flashing. This occurs at 3mV.",
        targetValues: { vSensitivity: 3 },
        allowedControls: ["vSensitivity"],
        completionCriteria: sensingThresholdCriteria,
        hint: "Sensing threshold is 3mV in this scenario",
        flashingSensor: "right",
      },
      {
        id: "brady_step6",
        objective: "Set safety margin at 1.5mV",
        instruction: "Set sensitivity to half the threshold (1.5mV) for safety margin",
        targetValues: { vSensitivity: 1.5 },
        allowedControls: ["vSensitivity"],
        completionCriteria: sensingThresholdCriteria,
        hint: "Safety margin = half of sensing threshold",
        flashingSensor: "right",
      },
      {
        id: "brady_step7",
        objective: "Set pacing rate to 50 BPM",
        instruction: "Turn pacemaker rate up to 50 (10 beats/min higher than patient's intrinsic rate)",
        targetValues: { rate: 50 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "50 BPM is 10 above the intrinsic rate of 40",
        expectedVitals: { bloodPressure: "95/60", mapPressure: 72 }
      },
      {
        id: "brady_step8",
        objective: "Find capture threshold at 7mA",
        instruction: "Slowly increase V output from 0.1mA until you get 1:1 capture at 50 BPM. This occurs at 7mA.",
        targetValues: { vOutput: 7 },
        allowedControls: ["vOutput"],
        completionCriteria: captureThresholdCriteria,
        hint: "Watch for consistent 1:1 capture and HR showing 50 on monitor",
        flashingSensor: "left",
      },
      {
        id: "brady_step9",
        objective: "Set safety margin at 14mA",
        instruction: "Set output to two times the stimulation threshold (14mA) for safety margin",
        targetValues: { vOutput: 14 },
        allowedControls: ["vOutput"],
        completionCriteria: captureThresholdCriteria,
        hint: "Safety margin = 2x capture threshold",
        flashingSensor: "left",
      },
      {
        id: "brady_step10",
        objective: "Increase rate to 80 BPM per prescriber order",
        instruction: "APP orders rate increase to 80 BPM due to low BP",
        targetValues: { rate: 80 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Higher rate improves cardiac output and blood pressure",
        expectedVitals: { bloodPressure: "110/75", mapPressure: 87 }
      },
    ],
  },

  "2": {
    id: "2", 
    title: "Scenario 2: Third Degree Heart Block",
    objective:
      "50-year-old male with history of severe asymptomatic degenerative mitral regurgitation. POD 3 from MVR, feeling 'funny'. HR=30, BP=85/50 MAP(62). You have 1V and 1 skin wire.",
    scenario:
      "50-year-old male, POD 3 MVR, feeling 'funny'. HR=30, BP=85/50 MAP(62). Planning wire removal but patient calls feeling funny.",
    ecgMode: "third_degree_block",
    initialParams: {
      rate: Math.max(30, 30), // Document says 20, but we use 30 minimum
      aOutput: 0.1,
      vOutput: 0.1,
      aSensitivity: 0.8,
      vSensitivity: 0.8,
    },
    initialVitals: {
      heartRate: Math.max(30, 30), // Display 30 instead of 20 from document
      bloodPressure: "85/50",
      mapPressure: 62
    },
    steps: [
      {
        id: "third_step1",
        objective: "Check connections and turn on pacer",
        instruction: "Ensure V wire is connected to negative port and skin lead to positive port. Turn on pacer (auto-sets to VVI).",
        targetValues: {},
        allowedControls: [],
        completionCriteria: () => true,
        hint: "Check all connections before proceeding",
      },
      {
        id: "third_step2",
        objective: "Set heart rate to 30 BPM (adjusted from 20)",
        instruction: "Set the heart rate to 30 BPM - adjusted from document's 20 BPM to meet minimum display requirements",
        targetValues: { rate: 30 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Document specifies 20 BPM, but we use 30 BPM minimum",
      },
      {
        id: "third_step3",
        objective: "Set ventricular output to 0.1mA",
        instruction: "Adjust ventricular output to 0.1mA to prevent asynchronous pacing",
        targetValues: { vOutput: 0.1 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Minimum output prevents capture during sensing testing",
      },
      {
        id: "third_step4",
        objective: "Set V wire sensitivity to 0.8mV (highest)",
        instruction: "Adjust sensitivity to 0.8mV - highest possible sensitivity for V wires",
        targetValues: { vSensitivity: 0.8 },
        allowedControls: ["vSensitivity"],
        completionCriteria: sensingThresholdCriteria,
        hint: "Start with maximum sensitivity",
        flashingSensor: "right",
      },
      {
        id: "third_step5",
        objective: "Find sensing threshold at 2mV",
        instruction: "Slowly decrease sensitivity (increase mV) until sense indicator stops flashing. This occurs at 2mV.",
        targetValues: { vSensitivity: 2 },
        allowedControls: ["vSensitivity"],
        completionCriteria: sensingThresholdCriteria,
        hint: "Sensing threshold is 2mV in this scenario",
        flashingSensor: "right",
      },
      {
        id: "third_step6",
        objective: "Set safety margin at 1.0mV", 
        instruction: "Set sensitivity to half the threshold (1.0mV) for safety margin",
        targetValues: { vSensitivity: 1.0 },
        allowedControls: ["vSensitivity"],
        completionCriteria: sensingThresholdCriteria,
        hint: "Safety margin = half of sensing threshold",
        flashingSensor: "right",
      },
      {
        id: "third_step7",
        objective: "Set pacing rate to 40 BPM (adjusted from 40)",
        instruction: "Turn pacemaker rate up to 40 BPM - 10 beats/min higher than intrinsic rate",
        targetValues: { rate: 40 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Document shows adjusted rate from intrinsic 30",
        expectedVitals: { bloodPressure: "95/60", mapPressure: 72 }
      },
      {
        id: "third_step8",
        objective: "Find capture threshold at 7mA",
        instruction: "Slowly increase V output until you get 1:1 capture at 40 BPM. This occurs at 7mA.",
        targetValues: { vOutput: 7 },
        allowedControls: ["vOutput"],
        completionCriteria: captureThresholdCriteria,
        hint: "Watch for consistent 1:1 capture and HR showing 40 on monitor",
        flashingSensor: "left",
      },
      {
        id: "third_step9",
        objective: "Set safety margin at 14mA",
        instruction: "Set output to two times the stimulation threshold (14mA) for safety margin",
        targetValues: { vOutput: 14 },
        allowedControls: ["vOutput"],
        completionCriteria: captureThresholdCriteria,
        hint: "Safety margin = 2x capture threshold",
        flashingSensor: "left",
      },
      {
        id: "third_step10",
        objective: "Set pacemaker to 80 BPM per prescriber order",
        instruction: "Set pacemaker to 80 BPM as ordered by prescriber",
        targetValues: { rate: 80 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Final pacing rate for optimal cardiac output",
        expectedVitals: { bloodPressure: "105/70", mapPressure: 82 }
      },
    ],
  },

  "3": {
    id: "3",
    title: "Scenario 3: Atrial Fibrillation with Bradycardia",
    objective:
      "68-year-old male with hypertension and bicuspid aortic valve. POD 3 from AVR. Initially HR=74, developed A fib with HR=160, then after amiodarone and metoprolol HR=38, BP=77/43 MAP(54). You have 2A and 2V wires.",
    scenario:
      "68-year-old male, POD 3 AVR. Developed A fib HR=160→38 after medications. BP=77/43 MAP(54). Need VVI pacing.",
    ecgMode: "atrial_fibrillation", 
    initialParams: {
      rate: 74, // Initial rate during wire testing
      aOutput: 0.1,
      vOutput: 0.1,
      aSensitivity: 0.4, // A wire max sensitivity
      vSensitivity: 0.8, // V wire max sensitivity
    },
    initialVitals: {
      heartRate: Math.max(30, 38), // Display 30+ instead of 38
      bloodPressure: "77/43",
      mapPressure: 54
    },
    steps: [
      // Initial wire testing phase (before A fib develops)
      {
        id: "afib_step1",
        objective: "Check A wire sensitivity - find threshold at 4mV",
        instruction: "Set rate to 64, A sensitivity to 0.4mV, then slowly increase to find 4mV threshold",
        targetValues: { aSensitivity: 4, rate: 64 },
        allowedControls: ["aSensitivity", "rate"],
        completionCriteria: sensingThresholdCriteria,
        hint: "A wire sensing threshold is 4mV in this scenario",
        flashingSensor: "right",
      },
      {
        id: "afib_step2",
        objective: "Set A sensitivity safety margin to 2mV",
        instruction: "Set aSensitivity to half the threshold (2mV) for safety margin",
        targetValues: { aSensitivity: 2 },
        allowedControls: ["aSensitivity"],
        completionCriteria: sensingThresholdCriteria,
        hint: "Half threshold for safety",
        flashingSensor: "right",
      },
      {
        id: "afib_step3",
        objective: "Check A capture threshold at 12mA",
        instruction: "Set rate to 84, slowly increase A output until 1:1 capture at 12mA",
        targetValues: { aOutput: 12, rate: 84 },
        allowedControls: ["aOutput", "rate"],
        completionCriteria: captureThresholdCriteria,
        hint: "A capture threshold is 12mA",
        flashingSensor: "left",
      },
      {
        id: "afib_step4",
        objective: "Set A output safety margin to 24mA",
        instruction: "Set A output to two times stimulation threshold (24mA)",
        targetValues: { aOutput: 24 },
        allowedControls: ["aOutput"],
        completionCriteria: captureThresholdCriteria,
        hint: "2x threshold for safety",
        flashingSensor: "left",
      },
      {
        id: "afib_step5",
        objective: "Check V wire sensitivity - find threshold at 5mV",
        instruction: "Set rate to 64, V sensitivity to 0.8mV, then slowly increase to find 5mV threshold",
        targetValues: { vSensitivity: 5, rate: 64 },
        allowedControls: ["vSensitivity", "rate"],
        completionCriteria: sensingThresholdCriteria,
        hint: "V wire sensing threshold is 5mV in this scenario",
        flashingSensor: "right",
      },
      {
        id: "afib_step6",
        objective: "Set V sensitivity safety margin to 2.5mV",
        instruction: "Set vSensitivity to half the threshold (2.5mV) for safety margin",
        targetValues: { vSensitivity: 2.5 },
        allowedControls: ["vSensitivity"],
        completionCriteria: sensingThresholdCriteria,
        hint: "Half threshold for safety",
        flashingSensor: "right",
      },
      {
        id: "afib_step7",
        objective: "Check V capture threshold at 10mA",
        instruction: "Set rate to 84, slowly increase V output until 1:1 capture at 10mA",
        targetValues: { vOutput: 10, rate: 84 },
        allowedControls: ["vOutput", "rate"],
        completionCriteria: captureThresholdCriteria,
        hint: "V capture threshold is 10mA",
        flashingSensor: "left",
      },
      {
        id: "afib_step8",
        objective: "Set V output safety margin to 20mA",
        instruction: "Set V output to two times stimulation threshold (20mA)",
        targetValues: { vOutput: 20 },
        allowedControls: ["vOutput"],
        completionCriteria: captureThresholdCriteria,
        hint: "2x threshold for safety",
        flashingSensor: "left",
      },
      {
        id: "afib_step9",
        objective: "Turn pacer off - wire testing complete",
        instruction: "Turn pacer off - we know the settings, patient doesn't need pacing yet",
        targetValues: {},
        allowedControls: [],
        completionCriteria: () => true,
        hint: "Wire testing complete, patient stable",
      },
      // A fib development phase
      {
        id: "afib_step10",
        objective: "Patient develops A fib - HR now 160, BP 98/56 (70)",
        instruction: "Patient complains of dizziness and racing heart. A fib with rapid rate developed.",
        targetValues: {},
        allowedControls: [],
        completionCriteria: () => true,
        hint: "High heart rate causes symptoms",
        expectedVitals: { heartRate: 160, bloodPressure: "98/56", mapPressure: 70 }
      },
      {
        id: "afib_step11",
        objective: "Medications given - HR now 38, BP 77/43 (54)",
        instruction: "After 3 boluses amiodarone 150mg and 2 doses metoprolol 5mg IV, HR=38, BP=77/43",
        targetValues: {},
        allowedControls: [],
        completionCriteria: () => true,
        hint: "Medications controlled rate but caused bradycardia",
        expectedVitals: { heartRate: Math.max(30, 38), bloodPressure: "77/43", mapPressure: 54 }
      },
      {
        id: "afib_step12",
        objective: "Initiate VVI pacing at 80 BPM",
        instruction: "Patient still in A fib but bradycardic. Use VVI pacing at 80 BPM with previous settings.",
        targetValues: { rate: 80 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "VVI mode appropriate for A fib with bradycardia",
        expectedVitals: { bloodPressure: "110/72", mapPressure: 85 }
      },
    ],
  },
};

export default moduleConfigs;