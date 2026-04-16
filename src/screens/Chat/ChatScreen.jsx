import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrCreateChat,
  fetchChatMessages,
  sendMessage,
  selectChatByRequestId,
  selectChatLoading,
  selectSendingMessage,
  selectChatError
} from '../../redux/slices/chatSlice';
import theme from '../../theme';

function AvatarInitials({ name, size = 40 }) {
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

export default function ChatScreen({ route, navigation }) {
  const { requestId, otherUser } = route.params;
  const dispatch = useDispatch();
  const flatListRef = useRef(null);

  const [text, setText] = useState('');

  const chat = useSelector(selectChatByRequestId(requestId));
  const loading = useSelector(selectChatLoading);
  const sendingMessage = useSelector(selectSendingMessage);
  const error = useSelector(selectChatError);
  
  const currentUserId = useSelector(state => state.auth.user ? state.auth.user._id || state.auth.user.id : null);

  useEffect(() => {
    dispatch(fetchOrCreateChat(requestId));

    const interval = setInterval(() => {
      dispatch(fetchChatMessages(requestId));
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, requestId]);

  const handleSend = () => {
    if (!text.trim() || sendingMessage) return;
    dispatch(sendMessage({ requestId, text }));
    setText('');
  };

  const renderMessage = ({ item, index }) => {
    // Note: since inverted is true, chronological order is reversed in data, so index 0 is newest.
    // However, if we don't invert the array, flatlist handles it. Wait, if inverted=true, we should pass reversed messages.
    // We will slice and reverse messages before passing to FlatList.
    
    // Check if the current user sent it via auth state (compare with senderId) Let's assume current user's ID matches senderId
    const isMe = currentUserId && item.senderId === currentUserId;

    const ts = new Date(item.timestamp);
    const timeStr = `${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}`;

    return (
      <View style={[styles.msgWrapper, isMe ? styles.msgWrapperMe : styles.msgWrapperOther]}>
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextOther]}>{item.text}</Text>
        </View>
        <Text style={styles.msgTimestamp}>{timeStr}</Text>
      </View>
    );
  };

  if (loading && !chat) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // To use inverted FlatList, newest messages should be the first items.
  const reversedMessages = chat && chat.messages ? [...chat.messages].reverse() : [];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
           <AvatarInitials name={otherUser?.name} />
           <Text style={styles.headerName}>{otherUser?.name || 'User'}</Text>
        </View>

        <TouchableOpacity 
           style={styles.scheduleBtn} 
           onPress={() => navigation.navigate('Session', { requestId, offeredSkill: chat?.requestId?.offeredSkill || '' })}
        >
           <Text style={styles.scheduleBtnText}>Schedule Session</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        ref={flatListRef}
        data={reversedMessages}
        keyExtractor={(item, idx) => item._id || idx.toString()}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sendingMessage) && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!text.trim() || sendingMessage}
        >
          {sendingMessage ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <Text style={styles.sendBtnText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 15,
  },
  backBtnText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerName: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    marginLeft: 10,
  },
  scheduleBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scheduleBtnText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: 'bold',
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
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  msgWrapper: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  msgWrapperMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  msgWrapperOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  msgBubbleMe: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  msgBubbleOther: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  msgText: {
    fontSize: theme.fontSizes.md,
    lineHeight: 20,
  },
  msgTextMe: {
    color: theme.colors.background,
  },
  msgTextOther: {
    color: theme.colors.text,
  },
  msgTimestamp: {
    color: theme.colors.subtext,
    fontSize: 10,
    marginTop: 4,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 2,
  },
  sendBtnText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    padding: 10,
  }
});
