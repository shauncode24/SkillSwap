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

  const renderItem = ({ item }) => {
    const isSent = sent.some(s => s._id === item._id);
    const otherUser = isSent ? item.toUser : item.fromUser;

    return (
      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => navigation.navigate('Chat', { requestId: item._id, otherUser })}
      >
        <AvatarInitials name={otherUser.name} size={50} />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{otherUser.name}</Text>
          <Text style={styles.chatMeta}>Exchange: {item.offeredSkill} ↔ {item.requestedSkill}</Text>
        </View>
        <Text style={styles.openText}>Chat</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <FlatList
        data={acceptedRequests}
        keyExtractor={item => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No active chats yet for accepted matches.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  headerTitle: { fontSize: theme.fontSizes.xl, fontWeight: 'bold', color: theme.colors.text },
  list: { padding: 20 },
  chatCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface,
    padding: 15, borderRadius: 10, marginBottom: 10,
    borderWidth: 1, borderColor: theme.colors.border
  },
  chatInfo: { flex: 1, marginLeft: 15 },
  chatName: { fontSize: theme.fontSizes.md, fontWeight: 'bold', color: theme.colors.text },
  chatMeta: { fontSize: 12, color: theme.colors.subtext, marginTop: 4 },
  openText: { color: theme.colors.primary, fontWeight: 'bold' },
  emptyText: { color: theme.colors.subtext, textAlign: 'center', marginTop: 20 }
});
