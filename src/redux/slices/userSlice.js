import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    discoverList: [],
  },
  reducers: {},
});

export default userSlice.reducer;
