import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const submitReview = createAsyncThunk(
  'review/submitReview',
  async ({ sessionId, revieweeId, rating, comment }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch('/api/review', {
        method: 'POST',
        body: JSON.stringify({ sessionId, revieweeId, rating, comment }),
      }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReviewsByUser = createAsyncThunk(
  'review/fetchReviewsByUser',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch(`/api/review/user/${userId}`, { method: 'GET' }, token);
      return response.data; // array of reviews
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReviewsBySession = createAsyncThunk(
  'review/fetchReviewsBySession',
  async (sessionId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch(`/api/review/session/${sessionId}`, { method: 'GET' }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    userReviews: [],
    sessionReviews: [],
    submitting: false,
    loading: false,
    error: null,
    submitSuccess: false,
  },
  reducers: {
    resetReviewState: (state) => {
      state.error = null;
      state.submitSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
        state.submitSuccess = false;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitSuccess = true;
        state.userReviews.unshift(action.payload);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      .addCase(fetchReviewsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload;
      })
      .addCase(fetchReviewsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchReviewsBySession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsBySession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionReviews = action.payload;
      })
      .addCase(fetchReviewsBySession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetReviewState } = reviewSlice.actions;

export const selectUserReviews = (state) => state.review.userReviews;
export const selectSessionReviews = (state) => state.review.sessionReviews;
export const selectReviewSubmitting = (state) => state.review.submitting;
export const selectReviewLoading = (state) => state.review.loading;
export const selectReviewError = (state) => state.review.error;
export const selectSubmitSuccess = (state) => state.review.submitSuccess;

export default reviewSlice.reducer;
