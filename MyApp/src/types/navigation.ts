import { Queue, QueueEntry } from './queue';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// Main Stack (User)
export type UserStackParamList = {
  Dashboard: undefined;
  Queues: undefined;
  QueueDetail: { queueId: string };
  MyQueue: undefined;
  History: undefined;
};

// Admin Stack
export type AdminStackParamList = {
  AdminDashboard: undefined;
  CreateQueue: undefined;
  ManageQueue: { queueId: string };
  QueueAnalytics: { queueId: string };
};

// Root Navigator
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  User: undefined;
  Admin: undefined;
};
