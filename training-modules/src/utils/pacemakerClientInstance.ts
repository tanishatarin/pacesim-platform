import { PacemakerWebSocketClient } from "./PacemakerWebSocketClient";

// Configuration for different environments
const getWebSocketConfig = () => {
  // Check if we're in development or production
  const isDevelopment = import.meta.env.DEV;
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Default configuration for Raspberry Pi deployment
  let serverUrl = "ws://localhost:5001";
  let authToken = "secondary_app_token_456";

  if (isDevelopment) {
    // Development configuration - check for custom server
    serverUrl = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:5001";
    authToken =
      import.meta.env.VITE_WEBSOCKET_TOKEN || "secondary_app_token_456";
  } else if (isLocalhost) {
    // Production on Raspberry Pi
    serverUrl = "ws://localhost:5001";
    authToken = "secondary_app_token_456";
  } else {
    // Try Raspberry Pi hostname as fallback
    serverUrl = "ws://raspberrypi.local:5001";
    authToken = "secondary_app_token_456";
  }

  return { serverUrl, authToken };
};

const { serverUrl, authToken } = getWebSocketConfig();

console.log(`🔌 Initializing WebSocket connection to: ${serverUrl}`);

const sharedClient = new PacemakerWebSocketClient(serverUrl, authToken);

export default sharedClient;
