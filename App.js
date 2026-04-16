import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './src/redux/store';
import RootNavigator from './src/navigation';
import { loadUserFromToken, selectAuthLoading } from './src/redux/slices/authSlice';
import { fetchNotifications, fetchUnreadCount } from './src/redux/slices/notificationSlice';
import theme from './src/theme';

function AppContent() {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // Track whether the initial token check has completed
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    dispatch(loadUserFromToken()).finally(() => {
      setInitializing(false);
    });
  }, [dispatch]);

  // Fetch notifications and start polling for unread count when authenticated
  useEffect(() => {
    let intervalId;
    if (isAuthenticated) {
      dispatch(fetchNotifications());
      intervalId = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, dispatch]);

  // Show a loading spinner while the token check is in progress
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
