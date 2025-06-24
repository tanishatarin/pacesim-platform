import { useState, useEffect, useRef, useCallback } from 'react';
import { PacemakerWebSocketClient } from '../utils/PacemakerWebSocketClient';
import type { PacemakerState } from '../utils/PacemakerWebSocketClient';

interface PacemakerDataHook {
  state: PacemakerState | null;
  isConnected: boolean;
  errorMessage: string | null;
  sendControlUpdate: (updates: Partial<PacemakerState>) => void;
}

// Single global client instance
let globalClient: PacemakerWebSocketClient | null = null;
let connectionAttempted = false;

export const usePacemakerData = (): PacemakerDataHook => {
  const [state, setState] = useState<PacemakerState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Use refs to avoid recreating functions that cause useEffect loops
  const retryCount = useRef(0);
  const connectionTimeout = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryDelay = 2000;

  // Stable functions that won't cause useEffect loops
  const fallbackToSimulation = useCallback(() => {
    console.log('📱 Falling back to simulation mode');
    localStorage.setItem('connectionMode', 'simulated');
    setErrorMessage('Hardware unavailable - using simulation mode');
    retryCount.current = 0;
    
    // Clear any pending timeout
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current);
      connectionTimeout.current = null;
    }
    
    // Trigger storage event so ModulePage knows about the change
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'connectionMode',
        newValue: 'simulated',
      })
    );
  }, []);

  const handleDisconnection = useCallback(() => {
    if (retryCount.current < maxRetries) {
      retryCount.current++;
      console.log(`🔄 Connection lost. Retry attempt ${retryCount.current}/${maxRetries} in ${retryDelay/1000}s...`);
      
      setErrorMessage(`Connection lost. Retrying... (${retryCount.current}/${maxRetries})`);
      
      // Schedule retry
      connectionTimeout.current = setTimeout(() => {
        if (globalClient) {
          globalClient.connect();
        }
      }, retryDelay);
      
    } else {
      // Max retries reached - fallback to simulation
      console.log('❌ Max connection retries reached. Switching to simulation mode.');
      fallbackToSimulation();
    }
  }, [fallbackToSimulation]);

  const initializeAndConnect = useCallback(() => {
    try {
      if (!globalClient) {
        const serverUrl = 'ws://localhost:5001';
        const token = 'secondary_app_token_456';
        
        console.log('🔌 Creating WebSocket client:', serverUrl);
        globalClient = new PacemakerWebSocketClient(serverUrl, token);
      }

      const client = globalClient;

      // Set up event listeners (only once)
      if (!(client as any)._listenersSetup) {
        const stateUnsubscribe = client.onStateChange((newState) => {
          // Filter out info messages
          if ((newState as any).type === 'info') {
            console.log('ℹ️ Server info:', (newState as any).message);
            return;
          }
          
          console.log('📡 Received pacemaker state:', newState);
          setState(newState);
          setErrorMessage(null);
        });

        const connectionUnsubscribe = client.onConnectionStatus((connected) => {
          console.log('🔗 Connection status changed:', connected ? 'Connected' : 'Disconnected');
          setIsConnected(connected);
          
          if (connected) {
            // Successfully connected - switch to pacemaker mode
            console.log('✅ Hardware connection successful!');
            localStorage.setItem('connectionMode', 'pacemaker');
            setErrorMessage(null);
            retryCount.current = 0;
            
            // Clear any pending retry timeout
            if (connectionTimeout.current) {
              clearTimeout(connectionTimeout.current);
              connectionTimeout.current = null;
            }
          } else {
            // Disconnected - handle retry logic
            handleDisconnection();
          }
        });

        // Mark listeners as setup
        (client as any)._listenersSetup = true;
        (client as any)._cleanupFunctions = { stateUnsubscribe, connectionUnsubscribe };
      }

      // Attempt connection
      client.connect();

    } catch (error) {
      console.error('❌ Error initializing WebSocket:', error);
      setErrorMessage(`Failed to initialize: ${error}`);
      fallbackToSimulation();
    }
  }, [handleDisconnection, fallbackToSimulation]);

  // Auto-initialize and connect on first use - NO DEPENDENCIES to avoid loops
  useEffect(() => {
    if (!connectionAttempted) {
      connectionAttempted = true;
      console.log('🚀 Auto-initializing WebSocket connection...');
      
      // Set connection mode to auto-connecting initially
      localStorage.setItem('connectionMode', 'auto-connecting');
      
      initializeAndConnect();
    }
  }, []); // EMPTY dependency array - only run once

  const sendControlUpdate = useCallback((updates: Partial<PacemakerState>) => {
    if (!isConnected || !globalClient) {
      console.warn('⚠️ Cannot send update - not connected to server');
      setErrorMessage('Cannot send update - not connected to server');
      return;
    }

    try {
      console.log('📤 Sending control update:', updates);
      globalClient.sendControlUpdate(updates);
      setErrorMessage(null);
    } catch (error) {
      console.error('❌ Error sending control update:', error);
      setErrorMessage(`Error sending update: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeout.current) {
        clearTimeout(connectionTimeout.current);
      }
    };
  }, []);

  return {
    state,
    isConnected,
    errorMessage,
    sendControlUpdate
  };
};