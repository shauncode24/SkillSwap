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
    backgroundColor: '#0F172A',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
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
    color: '#6366F1',
    fontSize: 28,
    fontWeight: '600',
  },
  headerName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 15,
  },
  scheduleBtn: {
    backgroundColor: '#3730A3', // sophisticated dark indigo
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  scheduleBtnText: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '800',
  },
  avatar: {
    backgroundColor: '#818CF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  msgWrapper: {
    marginVertical: 6,
    maxWidth: '78%',
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
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  msgBubbleMe: {
    backgroundColor: '#6366F1', // classic indigo popup
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  msgBubbleOther: {
    backgroundColor: '#1E293B', // deep slate
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
  },
  msgText: {
    fontSize: 16,
    lineHeight: 22,
  },
  msgTextMe: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  msgTextOther: {
    color: '#F8FAFC',
    fontWeight: '500',
  },
  msgTimestamp: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 6,
    marginHorizontal: 4,
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    backgroundColor: '#0F172A',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 15 : 12,
    paddingBottom: Platform.OS === 'ios' ? 15 : 12,
    minHeight: 50,
    maxHeight: 120,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
    textAlignVertical: 'center',
  },
  sendBtn: {
    backgroundColor: '#6366F1',
    minWidth: 80,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    padding: 10,
  }
});
