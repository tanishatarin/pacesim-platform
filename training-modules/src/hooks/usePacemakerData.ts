// src/hooks/usePacemakerData.ts
import { useState, useEffect } from 'react';
import { PacemakerWebSocketClient } from '../utils/PacemakerWebSocketClient';
import type { PacemakerState } from '../utils/PacemakerWebSocketClient';

interface PacemakerDataHook {
  state: PacemakerState | null;
  isConnected: boolean;
  errorMessage: string | null;
  sendControlUpdate: (updates: Partial<PacemakerState>) => void;
  connect: () => void;
  disconnect: () => void;
}

let globalClient: PacemakerWebSocketClient | null = null;

export const usePacemakerData = (): PacemakerDataHook => {
  const [state, setState] = useState<PacemakerState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize client if not exists
  useEffect(() => {
    if (!globalClient) {
      // Try different server URLs in order of preference
      const serverUrls = [
        'ws://localhost:5001',        // When running on the Pi itself
        'ws://raspberrypi.local:5001', // When accessing Pi from network
        'ws://192.168.1.100:5001',    // Fallback IP (adjust as needed)
      ];
      
      const serverUrl = serverUrls[0]; // Start with localhost
      const token = 'secondary_app_token_456';
      
      console.log('🔌 Initializing WebSocket connection to:', serverUrl);
      globalClient = new PacemakerWebSocketClient(serverUrl, token);
    }

    const client = globalClient;

    // Set up event listeners
    const stateUnsubscribe = client.onStateChange((newState) => {
      console.log('📡 Received pacemaker state:', newState);
      setState(newState);
      setErrorMessage(null);
    });

    const connectionUnsubscribe = client.onConnectionStatus((connected) => {
      console.log('🔗 Connection status:', connected ? 'Connected' : 'Disconnected');
      setIsConnected(connected);
      if (!connected) {
        setErrorMessage('Disconnected from pacemaker server. Attempting to reconnect...');
      } else {
        setErrorMessage(null);
      }
    });

    // Clean up on unmount
    return () => {
      stateUnsubscribe();
      connectionUnsubscribe();
    };
  }, []);

  const connect = () => {
    if (globalClient) {
      console.log('🚀 Attempting to connect to pacemaker...');
      globalClient.connect();
    }
  };

  const disconnect = () => {
    if (globalClient) {
      console.log('🛑 Disconnecting from pacemaker...');
      globalClient.disconnect();
      setIsConnected(false);
      setState(null);
    }
  };

  const sendControlUpdate = (updates: Partial<PacemakerState>) => {
    if (!isConnected || !globalClient) {
      console.warn('⚠️ Cannot send update - not connected to server');
      setErrorMessage('Cannot send update - not connected to server');
      return;
    }

    try {
      console.log('📤 Sending control update:', updates);
      globalClient.sendControlUpdate(updates);
    } catch (error) {
      console.error('❌ Error sending control update:', error);
      setErrorMessage(`Error sending update: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return {
    state,
    isConnected,
    errorMessage,
    sendControlUpdate,
    connect,
    disconnect
  };
};