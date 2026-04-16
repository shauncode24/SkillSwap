import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchOrCreateChat = createAsyncThunk(
  'chat/fetchOrCreateChat',
  async (requestId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch(`/api/chat/${requestId}`, { method: 'GET' }, token);
      return { requestId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (requestId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch(`/api/chat/${requestId}/messages`, { method: 'GET' }, token);
      return { requestId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ requestId, text }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFetch(`/api/chat/${requestId}/message`, {
        method: 'POST',
        body: JSON.stringify({ text })
      }, token);
      return { requestId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: {},
    activeChatId: null,
    loading: false,
    sendingMessage: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchOrCreateChat
      .addCase(fetchOrCreateChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrCreateChat.fulfilled, (state, action) => {
        state.loading = false;
        const { requestId, data } = action.payload;
        state.chats[requestId] = data;
        state.activeChatId = requestId;
      })
      .addCase(fetchOrCreateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchChatMessages
      .addCase(fetchChatMessages.pending, (state) => {
         // minimal loading overhead
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const { requestId, data } = action.payload;
        if (state.chats[requestId]) {
          state.chats[requestId].messages = data.messages;
        } else {
          state.chats[requestId] = data;
        }
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {})
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const { requestId, data } = action.payload;
        state.chats[requestId] = data;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      });
  }
});

export const selectChatByRequestId = (requestId) => (state) => state.chat.chats[requestId];
export const selectActiveChatId = (state) => state.chat.activeChatId;
export const selectChatLoading = (state) => state.chat.loading;
export const selectSendingMessage = (state) => state.chat.sendingMessage;
export const selectChatError = (state) => state.chat.error;

export default chatSlice.reducer;
