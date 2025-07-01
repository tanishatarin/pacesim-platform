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
}

export interface ModuleConfig {
  id: string;
  title: string;
  objective: string;
  scenario: string;
  steps: ModuleStep[];
  ecgMode: "sensitivity" | "oversensing" | "undersensing" | "capture_module" | "failure_to_capture";
  initialParams: {
    rate: number;
    aOutput: number;
    vOutput: number;
    aSensitivity: number;
    vSensitivity: number;
  };
}

// Default completion criteria - checks if values are within 10% or exact match
const defaultCompletionCriteria = (currentParams: any, targetValues: any): boolean => {
  for (const [key, targetValue] of Object.entries(targetValues)) {
    const currentValue = currentParams[key];
    if (typeof targetValue === 'number' && typeof currentValue === 'number') {
      const tolerance = Math.max(0.1, targetValue * 0.1); // 10% tolerance or 0.1 minimum
      if (Math.abs(currentValue - targetValue) > tolerance) {
        return false;
      }
    } else if (targetValue !== currentValue) {
      return false;
    }
  }
  return true;
};

export const moduleConfigs: Record<string, ModuleConfig> = {
  "1": {
    id: "1",
    title: "Scenario 1: Bradycardia Management",
    objective: "Diagnose and correct a failure to sense condition. Complete the knowledge check and then adjust the pacemaker.",
    scenario: "You return to a patient's room and observe this ECG pattern. Their heart rate has dropped to 40 BPM and atrial leads are connected.",
    ecgMode: "sensitivity",
    initialParams: {
      rate: 40,
      aOutput: 2,
      vOutput: 3,
      aSensitivity: 1,
      vSensitivity: 2,
    },
    steps: [
      {
        id: "step1",
        objective: "Decrease heart rate to 30 BPM",
        instruction: "Lower the pacing rate to 30 BPM to evaluate the patient's intrinsic rhythm",
        targetValues: { rate: 30 },
        allowedControls: ["rate"],
        flashingSensor: "right",
        completionCriteria: defaultCompletionCriteria,
        hint: "Use the rate control to decrease the pacing rate below the patient's intrinsic rate"
      },
      {
        id: "step2",
        objective: "Set atrial output to 0.1 mA",
        instruction: "Reduce atrial output to minimal level for threshold testing",
        targetValues: { aOutput: 0.1 },
        allowedControls: ["aOutput"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Lower the atrial output to find the minimum capture threshold"
      },
      {
        id: "step3",
        objective: "Adjust aSensitivity to 0.4 mV",
        instruction: "Set atrial sensitivity to 0.4 mV to start sensitivity testing",
        targetValues: { aSensitivity: 0.4 },
        allowedControls: ["aSensitivity"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Start with a lower sensitivity value and gradually increase"
      },
      {
        id: "step4",
        objective: "Increase aSensitivity to 1.6 mV",
        instruction: "Slowly increase atrial sensitivity until the sensing light stops flashing. This indicates you've found the sensing threshold.",
        targetValues: { aSensitivity: 1.6 },
        allowedControls: ["aSensitivity"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Watch the sensing light - when it stops flashing, you've hit the threshold"
      },
      {
        id: "step5",
        objective: "Set aSensitivity to safety margin",
        instruction: "Set atrial sensitivity to half of the threshold (0.8 mV) for a safety margin",
        targetValues: { aSensitivity: 0.8 },
        allowedControls: ["aSensitivity"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Use half the threshold value to ensure reliable sensing with a safety margin"
      },
      {
        id: "step6",
        objective: "Set rate 10 bpm above intrinsic",
        instruction: "Increase pacing rate to 50 BPM (10 bpm above patient's intrinsic rate of 40)",
        targetValues: { rate: 50 },
        allowedControls: ["rate"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Set the rate slightly above the patient's intrinsic rate to ensure pacing"
      },
      {
        id: "step7",
        objective: "Find capture threshold",
        instruction: "Slowly increase atrial output until you achieve consistent capture",
        targetValues: { aOutput: 4 },
        allowedControls: ["aOutput"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Gradually increase output until you see consistent capture after each pacing spike"
      },
      {
        id: "step8",
        objective: "Set output to 2x threshold",
        instruction: "Set atrial output to double the threshold (8 mA) for safety margin",
        targetValues: { aOutput: 8 },
        allowedControls: ["aOutput"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Double the threshold ensures reliable capture with safety margin"
      },
      {
        id: "step9",
        objective: "Restore physician-ordered rate",
        instruction: "Set final pacing rate to 80 BPM as ordered by physician",
        targetValues: { rate: 80 },
        allowedControls: ["rate"],
        flashingSensor: null,
        completionCriteria: defaultCompletionCriteria,
        hint: "Return to the prescribed pacing rate now that thresholds are established"
      }
    ]
  },

  "2": {
    id: "2",
    title: "Scenario 2: Oversensing Issues",
    objective: "Identify and correct oversensing problems causing inappropriate pacing inhibition.",
    scenario: "The pacemaker is detecting signals that shouldn't inhibit pacing, causing irregular pacing patterns.",
    ecgMode: "oversensing",
    initialParams: {
      rate: 70,
      aOutput: 5,
      vOutput: 5,
      aSensitivity: 4,
      vSensitivity: 4,
    },
    steps: [
      {
        id: "step1",
        objective: "Identify oversensing",
        instruction: "Observe the ECG pattern and identify inappropriate pacing inhibition",
        targetValues: {}, // No parameter changes, just observation
        allowedControls: [],
        flashingSensor: "right",
        completionCriteria: () => true, // Auto-advance after delay
        hint: "Look for pacing spikes that should be present but are missing due to false sensing"
      },
      {
        id: "step2",
        objective: "Decrease ventricular sensitivity",
        instruction: "Reduce ventricular sensitivity to 2.0 mV to prevent false sensing",
        targetValues: { vSensitivity: 2.0 },
        allowedControls: ["vSensitivity"],
        flashingSensor: "right",
        completionCriteria: defaultCompletionCriteria,
        hint: "Decreasing sensitivity makes the pacemaker less likely to detect false signals"
      },
      {
        id: "step3",
        objective: "Check atrial sensitivity",
        instruction: "Also reduce atrial sensitivity to 2.0 mV if oversensing persists",
        targetValues: { aSensitivity: 2.0 },
        allowedControls: ["aSensitivity"],
        flashingSensor: "left",
        completionCriteria: defaultCompletionCriteria,
        hint: "Both chambers may need sensitivity adjustment to eliminate oversensing"
      },
      {
        id: "step4",
        objective: "Verify normal pacing",
        instruction: "Confirm that pacing is now occurring at the expected intervals",
        targetValues: {},
        allowedControls: [],
        flashingSensor: null,
        completionCriteria: () => true,
        hint: "The ECG should now show regular pacing spikes at the programmed rate"
      }
    ]
  },

  "3": {
    id: "3",
    title: "Scenario 3: Undersensing Problems", 
    objective: "Correct undersensing issues where the pacemaker fails to detect intrinsic cardiac activity.",
    scenario: "The pacemaker is not sensing the patient's own heartbeats, leading to unnecessary pacing.",
    ecgMode: "undersensing",
    initialParams: {
      rate: 60,
      aOutput: 5,
      vOutput: 5,
      aSensitivity: 0.5,
      vSensitivity: 0.8,
    },
    steps: [
      {
        id: "step1",
        objective: "Identify undersensing",
        instruction: "Observe pacing spikes occurring despite intrinsic rhythm",
        targetValues: {},
        allowedControls: [],
        flashingSensor: "right",
        completionCriteria: () => true,
        hint: "Look for pacing spikes that occur too close to intrinsic beats"
      },
      {
        id: "step2", 
        objective: "Increase ventricular sensitivity",
        instruction: "Increase ventricular sensitivity to 2.0 mV to better detect intrinsic beats",
        targetValues: { vSensitivity: 2.0 },
        allowedControls: ["vSensitivity"],
        flashingSensor: "right",
        completionCriteria: defaultCompletionCriteria,
        hint: "Higher sensitivity helps detect smaller intrinsic signals"
      },
      {
        id: "step3",
        objective: "Increase atrial sensitivity", 
        instruction: "Also increase atrial sensitivity to 1.5 mV for proper atrial sensing",
        targetValues: { aSensitivity: 1.5 },
        allowedControls: ["aSensitivity"],
        flashingSensor: "left", 
        completionCriteria: defaultCompletionCriteria,
        hint: "Both chambers need appropriate sensitivity for proper sensing"
      },
      {
        id: "step4",
        objective: "Verify appropriate sensing",
        instruction: "Confirm the pacemaker now properly inhibits when intrinsic beats occur",
        targetValues: {},
        allowedControls: [],
        flashingSensor: null,
        completionCriteria: () => true,
        hint: "Pacing should only occur when intrinsic beats are not detected"
      }
    ]
  },

  "4": {
    id: "4", 
    title: "Capture Calibration Module",
    objective: "Learn to establish and verify proper cardiac capture.",
    scenario: "Practice adjusting output levels to achieve consistent capture.",
    ecgMode: "capture_module",
    initialParams: {
      rate: 80,
      aOutput: 3,
      vOutput: 2,
      aSensitivity: 2,
      vSensitivity: 2,
    },
    steps: [
      {
        id: "step1",
        objective: "Start with low output",
        instruction: "Begin with ventricular output at 1.0 mA to find threshold",
        targetValues: { vOutput: 1.0 },
        allowedControls: ["vOutput"],
        flashingSensor: "right",
        completionCriteria: defaultCompletionCriteria,
        hint: "Start low and gradually increase to find the minimum capture threshold"
      },
      {
        id: "step2",
        objective: "Increase until capture",
        instruction: "Gradually increase ventricular output until consistent capture is achieved",
        targetValues: { vOutput: 3.5 },
        allowedControls: ["vOutput"],
        flashingSensor: "right", 
        completionCriteria: defaultCompletionCriteria,
        hint: "Each pacing spike should be followed by a QRS complex when capture occurs"
      },
      {
        id: "step3",
        objective: "Set safety margin",
        instruction: "Set output to double the threshold for safety (7.0 mA)",
        targetValues: { vOutput: 7.0 },
        allowedControls: ["vOutput"],
        flashingSensor: "right",
        completionCriteria: defaultCompletionCriteria,
        hint: "Double the threshold provides a safety margin for reliable capture"
      }
    ]
  },

  "5": {
    id: "5",
    title: "Failure to Capture",
    objective: "Diagnose and correct failure to capture situations.",
    scenario: "Pacing spikes are present but not followed by cardiac depolarization.",
    ecgMode: "failure_to_capture", 
    initialParams: {
      rate: 70,
      aOutput: 1,
      vOutput: 1,
      aSensitivity: 2,
      vSensitivity: 2,
    },
    steps: [
      {
        id: "step1",
        objective: "Identify failure to capture",
        instruction: "Observe pacing spikes without corresponding QRS complexes",
        targetValues: {},
        allowedControls: [],
        flashingSensor: "right",
        completionCriteria: () => true,
        hint: "Look for pacing artifacts that are not followed by cardiac depolarization"
      },
      {
        id: "step2",
        objective: "Increase ventricular output",
        instruction: "Increase ventricular output to 5.0 mA to achieve capture",
        targetValues: { vOutput: 5.0 },
        allowedControls: ["vOutput"],
        flashingSensor: "right",
        completionCriteria: defaultCompletionCriteria,
        hint: "Higher output energy is needed to stimulate the heart muscle"
      },
      {
        id: "step3", 
        objective: "Verify capture achieved",
        instruction: "Confirm each pacing spike now produces a QRS complex",
        targetValues: {},
        allowedControls: [],
        flashingSensor: null,
        completionCriteria: () => true,
        hint: "Successful capture shows QRS complexes following each pacing spike"
      }
    ]
  }
};