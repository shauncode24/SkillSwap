import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  fetchMatches,
  fetchMyRequests,
  respondToRequest,
  selectMatches,
  selectSentRequests,
  selectReceivedRequests,
  selectMatchLoading,
  selectRequestLoading,
  selectMatchError,
} from '../../redux/slices/matchSlice';
import theme from '../../theme';

function AvatarInitials({ name, size = 50 }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

export default function MatchScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'requests'

  const matches = useSelector(selectMatches);
  const sentRequests = useSelector(selectSentRequests);
  const receivedRequests = useSelector(selectReceivedRequests);
  const loading = useSelector(selectMatchLoading);
  const requestLoading = useSelector(selectRequestLoading);
  const error = useSelector(selectMatchError);

  useEffect(() => {
    if (activeTab === 'matches') {
      dispatch(fetchMatches());
    } else {
      dispatch(fetchMyRequests());
    }
  }, [activeTab, dispatch]);

  const handleRespond = (requestId, status) => {
    dispatch(respondToRequest({ requestId, status }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#FFC107'; // pending
    }
  };

  const renderMatches = () => {
    if (loading) return <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />;
    
    if (!matches || matches.length === 0) {
      return <Text style={styles.emptyText}>No matches found. Complete your profile with skills you want to learn.</Text>;
    }

    return (
      <ScrollView contentContainerStyle={styles.listContainer}>
        {matches.map((item, index) => {
          const { user, score } = item;
          const percentage = Math.round(score * 100);

          return (
            <View key={user._id || index} style={styles.card}>
              <View style={styles.cardHeaderArea}>
                <View style={styles.avatarHolder}>
                  <View style={styles.checkmarkBadge}><Text style={{fontSize: 10, color: '#1E293B'}}>✔</Text></View>
                </View>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.name}>{user.name}</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.scoreText}>{percentage} %</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.sectionLabel}>Can teach</Text>
              <View style={styles.skillsRow}>
                {user.teachSkills?.slice(0, 3).map((skill, sdx) => (
                  <View key={sdx} style={styles.teachTag}>
                    <Text style={styles.teachTagText}>{skill.name}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Wants to learn</Text>
              <View style={styles.skillsRow}>
                {user.learnSkills?.slice(0, 3).map((skill, sdx) => (
                  <View key={sdx} style={styles.learnTag}>
                    <Text style={styles.learnTagText}>{skill.name}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.viewBtnOutline}
                onPress={() => navigation.navigate('ViewProfile', { userId: user._id })}
              >
                <Text style={styles.viewBtnOutlineText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderRequestCard = (req, isReceived) => {
    const otherUser = isReceived ? req.fromUser : req.toUser;
    
    return (
      <View key={req._id} style={styles.card}>
        <View style={styles.cardHeaderArea}>
          <View style={styles.avatarHolder}>
             <View style={styles.checkmarkBadge}><Text style={{fontSize: 10, color: '#1E293B'}}>✔</Text></View>
          </View>
          <View style={styles.cardHeaderInfo}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
               <Text style={styles.name}>{otherUser?.name || 'Unknown User'}</Text>
               <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) }]}>
                  <Text style={styles.statusText}>{req.status}</Text>
               </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Offered Skill</Text>
        <View style={styles.skillsRow}>
           <View style={styles.teachTag}>
             <Text style={styles.teachTagText}>{req.offeredSkill}</Text>
           </View>
        </View>

        <Text style={styles.sectionLabel}>Requested Skill</Text>
        <View style={styles.skillsRow}>
           <View style={styles.learnTag}>
             <Text style={styles.learnTagText}>{req.requestedSkill}</Text>
           </View>
        </View>

        {isReceived && req.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.viewBtnOutline, { flex: 1, marginRight: 8, borderColor: '#4ADE80', marginTop: 10 }]}
              onPress={() => handleRespond(req._id, 'accepted')}
              disabled={requestLoading}
            >
              <Text style={[styles.viewBtnOutlineText, { color: '#4ADE80' }]}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewBtnOutline, { flex: 1, marginLeft: 8, borderColor: '#F87171', marginTop: 10 }]}
              onPress={() => handleRespond(req._id, 'rejected')}
              disabled={requestLoading}
            >
              <Text style={[styles.viewBtnOutlineText, { color: '#F87171' }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {req.status === 'accepted' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.viewBtnOutline, { flex: 1, marginTop: 10 }]}
              onPress={() => navigation.navigate('Chat', { requestId: req._id, otherUser })}
            >
              <Text style={styles.viewBtnOutlineText}>Open Chat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderRequests = () => {
    if (loading) return <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />;

    const hasRequests = (sentRequests?.length > 0) || (receivedRequests?.length > 0);

    if (!hasRequests) {
      return <Text style={styles.emptyText}>No requests yet</Text>;
    }

    return (
      <ScrollView contentContainerStyle={styles.listContainer}>
        {receivedRequests?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Received Requests</Text>
            {receivedRequests.map(req => renderRequestCard(req, true))}
          </View>
        )}

        {sentRequests?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Sent Requests</Text>
            {sentRequests.map(req => renderRequestCard(req, false))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
            onPress={() => setActiveTab('matches')}
          >
            <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>Matches</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Requests</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {activeTab === 'matches' ? renderMatches() : renderRequests()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  loader: {
    marginTop: 40,
  },
  listContainer: {
    paddingTop: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  emptyText: {
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    margin: 10,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardHeaderArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarHolder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#475569',
    position: 'relative'
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4ADE80',
    width: 18,
    height: 18,
    borderRadius: 9,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginRight: 10,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
  scoreText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teachTag: {
    backgroundColor: '#312E81', // Dark blue/indigo
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  teachTagText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '600'
  },
  learnTag: {
    backgroundColor: '#581C87', // Deep purple
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  learnTagText: {
    color: '#D8B4FE',
    fontSize: 12,
    fontWeight: '600'
  },
  viewBtnOutline: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewBtnOutlineText: {
    color: '#818CF8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  reqDetail: {
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.sm,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
  },
  rejectBtn: {
    backgroundColor: '#F44336',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: theme.fontSizes.sm,
  }
});
