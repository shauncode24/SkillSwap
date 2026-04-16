import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  selectNotifications,
  selectUnreadCount,
  selectNotificationLoading,
} from '../../redux/slices/notificationSlice';
import theme from '../../theme';

function getTimeAgo(createdAt) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Just now';
  if (diffHour < 1) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffDay < 1) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;

  const date = new Date(createdAt);
  const options = { year: 'numeric', month: 'short', day: '2-digit' };
  return date.toLocaleDateString(undefined, options);
}

export default function NotificationsScreen({ navigation }) {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationLoading);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handlePress = (item) => {
    if (!item.read) {
      dispatch(markNotificationRead(item._id));
    }

    switch (item.type) {
      case 'request_received':
      case 'request_accepted':
      case 'request_rejected':
      case 'new_message':
        navigation.navigate('Match'); // Fallback to requests tab
        break;
      case 'session_reminder':
      case 'session_completed':
        navigation.navigate('Home'); 
        break;
      case 'review_received':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  const renderItem = ({ item }) => {
    let indicatorColor = theme.colors.primary;
    if (item.type === 'new_message') indicatorColor = theme.colors.secondary;
    if (item.type === 'session_reminder' || item.type === 'session_completed') indicatorColor = '#4CAF50';
    if (item.type === 'review_received') indicatorColor = '#9C27B0'; // Add distinct accent

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadItem]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
        <View style={styles.contentBox}>
          <Text style={[styles.message, !item.read && styles.messageUnread]}>
            {item.message}
          </Text>
          <Text style={styles.timeStr}>{getTimeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => dispatch(markAllNotificationsRead())}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && notifications.length === 0 ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notifications yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  markAllText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  unreadItem: {
    backgroundColor: 'rgba(56, 189, 248, 0.05)', 
  },
  indicator: {
    width: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  contentBox: {
    flex: 1,
  },
  message: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
  },
  messageUnread: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  timeStr: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginTop: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.subtext,
    fontStyle: 'italic',
    marginTop: 40,
  },
});
