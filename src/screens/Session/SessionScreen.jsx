import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  fetchSessionsByRequest,
  createSession,
  updateSessionStatus,
  selectRequestSessions,
  selectSessionCreating,
  selectSessionError,
  selectSessionLoading,
  selectSessionUpdatingId
} from '../../redux/slices/sessionSlice';
import { apiFetch } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import theme from '../../theme';

function formatSessionDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return date.toLocaleDateString(undefined, options);
}

function StarRating({ rating = 0 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('★');
    else if (i === full && half) stars.push('½');
    else stars.push('☆');
  }
  return (
    <View style={styles.starRow}>
      <Text style={styles.starText}>{stars.join('')}</Text>
    </View>
  );
}

export default function SessionScreen({ route, navigation }) {
  const { requestId, offeredSkill } = route.params;
  const dispatch = useDispatch();

  const [skill, setSkill] = useState(offeredSkill || '');
  const [date, setDate] = useState(new Date(Date.now() + 86400000)); // Default tomorrow
  const [duration, setDuration] = useState(60);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const existingSessions = useSelector(selectRequestSessions);
  const creating = useSelector(selectSessionCreating);
  const loading = useSelector(selectSessionLoading);
  const updatingId = useSelector(selectSessionUpdatingId);
  const sessionError = useSelector(selectSessionError);
  const { user, token } = useSelector(state => state.auth);

  const [canReviewSessions, setCanReviewSessions] = useState({});
  const [reviewsBySession, setReviewsBySession] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchSessionsByRequest(requestId)).unwrap().then(sessions => {
         sessions.forEach(s => {
            if (s.status === 'completed') {
               apiFetch(`/api/review/session/${s._id}`, { method: 'GET' }, token)
                 .then(res => {
                    setReviewsBySession(prev => ({ ...prev, [s._id]: res.data }));
                 }).catch(() => {});
            }
         });
      });
    }, [dispatch, requestId, token])
  );

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newD = new Date(date);
      newD.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newD);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newD = new Date(date);
      newD.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      setDate(newD);
    }
  };

  const handleCreate = () => {
    dispatch(createSession({
      requestId,
      skill,
      scheduledTime: date.toISOString(),
      duration
    })).unwrap().then(() => {
      // success!
    }).catch(err => {
      // handled by error state
    });
  };

  const handleStatusUpdate = (sessionId, status) => {
    dispatch(updateSessionStatus({ sessionId, status })).unwrap().then(res => {
      if (res?.canReview) {
        setCanReviewSessions(prev => ({ ...prev, [sessionId]: true }));
      }
    }).catch(err => {
      // handled
    });
  };

  const renderExistingSession = (session) => {
    let badgeColor = theme.colors.subtext;
    if (session.status === 'scheduled') badgeColor = theme.colors.primary;
    if (session.status === 'completed') badgeColor = '#4CAF50';
    if (session.status === 'cancelled') badgeColor = theme.colors.error;

    return (
      <View key={session._id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{session.skill}</Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{session.status}</Text>
          </View>
        </View>
        <Text style={styles.cardText}>{formatSessionDate(session.scheduledTime)}</Text>
        <Text style={styles.cardText}>{session.duration} mins</Text>

        {session.status === 'scheduled' && (
          <View style={styles.actionsBox}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.completeBtn, updatingId === session._id && {opacity: 0.5}]} 
              onPress={() => handleStatusUpdate(session._id, 'completed')}
              disabled={updatingId === session._id}
            >
               {updatingId === session._id ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.actionBtnText}>Mark Complete</Text>}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.cancelBtn, updatingId === session._id && {opacity: 0.5}]} 
              onPress={() => handleStatusUpdate(session._id, 'cancelled')}
              disabled={updatingId === session._id}
            >
               <Text style={styles.actionBtnText}>Cancel Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {session.status === 'completed' && (
          <View style={styles.reviewPrompt}>
            {session.feedbackGiven?.includes(user._id || user.id) ? (
               <Text style={styles.reviewSubText}>✓ Review submitted</Text>
            ) : (canReviewSessions[session._id] || true) ? (
               <>
                 <Text style={styles.reviewPromptText}>Session complete! Leave a review for your partner.</Text>
                 <TouchableOpacity 
                   style={styles.leaveReviewBtn}
                   onPress={() => {
                     const otherParticipant = session.participants?.find(p => p._id !== (user._id || user.id));
                     navigation.navigate('Review', {
                        sessionId: session._id,
                        revieweeId: otherParticipant?._id,
                        revieweeName: otherParticipant?.name || 'User',
                        requestId
                     });
                   }}
                 >
                   <Text style={styles.leaveReviewBtnText}>Leave Review</Text>
                 </TouchableOpacity>
               </>
            ) : null}

            {reviewsBySession[session._id] && reviewsBySession[session._id].length > 0 && (
              <View style={styles.reviewsList}>
                <Text style={styles.reviewsListTitle}>Reviews for this session:</Text>
                {reviewsBySession[session._id].map(rev => (
                  <View key={rev._id} style={styles.singleReview}>
                     <Text style={styles.reviewerName}>{rev.reviewer?.name} reviewed {rev.reviewee?.name === user.name ? 'You' : rev.reviewee?.name}</Text>
                     <StarRating rating={rev.rating} />
                     {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 50}}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Sessions</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Schedule New Session</Text>
        {sessionError && <Text style={styles.errorText}>{sessionError}</Text>}
        
        <Text style={styles.label}>Skill Focus</Text>
        <TextInput 
          style={styles.input}
          value={skill}
          onChangeText={setSkill}
          placeholder="e.g. React Native debugging"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Date & Time</Text>
        <View style={styles.datePickerRow}>
          {Platform.OS === 'android' ? (
            <>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.datePickerText}>{date.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.datePickerText}>
                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={(e, d) => d && setDate(d)}
            />
          )}
        </View>

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
        )}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker value={date} mode="time" display="default" onChange={onTimeChange} />
        )}

        <Text style={styles.label}>Duration</Text>
        <View style={styles.durationRow}>
          {[30, 60, 90, 120].map(val => (
            <TouchableOpacity 
              key={val} 
              style={[styles.durationBtn, duration === val && styles.durationBtnActive]}
              onPress={() => setDuration(val)}
            >
              <Text style={[styles.durationText, duration === val && styles.durationTextActive]}>{val}m</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.summaryText}>
          Scheduling for {formatSessionDate(date.toISOString())} for {duration} minutes.
        </Text>

        <TouchableOpacity 
           style={[styles.submitBtn, creating && {opacity: 0.7}]} 
           onPress={handleCreate}
           disabled={creating}
        >
          {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Schedule Session</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
         <Text style={styles.sectionTitle}>Existing Sessions</Text>
         {loading ? (
             <ActivityIndicator color={theme.colors.primary} />
         ) : existingSessions && existingSessions.length > 0 ? (
             existingSessions.map(renderExistingSession)
         ) : (
             <Text style={styles.emptyListText}>No sessions strictly arranged yet.</Text>
         )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center'
  },
  backBtn: {
    marginRight: 15,
  },
  backBtnText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 16
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 15
  },
  label: {
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.sm,
    marginBottom: 6,
    marginTop: 15,
    fontWeight: '600'
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    padding: 12,
    borderRadius: 8
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 10
  },
  datePickerBtn: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flex: 1,
    alignItems: 'center'
  },
  datePickerText: {
    color: theme.colors.text
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.surface
  },
  durationBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  durationText: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  durationTextActive: {
    color: theme.colors.background
  },
  summaryText: {
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginTop: 15,
    fontSize: theme.fontSizes.sm,
    textAlign: 'center'
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  submitBtnText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.md
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 10
  },
  listSection: {
    padding: 20
  },
  emptyListText: {
    color: theme.colors.subtext,
    fontStyle: 'italic'
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 15
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  cardTitle: {
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.md
  },
  cardText: {
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.sm,
    marginBottom: 2
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
  actionsBox: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  completeBtn: {
    backgroundColor: '#4CAF50'
  },
  cancelBtn: {
    backgroundColor: theme.colors.error
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12
  },
  reviewPrompt: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  reviewPromptText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    marginBottom: 10,
    textAlign: 'center',
  },
  leaveReviewBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  leaveReviewBtnText: {
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  reviewSubText: {
    color: '#4CAF50',
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 5,
  },
  reviewsList: {
    marginTop: 15,
    width: '100%',
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 8,
  },
  reviewsListTitle: {
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: theme.fontSizes.sm,
  },
  singleReview: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  reviewerName: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewComment: {
    color: theme.colors.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  starRow: {
    flexDirection: 'row',
    marginTop: 2,
    marginBottom: 2,
  },
  starText: {
    color: '#FFD700',
    fontSize: 14,
  }
});
