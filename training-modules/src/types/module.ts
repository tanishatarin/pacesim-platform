// import { PacemakerState } from "@/utils/PacemakerWebSocketClient";

// todo fix this later !! !
// pasted in for now bc dont want to deal with pasTING IN ALLL OF THE FILES SINCE IM REFACTOPRING RN
export interface PacemakerState {
  rate: number;
  a_output: number;
  v_output: number;
  aSensitivity: number;
  vSensitivity: number;
  mode: number;
  isLocked: boolean;
  isPaused: boolean;
  pauseTimeLeft: number;
  batteryLevel: number;
  lastUpdate: number;
}

export interface SensorState {
  left: boolean;
  right: boolean;
}

export interface PacemakerInfoItem {
  label: string;
  value: string;
}

// export interface ModuleStep {
//   id: string;
//   objective: string;
//   allowedControls: string[];
//   targetValues?: Partial<PacemakerState>;
//   sensorStates?: {
//     left: boolean;
//     right: boolean;
//   };
//   flashingSensor?: "left" | "right" | null;
// }

export interface ModuleStep {
  id: string;
  objective: string;
  allowedControls: string[];
  targetValues?: Partial<PacemakerState>;
  sensorStates?: {
    left: boolean;
    right: boolean;
  };
  flashingSensor?: "left" | "right" | null;
}
