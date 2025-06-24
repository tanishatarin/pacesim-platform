import { useState, useEffect } from 'react';
import { PacemakerWebSocketClient } from '../utils/PacemakerWebSocketClient';
import type { PacemakerState } from '../utils/PacemakerWebSocketClient';

interface PacemakerDataHook {
  state: PacemakerState | null;
  isConnected: boolean;
  errorMessage: string | null;
  sendControlUpdate: (updates: Partial<PacemakerState>) => void;
}

// Single global client instance - matches your original
const sharedClient = new PacemakerWebSocketClient(
  'ws://localhost:5001',
  'secondary_app_token_456'
);

export const usePacemakerData = (): PacemakerDataHook => {
  const [state, setState] = useState<PacemakerState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Connect to the server immediately (like your original)
    sharedClient.connect();

    // Set up event listeners (like your original)
    const stateUnsubscribe = sharedClient.onStateChange((newState) => {
      // Filter out info messages
      if ((newState as any).type === 'info') {
        console.log('ℹ️ Server info:', (newState as any).message);
        return;
      }
      
      // Directly update state (no delays, like original)
      setState(newState);
      setErrorMessage(null);
    });

    const connectionUnsubscribe = sharedClient.onConnectionStatus((connected) => {
      setIsConnected(connected);
      if (!connected) {
        setErrorMessage('Disconnected from pacemaker server. Attempting to reconnect...');
      } else {
        setErrorMessage(null);
      }
    });

    // Clean up on unmount (like your original)
    return () => {
      stateUnsubscribe();
      connectionUnsubscribe();
      // Don't disconnect the shared client - keep it alive for other components
    };
  }, []); // Only run once like your original

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
    sendControlUpdate
  };
};