import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: {},
  },
  reducers: {},
});

export default chatSlice.reducer;
