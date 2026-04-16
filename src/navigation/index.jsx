import React from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// App Screens
import HomeScreen from '../screens/Home/HomeScreen';
import DiscoverScreen from '../screens/Discover/DiscoverScreen';
import MatchScreen from '../screens/Match/MatchScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import MyProfileScreen from '../screens/Profile/MyProfileScreen';
import ViewProfileScreen from '../screens/Profile/ViewProfileScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import SessionScreen from '../screens/Session/SessionScreen';
import ReviewScreen from '../screens/Review/ReviewScreen';
import CommunityScreen from '../screens/Community/CommunityScreen';
import { selectUnreadCount } from '../redux/slices/notificationSlice';

import theme from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon helper — uses emoji as lightweight placeholders
function TabIcon({ label, focused }) {
  const icons = {
    Home: '🏠',
    Discover: '🔍',
    Match: '🤝',
    Notifications: '🔔',
    Profile: '👤',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[label]}</Text>
  );
}

// Bottom Tab Navigator (the main app tabs)
function AppTabs() {
  const unreadCount = useSelector(selectUnreadCount);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.subtext,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Match" component={MatchScreen} />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null,
          tabBarBadgeStyle: { backgroundColor: theme.colors.error, color: '#fff' }
        }}
      />
      <Tab.Screen name="Profile" component={MyProfileScreen} />
    </Tab.Navigator>
  );
}

// Auth Stack — shown when user is NOT authenticated
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// App Stack — shown when user IS authenticated
// Includes the tab navigator + extra screens outside the tab bar
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
    </Stack.Navigator>
  );
}

// Root navigator — switches between Auth and App based on Redux auth state
export default function RootNavigator() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
