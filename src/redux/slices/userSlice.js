import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

// ──────────────────────────────────────────────
// Async Thunks
// ──────────────────────────────────────────────

/**
 * Fetch the currently authenticated user's profile.
 * Calls GET /api/users/profile.
 */
export const fetchMyProfile = createAsyncThunk(
  'user/fetchMyProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const data = await apiFetch('/api/users/profile', { method: 'GET' }, token);
      return data.data; // The user object
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update the currently authenticated user's profile.
 * Calls PUT /api/users/profile with the provided fields.
 */
export const updateMyProfile = createAsyncThunk(
  'user/updateMyProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const data = await apiFetch(
        '/api/users/profile',
        {
          method: 'PUT',
          body: JSON.stringify(profileData),
        },
        token
      );
      return data.data; // The updated user object
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch the discover list of users with optional filters.
 * Calls GET /api/users/discover with query params (skill, level, availability).
 */
export const fetchDiscoverList = createAsyncThunk(
  'user/fetchDiscoverList',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      // Build query string from non-empty filters
      const params = new URLSearchParams();
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.level) params.append('level', filters.level);
      if (filters.availability) params.append('availability', filters.availability);

      const queryString = params.toString();
      const path = `/api/users/discover${queryString ? `?${queryString}` : ''}`;

      const data = await apiFetch(path, { method: 'GET' }, token);
      return data.data; // Array of user objects
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch a single user's public profile by their ID.
 * Calls GET /api/users/:id.
 */
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const data = await apiFetch(`/api/users/${userId}`, { method: 'GET' }, token);
      return data.data; // The user object
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ──────────────────────────────────────────────
// Slice
// ──────────────────────────────────────────────

const initialState = {
  profile: null,
  discoverList: [],
  viewedUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ── fetchMyProfile ──
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── updateMyProfile ──
    builder
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchDiscoverList ──
    builder
      .addCase(fetchDiscoverList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscoverList.fulfilled, (state, action) => {
        state.loading = false;
        state.discoverList = action.payload;
        state.error = null;
      })
      .addCase(fetchDiscoverList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchUserById ──
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.viewedUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;

// ──────────────────────────────────────────────
// Selectors
// ──────────────────────────────────────────────

export const selectUserProfile = (state) => state.user.profile;
export const selectDiscoverList = (state) => state.user.discoverList;
export const selectViewedUser = (state) => state.user.viewedUser;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
