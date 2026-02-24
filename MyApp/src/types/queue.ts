// Queue Types
export interface Queue {
  _id: string;
  name: string;
  description?: string;
  admin: string | { _id: string; email: string };
  maxSize: number;
  currentToken: number;
  nowServingToken: number | null;
  status: 'active' | 'paused' | 'closed';
  averageServiceTime: number;
  waitingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueEntry {
  _id: string;
  queue: Queue | string;
  user: { _id: string; email: string };
  tokenNumber: number;
  status: 'waiting' | 'serving' | 'served' | 'cancelled';
  joinedAt: string;
  calledAt?: string;
  servedAt?: string;
  position?: number;
  estimatedWait?: number;
  averageServiceTime?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueueAnalytics {
  queueName: string;
  totalServed: number;
  totalCancelled: number;
  currentlyWaiting: number;
  currentlyServing: number;
  todayServed: number;
  currentToken: number;
  status: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    _id: string;
    email: string;
  };
  message?: string;
}
