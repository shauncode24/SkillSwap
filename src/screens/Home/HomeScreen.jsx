import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectAuth } from '../../redux/slices/authSlice';
import theme from '../../theme';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'User'} 👋</Text>
        <Text style={styles.subtitle}>Ready to swap some skills?</Text>
      </View>

      {/* Placeholder Content */}
      <View style={styles.card}>
        <Text style={styles.cardEmoji}>🚀</Text>
        <Text style={styles.cardTitle}>You're all set!</Text>
        <Text style={styles.cardText}>
          Your profile and dashboard features are coming soon. Stay tuned for skill matching,
          sessions, and community features.
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 80,
  },
  welcomeSection: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
  },
  userName: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  cardText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
  },
});
