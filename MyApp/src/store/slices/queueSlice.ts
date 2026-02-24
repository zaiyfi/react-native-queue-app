import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Queue, QueueEntry, QueueAnalytics } from '../../types/queue';
import QueueService from '../../services/QueueServices';

interface QueueState {
  queues: Queue[];
  myQueues: Queue[];
  activeEntry: QueueEntry | null;
  history: QueueEntry[];
  currentQueueEntries: QueueEntry[];
  analytics: QueueAnalytics | null;
  loading: boolean;
  error: string | null;
}

const initialState: QueueState = {
  queues: [],
  myQueues: [],
  activeEntry: null,
  history: [],
  currentQueueEntries: [],
  analytics: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllQueues = createAsyncThunk(
  'queue/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await QueueService.getAllQueues();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch queues');
    }
  },
);

export const fetchMyQueues = createAsyncThunk(
  'queue/fetchMyQueues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await QueueService.getMyQueues();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch your queues');
    }
  },
);

export const fetchMyActiveQueue = createAsyncThunk(
  'queue/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await QueueService.getMyActiveQueue();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch active queue');
    }
  },
);

export const fetchQueueHistory = createAsyncThunk(
  'queue/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      console.log('queueSlice: Fetching queue history...');
      const response = await QueueService.getQueueHistory();
      console.log(
        'queueSlice: History fetched successfully:',
        response.length,
        'items',
      );
      return response;
    } catch (error: any) {
      console.error('queueSlice: Error fetching history:', error);
      console.error('queueSlice: Error response:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch history',
      );
    }
  },
);

export const joinQueue = createAsyncThunk(
  'queue/join',
  async (queueId: string, { rejectWithValue }) => {
    try {
      const response = await QueueService.joinQueue(queueId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to join queue');
    }
  },
);

export const leaveQueue = createAsyncThunk(
  'queue/leave',
  async (queueId: string, { rejectWithValue }) => {
    try {
      const response = await QueueService.leaveQueue(queueId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to leave queue');
    }
  },
);

export const fetchQueueEntries = createAsyncThunk(
  'queue/fetchEntries',
  async (queueId: string, { rejectWithValue }) => {
    try {
      const response = await QueueService.getQueueEntries(queueId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch entries');
    }
  },
);

export const callNextUser = createAsyncThunk(
  'queue/callNext',
  async (queueId: string, { rejectWithValue }) => {
    try {
      const response = await QueueService.callNextUser(queueId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to call next user');
    }
  },
);

export const markAsServed = createAsyncThunk(
  'queue/markServed',
  async (
    { queueId, entryId }: { queueId: string; entryId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await QueueService.markAsServed(queueId, entryId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark as served');
    }
  },
);

export const createQueue = createAsyncThunk(
  'queue/create',
  async (
    queueData: {
      name: string;
      description?: string;
      maxSize?: number;
      averageServiceTime?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await QueueService.createQueue(queueData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create queue');
    }
  },
);

export const updateQueueStatus = createAsyncThunk(
  'queue/updateStatus',
  async (
    { queueId, status }: { queueId: string; status: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await QueueService.updateQueueStatus(queueId, status);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update status');
    }
  },
);

export const fetchQueueAnalytics = createAsyncThunk(
  'queue/fetchAnalytics',
  async (queueId: string, { rejectWithValue }) => {
    try {
      const response = await QueueService.getQueueAnalytics(queueId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  },
);

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearActiveEntry: state => {
      state.activeEntry = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch all queues
      .addCase(fetchAllQueues.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllQueues.fulfilled, (state, action) => {
        state.loading = false;
        state.queues = action.payload;
      })
      .addCase(fetchAllQueues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch my queues (admin)
      .addCase(fetchMyQueues.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyQueues.fulfilled, (state, action) => {
        state.loading = false;
        state.myQueues = action.payload;
      })
      .addCase(fetchMyQueues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch active queue
      .addCase(fetchMyActiveQueue.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyActiveQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.activeEntry = action.payload;
      })
      .addCase(fetchMyActiveQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch history
      .addCase(fetchQueueHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQueueHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchQueueHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Join queue
      .addCase(joinQueue.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.activeEntry = action.payload;
      })
      .addCase(joinQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Leave queue
      .addCase(leaveQueue.fulfilled, state => {
        state.activeEntry = null;
      })
      // Fetch queue entries
      .addCase(fetchQueueEntries.fulfilled, (state, action) => {
        state.currentQueueEntries = action.payload;
      })
      // Call next user
      .addCase(callNextUser.fulfilled, (state, action) => {
        // Update the entries list
        const index = state.currentQueueEntries.findIndex(
          e => e._id === action.payload._id,
        );
        if (index !== -1) {
          state.currentQueueEntries[index] = action.payload;
        }
        // Update the queue's nowServingToken in myQueues
        const queueIndex = state.myQueues.findIndex(
          q => q._id === action.payload.queue,
        );
        if (queueIndex !== -1) {
          state.myQueues[queueIndex].nowServingToken =
            action.payload.tokenNumber;
        }
      })
      // Mark as served
      .addCase(markAsServed.fulfilled, (state, action) => {
        const index = state.currentQueueEntries.findIndex(
          e => e._id === action.payload._id,
        );
        if (index !== -1) {
          state.currentQueueEntries[index] = action.payload;
        }
        // Update the queue's nowServingToken in myQueues
        const queueIndex = state.myQueues.findIndex(
          q => q._id === action.payload.queue,
        );
        if (queueIndex !== -1) {
          state.myQueues[queueIndex].nowServingToken = null;
        }
      })
      // Create queue
      .addCase(createQueue.fulfilled, (state, action) => {
        state.myQueues.unshift(action.payload);
      })
      // Update queue status
      .addCase(updateQueueStatus.fulfilled, (state, action) => {
        const index = state.myQueues.findIndex(
          q => q._id === action.payload._id,
        );
        if (index !== -1) {
          state.myQueues[index] = action.payload;
        }
      })
      // Fetch analytics
      .addCase(fetchQueueAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearError, clearActiveEntry } = queueSlice.actions;
export default queueSlice.reducer;
