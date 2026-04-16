import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchMySessions = createAsyncThunk(
  'session/fetchMySessions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch('/api/session/my', { method: 'GET' }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSessionsByRequest = createAsyncThunk(
  'session/fetchSessionsByRequest',
  async (requestId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch(`/api/session/${requestId}`, { method: 'GET' }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSession = createAsyncThunk(
  'session/createSession',
  async (sessionData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch('/api/session/create', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSessionStatus = createAsyncThunk(
  'session/updateSessionStatus',
  async ({ sessionId, status }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch(`/api/session/${sessionId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    upcomingSessions: [],
    pastSessions: [],
    requestSessions: [],
    loading: false,
    updatingId: null,
    creating: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySessions.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingSessions = action.payload.upcoming;
        state.pastSessions = action.payload.past;
      })
      .addCase(fetchMySessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchSessionsByRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionsByRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requestSessions = action.payload;
      })
      .addCase(fetchSessionsByRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createSession.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.creating = false;
        state.upcomingSessions.push(action.payload);
        state.requestSessions.push(action.payload);
      })
      .addCase(createSession.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      .addCase(updateSessionStatus.pending, (state, action) => {
         state.updatingId = action.meta.arg.sessionId;
         state.error = null;
      })
      .addCase(updateSessionStatus.fulfilled, (state, action) => {
         state.updatingId = null;
         const updated = action.payload.data;
         
         if (updated) {
           const reqIdx = state.requestSessions.findIndex(s => s._id === updated._id);
           if (reqIdx !== -1) state.requestSessions[reqIdx] = updated;

           const upIdx = state.upcomingSessions.findIndex(s => s._id === updated._id);
           if (upIdx !== -1) {
              state.upcomingSessions.splice(upIdx, 1);
              state.pastSessions.push(updated); 
           }

           const pastIdx = state.pastSessions.findIndex(s => s._id === updated._id);
           if (pastIdx !== -1) {
               state.pastSessions[pastIdx] = updated;
           }
         }
      })
      .addCase(updateSessionStatus.rejected, (state, action) => {
         state.updatingId = null;
         state.error = action.payload;
      });
  }
});

export const selectUpcomingSessions = (state) => state.session.upcomingSessions;
export const selectPastSessions = (state) => state.session.pastSessions;
export const selectRequestSessions = (state) => state.session.requestSessions;
export const selectSessionLoading = (state) => state.session.loading;
export const selectSessionUpdatingId = (state) => state.session.updatingId;
export const selectSessionCreating = (state) => state.session.creating;
export const selectSessionError = (state) => state.session.error;

export default sessionSlice.reducer;
