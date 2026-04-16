import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectAuth } from '../../redux/slices/authSlice';
import { fetchMyProfile } from '../../redux/slices/userSlice';
import { fetchMySessions, selectUpcomingSessions, selectPastSessions, selectSessionLoading } from '../../redux/slices/sessionSlice';
import theme from '../../theme';

function formatSessionDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return date.toLocaleDateString(undefined, options);
}

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  
  const upcomingSessions = useSelector(selectUpcomingSessions);
  const pastSessions = useSelector(selectPastSessions);
  const loading = useSelector(selectSessionLoading);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMySessions());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const renderSessionCard = (session) => {
    const otherParticipant = session.participants?.find(p => p._id !== user._id) || {};
    
    let badgeColor = theme.colors.subtext;
    if (session.status === 'scheduled') badgeColor = '#4CAF50';
    if (session.status === 'cancelled') badgeColor = theme.colors.error;

    return (
      <View key={session._id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{session.skill}</Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{session.status}</Text>
          </View>
        </View>
        <Text style={styles.cardText}><Text style={{fontWeight: 'bold'}}>With:</Text> {otherParticipant.name || 'Unknown'}</Text>
        <Text style={styles.cardText}>{formatSessionDate(session.scheduledTime)}</Text>
        <Text style={styles.cardText}><Text style={{fontWeight: 'bold'}}>Duration:</Text> {session.duration} mins</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcomeSection}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Ready to swap some skills?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && (!upcomingSessions?.length && !pastSessions?.length) ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop: 40}} />
        ) : (
          <>
            <Text style={styles.sectionHeader}>Upcoming Sessions</Text>
            {upcomingSessions && upcomingSessions.length > 0 ? (
              upcomingSessions.map(renderSessionCard)
            ) : (
              <Text style={styles.emptyText}>No upcoming sessions scheduled yet</Text>
            )}

            <Text style={[styles.sectionHeader, {marginTop: 30}]}>Past Sessions</Text>
            {pastSessions && pastSessions.length > 0 ? (
              pastSessions.map(renderSessionCard)
            ) : (
              <Text style={styles.emptyText}>No past sessions</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
  },
  welcomeSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
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
    color: theme.colors.primary,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: theme.colors.error,
    fontWeight: '600'
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 40,
    paddingTop: 10
  },
  sectionHeader: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.subtext,
    fontStyle: 'italic',
    marginBottom: 20
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.text
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  cardText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    marginBottom: 4
  }
});
