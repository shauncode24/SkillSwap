import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserById,
  selectViewedUser,
  selectUserLoading,
  selectUserError,
  selectUserProfile
} from '../../redux/slices/userSlice';
import {
  sendExchangeRequest,
  selectRequestLoading,
  selectMatchError
} from '../../redux/slices/matchSlice';
import { fetchReviewsByUser, selectUserReviews } from '../../redux/slices/reviewSlice';
import theme from '../../theme';

// ── Helper: Avatar with initials ──
function AvatarInitials({ name, size = 100 }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

// ── Helper: Star rating display ──
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
      <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
    </View>
  );
}

// ══════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════

export default function ViewProfileScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectViewedUser);
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  
  const currentUser = useSelector(selectUserProfile);
  const requestLoading = useSelector(selectRequestLoading);
  const matchError = useSelector(selectMatchError);
  const userReviews = useSelector(selectUserReviews);

  const [modalVisible, setModalVisible] = useState(false);
  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('30');

  const { userId } = route.params || {};

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
      dispatch(fetchReviewsByUser(userId));
    }
  }, [dispatch, userId]);

  if (loading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSendRequest = () => {
    if (!offeredSkill || !requestedSkill || !duration) {
      Alert.alert('Error', 'Please select skills and duration.');
      return;
    }
    dispatch(sendExchangeRequest({
      toUser: user._id,
      offeredSkill,
      requestedSkill,
      message,
      duration: Number(duration)
    }))
    .unwrap()
    .then(() => {
      setModalVisible(false);
      Alert.alert('Success', 'Request sent successfully!');
    })
    .catch((err) => {
      // Error is caught by Redux and available in matchError
    });
  };

  const renderModal = () => {
    return (
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Exchange Request</Text>

            {matchError && <Text style={styles.modalError}>{matchError}</Text>}

            {(!currentUser?.teachSkills || currentUser.teachSkills.length === 0) ? (
              <View>
                <Text style={styles.modalError}>You need to add skills to your profile before sending a request.</Text>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.label}>Offer Skill (From your profile)</Text>
                <View style={styles.pickerContainer}>
                  {currentUser.teachSkills.map((s, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.pickerItem, offeredSkill === s.name && styles.pickerItemActive]}
                      onPress={() => setOfferedSkill(s.name)}
                    >
                      <Text style={[styles.pickerItemText, offeredSkill === s.name && styles.pickerItemActiveText]}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Requested Skill (From their profile)</Text>
                <View style={styles.pickerContainer}>
                  {(user.teachSkills || []).map((s, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.pickerItem, requestedSkill === s.name && styles.pickerItemActive]}
                      onPress={() => setRequestedSkill(s.name)}
                    >
                      <Text style={[styles.pickerItemText, requestedSkill === s.name && styles.pickerItemActiveText]}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={duration}
                  onChangeText={setDuration}
                />

                <Text style={styles.label}>Message (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder="Hey, let's exchange skills!"
                  placeholderTextColor="#888"
                  value={message}
                  onChangeText={setMessage}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={requestLoading}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sendBtn, requestLoading && { opacity: 0.7 }]}
                    onPress={handleSendRequest}
                    disabled={requestLoading}
                  >
                    {requestLoading ? (
                      <ActivityIndicator color={theme.colors.background} />
                    ) : (
                      <Text style={styles.sendBtnText}>Send</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.topBackground} />
      
      <TouchableOpacity
        style={styles.topBackBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.topBackBtnText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Profile Card */}
        <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
            <AvatarInitials name={user.name} size={100} />
            <View style={styles.checkmarkBadge}>
              <Text style={{ fontSize: 12, color: '#1E293B', fontWeight: 'bold' }}>✔</Text>
            </View>
          </View>

          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.bioText}>{user.bio || 'Passionate about learning and sharing knowledge.'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={styles.statIcon}>☆ </Text>
                <Text style={styles.statValue}>{user.rating ? user.rating.toFixed(1) : '0.0'}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={styles.statIcon}>📅 </Text>
                <Text style={styles.statValue}>{user.totalSessions || '0'}</Text>
              </View>
              <Text style={styles.statLabel}>Total{'\n'}Sessions</Text>
            </View>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={styles.statIcon}>👥 </Text>
                <Text style={styles.statValue}>{user.matches || '0'}</Text>
              </View>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.requestBtn}
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.requestBtnText}>💬  Send Request</Text>
          </TouchableOpacity>
        </View>

        {/* Skills They Can Teach */}
        <Text style={styles.sectionHeading}>Skills They Teach</Text>
        <View style={styles.tagBlockCard}>
          {(user.teachSkills || []).length > 0 ? (
            <View style={styles.tagContainer}>
              {user.teachSkills.map((skill, idx) => (
                <View key={`teach-${idx}`} style={styles.teachTag}>
                  <Text style={styles.teachTagText}>
                    {skill.name}  <Text style={{ color: '#818CF8', textTransform: 'capitalize' }}>({skill.level})</Text>
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No teach skills added.</Text>
          )}
        </View>

        {/* Skills They Want to Learn */}
        <Text style={styles.sectionHeading}>Skills They Want to Learn</Text>
        <View style={styles.tagBlockCard}>
          {(user.learnSkills || []).length > 0 ? (
            <View style={styles.tagContainer}>
              {user.learnSkills.map((skill, idx) => (
                <View key={`learn-${idx}`} style={styles.learnTag}>
                  <Text style={styles.learnTagText}>
                    {skill.name}  <Text style={{ color: '#C084FC', textTransform: 'capitalize' }}>({skill.priority})</Text>
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No learn skills added.</Text>
          )}
        </View>

        {/* Availability */}
        <Text style={styles.sectionHeading}>Availability</Text>
        <View style={styles.tagBlockCard}>
          {(user.availability || []).length > 0 ? (
            <View style={styles.tagContainer}>
              {user.availability.map((entry, idx) => (
                <View key={`avail-${idx}`} style={styles.availTag}>
                  <Text style={styles.availTagText}>
                    {entry.day} {(entry.slots || []).join(', ')}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No availability set.</Text>
          )}
        </View>

        {/* Reviews */}
        <Text style={styles.sectionHeading}>Reviews</Text>
        <View style={styles.tagBlockCard}>
          <Text style={styles.reviewAverage}>
            ⭐ {user.rating ? user.rating.toFixed(1) : 'No rating'}
          </Text>
          {userReviews && userReviews.length > 0 ? (
            userReviews.map((rev, idx) => (
              <View key={idx} style={styles.reviewItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AvatarInitials name={rev.reviewer?.name} size={30} />
                  <Text style={styles.reviewName}>{rev.reviewer?.name}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(rev.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={{ marginVertical: 4 }}>
                  <StarRating rating={rev.rating} />
                </View>
                {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No reviews yet</Text>
          )}
        </View>

        <View style={{ height: 20 }} />
        {renderModal()}
      </ScrollView>
    </View>
  );
}

// ══════════════════════════════════════════════
// Styles
// ══════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBackground: {
    backgroundColor: '#7C3AED',
    height: 220,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0
  },
  topBackBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  topBackBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  backBtn: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // ── Profile Card ──
  profileCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginTop: -70,
    marginBottom: 15,
    position: 'relative',
    alignItems: 'center'
  },
  avatar: {
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#3B82F6',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 16,
    color: '#818CF8',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#818CF8',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },

  requestBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestBtnText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Sections & Tags ──
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 15,
    marginTop: 5,
  },
  tagBlockCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teachTag: {
    backgroundColor: '#312E81',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  teachTagText: {
    color: '#C7D2FE',
    fontSize: 13,
    fontWeight: '600',
  },
  learnTag: {
    backgroundColor: '#581C87',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  learnTagText: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '600',
  },
  availTag: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  availTagText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  // ── Reviews ──
  reviewAverage: {
    color: '#818CF8',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 15,
    marginTop: 10,
  },
  reviewName: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  reviewDate: {
    marginLeft: 'auto',
    color: '#64748B',
    fontSize: 12,
  },
  reviewComment: {
    color: '#E2E8F0',
    marginTop: 5,
    lineHeight: 20,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    fontSize: 14,
    color: '#FFD700',
    marginRight: 5,
  },
  ratingNumber: {
    fontSize: 14,
    color: '#94A3B8',
  },

  // ── Modal Styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  modalError: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 15,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    color: '#F8FAFC',
    padding: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A'
  },
  pickerItemActive: {
    backgroundColor: '#3730A3',
    borderColor: '#6366F1',
  },
  pickerItemText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500'
  },
  pickerItemActiveText: {
    color: '#F8FAFC',
    fontWeight: 'bold'
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    borderRadius: 12
  },
  cancelBtnText: {
    color: '#CBD5E1',
    fontWeight: '600'
  },
  sendBtn: {
    flex: 1,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12
  },
  sendBtnText: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});
