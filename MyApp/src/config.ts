/**
 * API Configuration
 *
 * For different debugging scenarios, use the appropriate URL:
 *
 * 1. USB Debugging (Physical Device):
 *    - Run: adb reverse tcp:5000 tcp:5000
 *    - Use: http://localhost:5000
 *
 * 2. Android Emulator:
 *    - Use: http://10.0.2.2:5000 (this is the emulator's alias for host localhost)
 *
 * 3. WiFi Debugging (Physical Device on same network):
 *    - Find your computer's IP: ipconfig (Windows) or ifconfig (Mac/Linux)
 *    - Use: http://YOUR_IP_ADDRESS:5000
 *
 * 4. Production:
 *    - Use your deployed server URL
 */

export const API_CONFIG = {
  // For USB debugging with physical device: Use localhost after running `adb reverse tcp:5000 tcp:5000`
  // For Android Emulator: Use http://10.0.2.2:5000
  // For WiFi debugging: Use your computer's IP (e.g., http://192.168.1.x:5000)
  BASE_URL: 'http://10.0.2.2:5000',

  // Timeout in milliseconds
  TIMEOUT: 10000,
};

export const AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  signup: '/api/auth/signup',
};

export const QUEUE_ENDPOINTS = {
  base: '/api/queues',
  myQueues: '/api/queues/my-queues',
  userActive: '/api/queues/user/active',
  userHistory: '/api/queues/user/history',
};
