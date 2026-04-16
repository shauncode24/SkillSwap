import { createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    sessions: [],
  },
  reducers: {},
});

export default sessionSlice.reducer;
