import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../services/api';

const TOKEN_KEY = 'skillswap_token';

// ──────────────────────────────────────────────
// Async Thunks
// ──────────────────────────────────────────────

/**
 * Register a new user.
 * Calls POST /api/auth/register and persists the token.
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      // Persist token
      await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
      return data.data; // { token, user }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Log in an existing user.
 * Calls POST /api/auth/login and persists the token.
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      // Persist token
      await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
      return data.data; // { token, user }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Restore session from a persisted token.
 * Reads the token from AsyncStorage and calls GET /api/auth/me.
 */
export const loadUserFromToken = createAsyncThunk(
  'auth/loadUserFromToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        return rejectWithValue('No token found');
      }
      const data = await apiFetch('/api/auth/me', { method: 'GET' }, token);
      return { token, user: data.data.user };
    } catch (error) {
      // Token invalid or expired — clean up
      await AsyncStorage.removeItem(TOKEN_KEY);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Log out the current user.
 * Clears the persisted token from AsyncStorage.
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
);

// ──────────────────────────────────────────────
// Slice
// ──────────────────────────────────────────────

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isNewUser: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ── registerUser ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isNewUser = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── loginUser ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isNewUser = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── loadUserFromToken ──
    builder
      .addCase(loadUserFromToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserFromToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isNewUser = false;
        state.error = null;
      })
      .addCase(loadUserFromToken.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null; // Don't show error for missing/expired tokens
      });

    // ── logoutUser ──
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export default authSlice.reducer;

// ──────────────────────────────────────────────
// Selectors
// ──────────────────────────────────────────────

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;
