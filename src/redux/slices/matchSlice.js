import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchMatches = createAsyncThunk(
  'match/fetchMatches',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch('/api/match/recommendations', { method: 'GET' }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  'match/fetchMyRequests',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch('/api/exchange/requests', { method: 'GET' }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendExchangeRequest = createAsyncThunk(
  'match/sendExchangeRequest',
  async (requestData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch('/api/exchange/request', {
        method: 'POST',
        body: JSON.stringify(requestData)
      }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const respondToRequest = createAsyncThunk(
  'match/respondToRequest',
  async ({ requestId, status }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch(`/api/exchange/respond/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const matchSlice = createSlice({
  name: 'match',
  initialState: {
    matches: [],
    sentRequests: [],
    receivedRequests: [],
    loading: false,
    requestLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchMyRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.sentRequests = action.payload.sent;
        state.receivedRequests = action.payload.received;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendExchangeRequest.pending, (state) => {
        state.requestLoading = true;
        state.error = null;
      })
      .addCase(sendExchangeRequest.fulfilled, (state, action) => {
        state.requestLoading = false;
        state.sentRequests.unshift(action.payload);
      })
      .addCase(sendExchangeRequest.rejected, (state, action) => {
        state.requestLoading = false;
        state.error = action.payload;
      })

      .addCase(respondToRequest.pending, (state) => {
        state.requestLoading = true;
        state.error = null;
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        state.requestLoading = false;
        const index = state.receivedRequests.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.receivedRequests[index] = action.payload;
        }
      })
      .addCase(respondToRequest.rejected, (state, action) => {
        state.requestLoading = false;
        state.error = action.payload;
      });
  }
});

export const selectMatches = (state) => state.match.matches;
export const selectSentRequests = (state) => state.match.sentRequests;
export const selectReceivedRequests = (state) => state.match.receivedRequests;
export const selectMatchLoading = (state) => state.match.loading;
export const selectRequestLoading = (state) => state.match.requestLoading;
export const selectMatchError = (state) => state.match.error;

export default matchSlice.reducer;
