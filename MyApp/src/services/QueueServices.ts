import axios from 'axios';
import { Queue, QueueEntry, QueueAnalytics } from '../types/queue';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For USB debugging: Run `adb reverse tcp:5000 tcp:5000` on your computer
// For WiFi debugging: Use your computer's IP address (e.g., 'http://192.168.1.x:5000')
const BASE_URL = 'http://10.0.2.2:5000';
const API_URL = `${BASE_URL}/api/queues`;

// Get auth token from storage
const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch {
    return null;
  }
};

// Create axios instance with auth header
const createAuthHeader = async () => {
  const token = await getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all available queues
const getAllQueues = async (): Promise<Queue[]> => {
  const response = await axios.get(`${API_URL}`);
  return response.data;
};

// Get queues created by current user (admin)
const getMyQueues = async (): Promise<Queue[]> => {
  const config = await createAuthHeader();
  const response = await axios.get(`${API_URL}/my-queues`, config);
  return response.data;
};

// Get queue by ID
const getQueueById = async (queueId: string): Promise<Queue> => {
  const response = await axios.get(`${API_URL}/${queueId}`);
  return response.data;
};

// Get user's active queue entry
const getMyActiveQueue = async (): Promise<QueueEntry | null> => {
  const config = await createAuthHeader();
  const response = await axios.get(`${API_URL}/user/active`, config);
  return response.data;
};

// Get user's queue history
const getQueueHistory = async (): Promise<QueueEntry[]> => {
  console.log('Fetching queue history...');
  try {
    const config = await createAuthHeader();
    console.log('Auth header created:', config.headers);
    const response = await axios.get(`${API_URL}/user/history`, config);
    console.log('Queue history response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching queue history:', error);
    console.error('Error response:', error.response?.data);
    if (error.response?.status === 401) {
      // Token might be invalid, clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    throw error;
  }
};

// Join a queue
const joinQueue = async (queueId: string): Promise<QueueEntry> => {
  const config = await createAuthHeader();
  const response = await axios.post(`${API_URL}/${queueId}/join`, {}, config);
  return response.data;
};

// Leave a queue
const leaveQueue = async (queueId: string): Promise<{ message: string }> => {
  const config = await createAuthHeader();
  const response = await axios.post(`${API_URL}/${queueId}/leave`, {}, config);
  return response.data;
};

// Get queue entries (admin)
const getQueueEntries = async (queueId: string): Promise<QueueEntry[]> => {
  const config = await createAuthHeader();
  const response = await axios.get(`${API_URL}/${queueId}/entries`, config);
  return response.data;
};

// Call next user (admin)
const callNextUser = async (queueId: string): Promise<QueueEntry> => {
  const config = await createAuthHeader();
  const response = await axios.post(`${API_URL}/${queueId}/next`, {}, config);
  return response.data;
};

// Mark user as served (admin)
const markAsServed = async (
  queueId: string,
  entryId: string,
): Promise<QueueEntry> => {
  const config = await createAuthHeader();
  const response = await axios.post(
    `${API_URL}/${queueId}/served/${entryId}`,
    {},
    config,
  );
  return response.data;
};

// Create a new queue (admin)
const createQueue = async (queueData: {
  name: string;
  description?: string;
  maxSize?: number;
  averageServiceTime?: number;
}): Promise<Queue> => {
  const config = await createAuthHeader();
  const response = await axios.post(`${API_URL}`, queueData, config);
  return response.data;
};

// Update queue status (admin)
const updateQueueStatus = async (
  queueId: string,
  status: string,
): Promise<Queue> => {
  const config = await createAuthHeader();
  const response = await axios.put(
    `${API_URL}/${queueId}/status`,
    { status },
    config,
  );
  return response.data;
};

// Get queue analytics (admin)
const getQueueAnalytics = async (queueId: string): Promise<QueueAnalytics> => {
  const config = await createAuthHeader();
  const response = await axios.get(`${API_URL}/${queueId}/analytics`, config);
  return response.data;
};

const QueueService = {
  getAllQueues,
  getMyQueues,
  getQueueById,
  getMyActiveQueue,
  getQueueHistory,
  joinQueue,
  leaveQueue,
  getQueueEntries,
  callNextUser,
  markAsServed,
  createQueue,
  updateQueueStatus,
  getQueueAnalytics,
};

export default QueueService;
