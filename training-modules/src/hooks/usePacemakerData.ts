import { useState, useEffect, useRef } from 'react';
import { PacemakerWebSocketClient } from '../utils/PacemakerWebSocketClient';
import type { PacemakerState } from '../utils/PacemakerWebSocketClient';

interface PacemakerDataHook {
  state: PacemakerState | null;
  isConnected: boolean;
  errorMessage: string | null;
  sendControlUpdate: (updates: Partial<PacemakerState>) => void;
  lastKnownState: PacemakerState | null; // Expose last known state
}

// Single global client instance
const sharedClient = new PacemakerWebSocketClient(
  'ws://localhost:5001',
  'secondary_app_token_456'
);

export const usePacemakerData = (): PacemakerDataHook => {
  const [state, setState] = useState<PacemakerState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Track last state and connection status
  const lastStateRef = useRef<PacemakerState | null>(null);
  const wasConnectedRef = useRef<boolean>(false);
  const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Connect immediately
    sharedClient.connect();

    const stateUnsubscribe = sharedClient.onStateChange((newState) => {
      // Filter out info messages
      if ((newState as any).type === 'info') {
        console.log('ℹ️ Server info:', (newState as any).message);
        return;
      }
      
      // Only update if state actually changed
      const lastState = lastStateRef.current;
      if (!lastState || 
          lastState.rate !== newState.rate ||
          lastState.a_output !== newState.a_output ||
          lastState.v_output !== newState.v_output ||
          lastState.aSensitivity !== newState.aSensitivity ||
          lastState.vSensitivity !== newState.vSensitivity ||
          lastState.mode !== newState.mode ||
          lastState.batteryLevel !== newState.batteryLevel) {
        
        lastStateRef.current = newState;
        setState(newState);
        setErrorMessage(null);
      }
    });

    const connectionUnsubscribe = sharedClient.onConnectionStatus((connected) => {
      const wasConnected = wasConnectedRef.current;
      wasConnectedRef.current = connected;
      
      setIsConnected(connected);
      
      if (connected) {
        // Connected - clear any pending fallback
        if (disconnectTimeoutRef.current) {
          clearTimeout(disconnectTimeoutRef.current);
          disconnectTimeoutRef.current = null;
        }
        
        // If we were previously connected and had pacemaker mode, restore it
        const currentMode = localStorage.getItem('connectionMode');
        if (wasConnected && currentMode === 'simulated' && lastStateRef.current) {
          console.log('🔌 Reconnected! Switching back to pacemaker mode');
          localStorage.setItem('connectionMode', 'pacemaker');
          // Trigger storage event for ModulePage
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: 'connectionMode',
              newValue: 'pacemaker',
            })
          );
        }
        
        setErrorMessage(null);
      } else {
        // Disconnected - start fallback timer
        console.log('🔗 Connection lost, starting fallback timer...');
        setErrorMessage('Connection lost. Will switch to simulation in 3 seconds...');
        
        // Only fallback if we were previously connected (not initial connection failure)
        if (wasConnected && lastStateRef.current) {
          disconnectTimeoutRef.current = setTimeout(() => {
            console.log('📱 Switching to simulation mode with last known values');
            localStorage.setItem('connectionMode', 'simulated');
            // Trigger storage event for ModulePage
            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'connectionMode',
                newValue: 'simulated',
              })
            );
            setErrorMessage('Using simulation mode with last known values');
          }, 3000); // 3 second delay before fallback
        }
      }
    });

    return () => {
      stateUnsubscribe();
      connectionUnsubscribe();
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
      }
    };
  }, []);

  const sendControlUpdate = (updates: Partial<PacemakerState>) => {
    if (!isConnected) {
      setErrorMessage('Cannot send update - not connected to server');
      return;
    }

    try {
      sharedClient.sendControlUpdate(updates);
    } catch (error) {
      console.error('Error sending control update:', error);
      setErrorMessage(`Error sending update: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return {
    state,
    isConnected,
    errorMessage,
    sendControlUpdate,
    lastKnownState: lastStateRef.current // Expose for fallback use
  };
};