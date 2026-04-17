import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyRequests, selectReceivedRequests, selectSentRequests, selectRequestLoading } from '../../redux/slices/matchSlice';
import theme from '../../theme';

function AvatarInitials({ name, size = 40 }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: 'bold' }}>{initial}</Text>
    </View>
  );
}

export default function ChatsListScreen({ navigation }) {
  const dispatch = useDispatch();
  const received = useSelector(selectReceivedRequests);
  const sent = useSelector(selectSentRequests);
  const loading = useSelector(selectRequestLoading);

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  const acceptedRequests = [...(received || []), ...(sent || [])].filter(req => req.status === 'accepted');

  const renderItem = ({ item, index }) => {
    const isSent = sent.some(s => s._id === item._id);
    const otherUser = isSent ? item.toUser : item.fromUser;
    
    // Fallback static strings for the UI. We need to implement read-receipts backend tracking to dynamically change the unread badge.
    const dateStr = index === 0 ? "Jan 15" : "Jan 14";
    const previewTxt = index === 0 ? "Perfect! When are you free this e..." : "Thank you so much! I'd love to learn...";
    const unreadCount = 0;

    return (
      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => navigation.navigate('Chat', { requestId: item._id, otherUser })}
      >
        <View style={styles.avatarHolder}>
           <View style={styles.checkmarkBadge}><Text style={{fontSize: 10, color: '#1E293B', fontWeight: 'bold'}}>✔</Text></View>
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.chatName}>{otherUser?.name || 'User'}</Text>
            <Text style={styles.chatDate}>{dateStr}</Text>
          </View>
          <View style={styles.chatPreviewRow}>
            <Text style={styles.chatPreview} numberOfLines={1}>{previewTxt}</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={acceptedRequests}
        keyExtractor={item => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No messages yet.</Text>
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
    color: '#F8FAFC' 
  },
  list: { 
    padding: 20 
  },
  chatCard: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1E293B',
    padding: 16, 
    borderRadius: 16, 
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
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6', // Blue checkmark as in screenshot
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  chatInfo: { 
    flex: 1, 
    marginLeft: 15 
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#F8FAFC' 
  },
  chatDate: { 
    fontSize: 12, 
    color: '#94A3B8' 
  },
  chatPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreview: { 
    fontSize: 13, 
    color: '#CBD5E1', 
    flex: 1,
    paddingRight: 10
  },
  unreadBadge: {
    backgroundColor: '#6366F1', // Indigo/purple badge
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  emptyText: { 
    color: '#94A3B8', 
    textAlign: 'center', 
    marginTop: 20 
  }
});
