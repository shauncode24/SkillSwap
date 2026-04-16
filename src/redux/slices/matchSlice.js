import { createSlice } from '@reduxjs/toolkit';

const matchSlice = createSlice({
  name: 'match',
  initialState: {
    matches: [],
    requests: [],
  },
  reducers: {},
});

export default matchSlice.reducer;
