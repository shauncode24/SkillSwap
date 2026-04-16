import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import matchReducer from './slices/matchSlice';
import chatReducer from './slices/chatSlice';
import sessionReducer from './slices/sessionSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    match: matchReducer,
    chat: chatReducer,
    session: sessionReducer,
  },
});

export default store;
