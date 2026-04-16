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
          const { user, score, matchedSkills } = item;
          const percentage = Math.round(score * 100);

          return (
            <View key={user._id || index} style={styles.card}>
              <View style={styles.cardHeader}>
                <AvatarInitials name={user.name} />
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.score}>{percentage}% match</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => navigation.navigate('ViewProfile', { userId: user._id })}
                >
                  <Text style={styles.viewBtnText}>View Profile</Text>
                </TouchableOpacity>
              </View>
              
              {matchedSkills && matchedSkills.length > 0 && (
                <View style={styles.skillsRow}>
                  {matchedSkills.map((skill, sdx) => (
                    <View key={sdx} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}
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
        <View style={styles.cardHeader}>
          <AvatarInitials name={otherUser?.name} />
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.name}>{otherUser?.name || 'Unknown User'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) }]}>
               <Text style={styles.statusText}>{req.status}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.reqDetail}>
          <Text style={{fontWeight: 'bold'}}>Offer:</Text> {req.offeredSkill}
        </Text>
        <Text style={styles.reqDetail}>
          <Text style={{fontWeight: 'bold'}}>Request:</Text> {req.requestedSkill}
        </Text>

        {isReceived && req.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => handleRespond(req._id, 'accepted')}
              disabled={requestLoading}
            >
              <Text style={styles.actionBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleRespond(req._id, 'rejected')}
              disabled={requestLoading}
            >
              <Text style={styles.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {req.status === 'accepted' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Chat', { requestId: req._id, otherUser })}
            >
              <Text style={styles.actionBtnText}>Open Chat</Text>
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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {activeTab === 'matches' ? renderMatches() : renderRequests()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 50,
    marginBottom: 10,
    paddingHorizontal: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  loader: {
    marginTop: 40,
  },
  listContainer: {
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
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
  },
  score: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  viewBtn: {
    backgroundColor: theme.colors.primary + '22',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  viewBtnText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  skillTag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
    borderColor: theme.colors.primary + '55',
    borderWidth: 1,
  },
  skillTagText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm - 2,
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
