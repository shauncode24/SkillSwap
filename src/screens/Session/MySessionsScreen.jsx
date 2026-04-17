import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySessions, selectUpcomingSessions, selectPastSessions, selectSessionLoading } from '../../redux/slices/sessionSlice';
import theme from '../../theme';

function formatSessionDate(dateStr) {
  const date = new Date(dateStr);
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

function formatSessionTime(dateStr) {
  const date = new Date(dateStr);
  const options = { hour: 'numeric', minute: '2-digit' };
  return date.toLocaleTimeString(undefined, options);
}

export default function MySessionsScreen({ navigation }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed'

  const upcomingSessions = useSelector(selectUpcomingSessions);
  const pastSessions = useSelector(selectPastSessions);
  const loading = useSelector(selectSessionLoading);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchMySessions());
  }, [dispatch]);

  const renderSessionCard = ({ item }) => {
    const session = item;
    const otherParticipant = session.participants?.find(p => p._id !== (user?._id || user?.id)) || {};

    const isCompleted = activeTab === 'completed';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderArea}>
          <View style={styles.avatarHolder}>
            <View style={styles.checkmarkBadge}><Text style={{ fontSize: 10, color: '#1E293B' }}>✔</Text></View>
          </View>

          <View style={styles.cardHeaderInfo}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={styles.name}>{otherParticipant.name || 'User'}</Text>
              <View style={[styles.badge, isCompleted ? styles.badgeCompleted : styles.badgeUpcoming]}>
                <Text style={[styles.badgeText, isCompleted ? styles.badgeTextCompleted : styles.badgeTextUpcoming]}>
                  {isCompleted ? 'Completed' : 'Upcoming'}
                </Text>
              </View>
            </View>
            <Text style={styles.skillText}>{session.skill}</Text>
          </View>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>📅 {formatSessionDate(session.scheduledTime)}</Text>
          <Text style={styles.timeText}>🕒 {formatSessionTime(session.scheduledTime)}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewBtnOutline}
            onPress={() => navigation.navigate('ViewProfile', { userId: otherParticipant._id })}
          >
            <Text style={styles.viewBtnOutlineText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnTextOnly}
            onPress={() => navigation.navigate('Session', { requestId: session.requestId?._id || session.requestId, offeredSkill: session.skill })}
          >
            <Text style={styles.actionText}>{isCompleted ? 'View Details' : 'Reschedule'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const listData = activeTab === 'upcoming' ? upcomingSessions : pastSessions;

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>My Sessions</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={item => item._id}
        renderItem={renderSessionCard}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#818CF8" style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.emptyText}>No {activeTab} sessions.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  headerArea: {
    backgroundColor: '#1E293B',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3730A3', // Indigo background for active tab
  },
  tabText: {
    color: '#94A3B8',
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#F8FAFC',
  },
  list: {
    padding: 20
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardHeaderArea: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatarHolder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#475569',
    position: 'relative'
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillText: {
    color: '#818CF8',
    fontSize: 13,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeUpcoming: {
    backgroundColor: '#064E3B',
  },
  badgeCompleted: {
    backgroundColor: '#334155',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTextUpcoming: {
    color: '#34D399',
  },
  badgeTextCompleted: {
    color: '#94A3B8',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 65,
    marginBottom: 20,
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 12,
    marginRight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 65,
  },
  viewBtnOutline: {
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 20,
  },
  viewBtnOutlineText: {
    color: '#818CF8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  actionBtnTextOnly: {
    paddingVertical: 10,
  },
  actionText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 30
  }
});
