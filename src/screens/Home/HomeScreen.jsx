import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectAuth } from '../../redux/slices/authSlice';
import { fetchMyProfile } from '../../redux/slices/userSlice';
import { fetchMySessions, selectUpcomingSessions, selectSessionLoading } from '../../redux/slices/sessionSlice';
import { selectUnreadCount } from '../../redux/slices/notificationSlice';
import theme from '../../theme';

function formatSessionDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return date.toLocaleDateString(undefined, options);
}

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  
  const upcomingSessions = useSelector(selectUpcomingSessions);
  const loading = useSelector(selectSessionLoading);
  const unreadCount = useSelector(selectUnreadCount);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMySessions());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const renderSessionCard = (session) => {
    const otherParticipant = session.participants?.find(p => p._id !== user._id) || {};
    
    return (
      <View key={session._id} style={styles.card}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <View style={styles.avatarHolder} />
           <View style={{marginLeft: 10, flex: 1}}>
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={styles.cardTitle}>{otherParticipant.name || 'User'}</Text>
               <View style={styles.badge}><Text style={styles.badgeText}>upcoming</Text></View>
             </View>
             <Text style={styles.skillText}>{session.skill}</Text>
             <View style={{flexDirection: 'row', marginTop: 10}}>
                <Text style={styles.cardInfo}><Ionicons name="calendar" size={14} color="#818CF8" /> {formatSessionDate(session.scheduledTime)}</Text>
             </View>
           </View>
        </View>
        <View style={styles.cardActions}>
           <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Session', { requestId: session.requestId?._id || session.requestId, offeredSkill: session.skill })}>
              <Text style={styles.actionBtnText}>View Session</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName}>Hi, {user?.name || 'User'} </Text>
            <Text style={styles.subtitle}>Ready to swap some skills?</Text>
          </View>
          <TouchableOpacity 
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={26} color="#F8FAFC" />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeaderRow}>
           <Text style={styles.sectionHeader}>Upcoming Sessions</Text>
           <TouchableOpacity onPress={() => navigation.navigate('Sessions')}>
              <Text style={styles.seeAllText}>See all</Text>
           </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop: 40}} />
        ) : (
          upcomingSessions && upcomingSessions.length > 0 ? (
            upcomingSessions.slice(0, 3).map(renderSessionCard)
          ) : (
            <Text style={styles.emptyText}>No upcoming sessions scheduled yet</Text>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Darker background
  },
  headerArea: {
    backgroundColor: '#1E293B',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: theme.fontSizes.sm,
    color: '#94A3B8',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  bellBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  bellBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#F97316',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  seeAllText: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15
  },
  avatarHolder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: '#475569'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC'
  },
  badge: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  skillText: {
    color: '#818CF8',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600'
  },
  cardInfo: {
    color: '#94A3B8',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    justifyContent: 'flex-start'
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8
  },
  actionBtnText: {
    color: '#cbd5e1',
    fontWeight: 'bold',
    fontSize: 12
  }
});
