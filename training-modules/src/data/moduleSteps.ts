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
  // 🆕 NEW: Patient vitals that can change per step
  patientVitals?: {
    intrinsicHeartRate?: number;
    bloodPressure?: string; // Format: "120/80" or "85/50"
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
  // 🆕 NEW: Default patient vitals for the module
  defaultPatientVitals: {
    intrinsicHeartRate: number;
    bloodPressure: string;
  };
}

// Default completion criteria - checks if values are within 10% or exact match
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

// Auto-complete function for observation steps
const autoCompleteCriteria = (
  currentParams: any,
  targetValues: any,
): boolean => {
  // Always return true for observation steps - they auto-complete after a delay
  return true;
};

export const moduleConfigs: Record<string, ModuleConfig> = {
  "1": {
    id: "1",
    title: "Scenario 1: Bradycardia Management",
    objective:
      "Diagnose and correct a failure to sense condition. Complete the knowledge check and then adjust the pacemaker.",
    scenario:
      "You return to a patient's room and observe this ECG pattern. Their heart rate has dropped to 40 BPM and atrial leads are connected.",
    ecgMode: "sensitivity",
    initialParams: {
      rate: 40,
      aOutput: 2,
      vOutput: 3,
      aSensitivity: 1,
      vSensitivity: 2,
    },
    // 🆕 NEW: Default patient vitals for this module
    defaultPatientVitals: {
      intrinsicHeartRate: 40,
      bloodPressure: "190/58", // Normal BP initially
    },
    steps: [
      {
        id: "step1",
        objective: "Decrease heart rate to 30 BPM",
        instruction:
          "Lower the pacing rate 10 BPM below the patient's intrinsic rate (30 BPM) to evaluate their intrinsic rhythm",
        targetValues: { rate: 30 },
        allowedControls: ["rate"],
        flashingSensor: "right",
        completionCriteria: defaultCompletionCriteria,
        hint: "Use the rate control to decrease the pacing rate 10 BPM below the patient's intrinsic rate",
        patientVitals: {
          intrinsicHeartRate: 40,
          bloodPressure: "190/58",
        },
      },
      {
        id: "step2",
        objective: "Set atrial output to 0.1 mA",
        instruction:
          "Reduce atrial output to minimal level for threshold testing",
        targetValues: { aOutput: 0.1 },
        allowedControls: ["aOutput"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Lower the atrial output to find the minimum capture threshold",
        patientVitals: {
          intrinsicHeartRate: 40,
          bloodPressure: "190/58",
        },
      },
      {
        id: "step3",
        objective: "Adjust aSensitivity to 0.4 mV",
        instruction:
          "Set atrial sensitivity to 0.4 mV to start sensitivity testing",
        targetValues: { aSensitivity: 0.4 },
        allowedControls: ["aSensitivity"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Start with lowest sensitivity and gradually increase",
        patientVitals: {
          intrinsicHeartRate: 40,
          bloodPressure: "190/58",
        },
      },
      {
        id: "step4",
        objective: "Find sensing threshold",
        instruction:
          "Slowly increase atrial sensitivity to 1.6 mV. Watch the sensing light - pace light will start flashing.",
        targetValues: { aSensitivity: 1.6 },
        allowedControls: ["aSensitivity"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "The sensing light represents the pacemaker detecting intrinsic cardiac activity. When you reach the threshold, it stops flashing, and the pacing light starts.",
        patientVitals: {
          intrinsicHeartRate: 40,
          bloodPressure: "190/58",
        },
      },
      {
        id: "step5",
        objective: "Set aSensitivity to safety margin",
        instruction:
          "Set atrial sensitivity to half of the threshold (0.8 mV) for a safety margin",
        targetValues: { aSensitivity: 0.8 },
        allowedControls: ["aSensitivity"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Use half the threshold value to ensure reliable sensing with a safety margin - the sesning light will turn back on",
        patientVitals: {
          intrinsicHeartRate: 40,
          bloodPressure: "190/58",
        },
      },
      {
        id: "step6",
        objective: "Set rate 10 bpm above intrinsic",
        instruction:
          "Increase pacing rate to 50 BPM (10 bpm above patient's intrinsic rate)",
        targetValues: { rate: 50 },
        allowedControls: ["rate"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Set the rate slightly above the patient's intrinsic rate to ensure pacing",
        patientVitals: {
          intrinsicHeartRate: 40,
          bloodPressure: "190/58",
        },
      },
      {
        id: "step7",
        objective: "Find capture threshold",
        instruction:
          "Slowly increase atrial output until you achieve consistent capture",
        targetValues: { aOutput: 4 },
        allowedControls: ["aOutput"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Gradually increase output until you see consistent capture after each pacing spike",
        patientVitals: {
          intrinsicHeartRate: 40,
          bloodPressure: "190/58",
        },
      },
      {
        id: "step8",
        objective: "Set output to 2x threshold",
        instruction:
          "Set atrial output to double the threshold (8 mA) for safety margin",
        targetValues: { aOutput: 8 },
        allowedControls: ["aOutput"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Double the threshold ensures reliable capture with safety margin",
        patientVitals: {
          intrinsicHeartRate: 40,
          bloodPressure: "190/58",
        },
      },
      {
        id: "step9",
        objective: "Restore physician-ordered rate",
        instruction: "Set final pacing rate to 80 BPM as ordered by physician",
        targetValues: { rate: 80 },
        allowedControls: ["rate"],
        flashingSensor: null,
        completionCriteria: defaultCompletionCriteria,
        hint: "Return to the prescribed pacing rate now that thresholds are established",
        // 🆕 NEW: With proper pacing at 80 BPM, patient's BP normalizes
        patientVitals: {
          intrinsicHeartRate: 80, // Still bradycardic without pacing
          bloodPressure: "95/60", // Much better with adequate pacing
        },
      },
    ],
  },

  // Module 2: NOW USING MODULE 3's COMPLEX A FIB STEPS BUT WITH MODULE 2's TITLE/SCENARIO
  "2": {
    id: "2",
    title: "Scenario 2: Third Degree Heart Block",
    objective:
      "Diagnose and manage third degree heart block with appropriate VVI pacing settings.",
    scenario:
      "50-year-old male, POD 3 from MVR. Patient feeling 'funny', HR is 30, BP is 85/50 MAP (62). You have 1V and 1 skin wire.",
    ecgMode: "third_degree_block",
    initialParams: {
      rate: 74, // Complex A fib initial params
      aOutput: 5,
      vOutput: 5,
      aSensitivity: 2,
      vSensitivity: 2,
    },
    defaultPatientVitals: {
      intrinsicHeartRate: 74, // From A fib module
      bloodPressure: "110/74",
    },
    steps: [
      {
        id: "td_step1",
        objective: "Set Heart Rate to 64 BPM",
        instruction:
          "Set rate to 64 to start testing atrial pacing",
        targetValues: { rate: 64 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Set HR to 10 BPM below intrinsic rate to evaluate sensing",
        patientVitals: {
          intrinsicHeartRate: 74,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step2",
        objective: "Set A Output to 0.1mA to start threshold testing",
        instruction:
          "Set A outout to 0.1mA",
        targetValues: { aOutput: 0.1 },
        allowedControls: ["aOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "To being threshold testing, output value shoudl be at the loweest",
        patientVitals: {
          intrinsicHeartRate: 74,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step3",
        objective: "Set A Sensitivity to find the sensing threshold",
        instruction:
          "Set A Sensitivity to 4.0mA",
        targetValues: { aSensitivity: 4 },
        allowedControls: ["aSensitivity"],
        completionCriteria: defaultCompletionCriteria,
        hint: "To being threshold testing, output value shoudl be at the loweest",
        patientVitals: {
          intrinsicHeartRate: 74,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step4",
        objective: "Set A sensitivity safety margin to 2mV",
        instruction:
          "Set aSensitivity to half the threshold (2mV) for safety margin",
        targetValues: { aSensitivity: 2 },
        allowedControls: ["aSensitivity"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Half threshold for safety",
        patientVitals: {
          intrinsicHeartRate: 74,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step5",
        objective: "Set Rate to 84 BPM",
        instruction:
          "Set rate to 84 (10 BPM above intrinsic rate)",
        targetValues: { rate: 84 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Set 10 BPM above intrinsic rate",
        patientVitals: {
          intrinsicHeartRate: 74,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step6",
        objective: "Find A capture threshold at 10mA",
        instruction:
          "Slowly increase aOutput until close to capture at 10mA (HR shows 80)",
        targetValues: { aOutput: 10},
        allowedControls: ["aOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Close to A capture at 10mA",
        patientVitals: {
          intrinsicHeartRate: 80,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step7",
        objective: "Achieve A full capture (1:1) at 12mA",
        instruction:
          "Continue increasing aOutput until full 1:1 A capture (HR=84) at 12mA",
        targetValues: { aOutput: 12 },
        allowedControls: ["aOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Full atrial capture at 12mA",
        patientVitals: {
          intrinsicHeartRate: 84,
          bloodPressure: "110/74", 
        },
      },
      {
        id: "td_step8",
        objective: "Set A output safety margin to 20mA",
        instruction:
          "Set aOutput to maximum threshold (20mA) for safety margin, since double (24) is out of range of Paceaker's ability",
        targetValues: { aOutput: 20 },
        allowedControls: ["aOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Double threshold for safety",
        patientVitals: {
          intrinsicHeartRate: 84,
          bloodPressure: "110/74", 
        },
      },
      // V wire testing
      {
        id: "td_step9",
        objective: "Set Heart Rate to 74 BPM",
        instruction:
          "Set rate to 4 to start testing ventricular pacing - 10 below patient's intrinsic rate",
        targetValues: { rate: 74 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Set HR to 10 BPM below intrinsic rate to evaluate sensing",
        patientVitals: {
          intrinsicHeartRate: 84,
          bloodPressure: "110/74",
        },
      },
       {
        id: "td_step10",
        objective: "Set V output to 0.1mA to start threshold testing",
        instruction:
          "Set V output to 0.1mA",
        targetValues: { vOutput: 0.1 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Set V output to 0.1mA to start threshold testing",
        patientVitals: {
          intrinsicHeartRate: 84,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step11",
        objective: "Find V sensing threshold at 5mV",
        instruction:
          "Test V wires: slowly increase vSensitivity from 0.8mV to threshold (5mV)",
        targetValues: { vSensitivity: 5 },
        allowedControls: ["vSensitivity"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Increase vSensitivity until sense indicator stops flashing",
        patientVitals: {
          intrinsicHeartRate: 84, 
          bloodPressure: "110/74", 
        },
      },
      {
        id: "td_step12",
        objective: "Set V sensitivity safety margin to half the threshold (2.5mV)",
        instruction:
          "Set vSensitivity to half the threshold (2.5mV) for safety",
        targetValues: { vSensitivity: 2.5 },
        allowedControls: ["vSensitivity"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Half threshold for safety margin",
        patientVitals: {
          intrinsicHeartRate: 84,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step13",
        objective: "Set Rate to 94 BPM",
        instruction:
          "Set rate to 94 BPM, 10 BPM above intrinsic rate",
        targetValues: { rate: 94 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Half threshold for safety margin",
        patientVitals: {
          intrinsicHeartRate: 84,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step14",
        objective: "Find V capture threshold at 8mA",
        instruction:
          "Test V capture: slowly increase vOutput until close to capture at 8mA",
        targetValues: { vOutput: 8 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Close to V capture at 8mA",
        patientVitals: {
          intrinsicHeartRate: 90,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step15",
        objective: "Achieve V full capture (1:1) at 10mA",
        instruction:
          "Continue increasing vOutput until full 1:1 V capture (HR=84) at 10mA",
        targetValues: { vOutput: 10 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Full ventricular capture at 10mA",
        patientVitals: {
          intrinsicHeartRate: 94,
          bloodPressure: "110/74",
        },
      },
      {
        id: "td_step16",
        objective: "Set V output safety margin to 20mA",
        instruction: "Set vOutput to double the threshold (20mA) for safety",
        targetValues: { vOutput: 20 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Double threshold for safety",
        patientVitals: {
          intrinsicHeartRate: 160,
          bloodPressure: "98/56",
        },
      },
      // Patient develops A fib and needs VVI pacing
      {
        id: "td_step17",
        objective: "7 hours later - patient complains of dizziness and states his heart is racing - turn on VVI at 80 BPM",
        instruction:
          "Patient now in A fib with bradycardia after medications. Set VVI pacing at 80 BPM",
        targetValues: { rate: 80 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "VVI pacing needed due to medication-induced bradycardia in A fib",
        patientVitals: {
          intrinsicHeartRate: 38,
          bloodPressure: "77/43",
        },
      },
    ],
  },

  // Module 3: NOW USING MODULE 2's SIMPLE STEPS BUT WITH MODULE 3's TITLE/SCENARIO
  "3": {
    id: "3",
    title: "Scenario 3: Atrial Fibrillation with Bradycardia",
    objective:
      "Manage atrial fibrillation patient who developed bradycardia after rate control medications.",
    scenario:
      "68-year-old male, POD 3 from AVR. Developed A fib with HR=160. After amiodarone and metoprolol, HR=38, BP=77/43 (54). You have 2A and 2V wires.",
    ecgMode: "atrial_fibrillation",
    initialParams: {
      rate: 40, // Simple third degree block params
      aOutput: 1,
      vOutput: 1,
      aSensitivity: 1,
      vSensitivity: 1,
    },
    defaultPatientVitals: {
      intrinsicHeartRate: 40, // From third degree block module
      bloodPressure: "85/50",
    },
    steps: [
      {
        id: "afib_step1",
        objective: "Set heart rate to 30 BPM",
        instruction:
          "Set the heart rate to 30 (at least 10 beats/min lower than patient's intrinsic rate)",
        targetValues: { rate: 30 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Ensures non-pacing because set rate is below patient's intrinsic rate",
        patientVitals: {
          intrinsicHeartRate: 30,
          bloodPressure: "85/50",
        },
      },
      {
        id: "afib_step2",
        objective: "Set ventricular output to 0.1mA",
        instruction:
          "Adjust ventricular output to 0.1mA to prevent asynchronous pacing",
        targetValues: { vOutput: 0.1 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Capture is not likely because output is at minimum",
        patientVitals: {
          intrinsicHeartRate: 30,
          bloodPressure: "85/50",
        },
      },
      {
        id: "afib_step3",
        objective: "Set V sensitivity to maximum (0.8mV)",
        instruction:
          "Adjust vSensitivity to 0.8mV (highest possible sensitivity for V wires)",
        targetValues: { vSensitivity: 0.8 },
        allowedControls: ["vSensitivity"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Start with highest sensitivity for V wires",
        patientVitals: {
          intrinsicHeartRate: 30,
          bloodPressure: "85/50",
        },
      },
      {
        id: "afib_step4",
        objective: "Find V sensing threshold at 2.0mV",
        instruction:
          "Slowly increase vSensitivity to 2.0mV until sense indicator stops flashing",
        targetValues: { vSensitivity: 2.0 },
        allowedControls: ["vSensitivity"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Sensing threshold occurs at 2.0mV in this scenario",
        patientVitals: {
          intrinsicHeartRate: 30,
          bloodPressure: "85/50",
        },
      },
      {
        id: "afib_step5",
        objective: "Set V sensitivity to half threshold (1.0mV)",
        instruction:
          "Set vSensitivity to half the sensing threshold (1.0mV) for safety margin",
        targetValues: { vSensitivity: 1.0 },
        allowedControls: ["vSensitivity"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Half threshold provides safety margin",
        patientVitals: {
          intrinsicHeartRate: 30,
          bloodPressure: "85/50",
        },
      },
      {
        id: "afib_step6",
        objective: "Set rate to 50 BPM",
        instruction:
          "Turn pacemaker rate up to 50 (10 beats/min higher than patient's intrinsic rate)",
        targetValues: { rate: 50 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "10 BPM above patient's intrinsic escape rate",
        patientVitals: {
          intrinsicHeartRate: 30,
          bloodPressure: "90/55",
        },
      },
      {
        id: "afib_step7",
        objective: "Find V capture threshold, look for 1:1 capture where there is a pacing spike",
        instruction:
          "Slowly increase vOutput. Close to 1:1 capture shows pacing spike at 5mA",
        targetValues: { vOutput: 5 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Getting close to capture at 5mA",
        patientVitals: {
          intrinsicHeartRate: 47,
          bloodPressure: "95/55",
        },
      },
      {
        id: "afib_step8",
        objective: "Achieve full V capture when intrinsic HR is 50 BPM",
        instruction:
          "Continue increasing vOutput until HR=50 on monitor (full capture at 7mA)",
        targetValues: { vOutput: 7 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Full 1:1 capture occurs at 7mA",
        patientVitals: {
          intrinsicHeartRate: 50,
          bloodPressure: "105/70",
        },
      },
      {
        id: "afib_step9",
        objective: "Set safety margin to double when full capture was achieved",
        instruction:
          "Set vOutput to two times the stimulation threshold (14mA) for safety",
        targetValues: { vOutput: 14 },
        allowedControls: ["vOutput"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Double the threshold for safety margin",
        patientVitals: {
          intrinsicHeartRate: 50,
          bloodPressure: "105/70"
        },
      },
      {
        id: "afib_step10",
        objective: "Set final rate to 80 BPM",
        instruction: "Set pacemaker to 80 BPM per prescriber order",
        targetValues: { rate: 80 },
        allowedControls: ["rate"],
        completionCriteria: defaultCompletionCriteria,
        hint: "Final prescribed rate",
        patientVitals: {
          intrinsicHeartRate: 50,
          bloodPressure: "105/70",
        },
      },
    ],
  },
};