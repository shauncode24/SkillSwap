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
function AvatarInitials({ name, size = 90 }) {
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

// ── Helper: Skill Tag ──
function SkillTag({ skill, labelKey }) {
  return (
    <View style={styles.skillTag}>
      <Text style={styles.skillTagName}>{skill.name}</Text>
      <Text style={styles.skillTagLevel}>{skill[labelKey]}</Text>
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      {/* Profile header */}
      <View style={styles.profileHeader}>
        <AvatarInitials name={user.name} size={90} />
        <Text style={styles.profileName}>{user.name}</Text>
        <StarRating rating={user.rating || 0} />
      </View>

      {/* Bio */}
      {user.bio ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bio</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      ) : null}

      {/* XP & Level */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user.xp || 0}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user.level || 1}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      {/* Teach Skills */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Skills They Teach</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(user.teachSkills || []).length > 0 ? (
            user.teachSkills.map((skill, idx) => (
              <SkillTag key={`teach-${idx}`} skill={skill} labelKey="level" />
            ))
          ) : (
            <Text style={styles.emptyText}>No teach skills listed</Text>
          )}
        </ScrollView>
      </View>

      {/* Learn Skills */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Skills They Want to Learn</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(user.learnSkills || []).length > 0 ? (
            user.learnSkills.map((skill, idx) => (
              <SkillTag key={`learn-${idx}`} skill={skill} labelKey="priority" />
            ))
          ) : (
            <Text style={styles.emptyText}>No learn skills listed</Text>
          )}
        </ScrollView>
      </View>

      {/* Availability */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Availability</Text>
        {(user.availability || []).length > 0 ? (
          user.availability.map((entry, idx) => (
            <View key={`avail-${idx}`} style={styles.availRow}>
              <Text style={styles.availDay}>{entry.day}</Text>
              <Text style={styles.availSlots}>
                {(entry.slots || []).join(', ')}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No availability set</Text>
        )}
      </View>

      {/* Reviews */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Reviews</Text>
        <Text style={styles.reviewAverage}>⭐ {user.rating ? user.rating.toFixed(1) : 'No rating'}</Text>
        {userReviews && userReviews.length > 0 ? (
          userReviews.map((rev, idx) => (
            <View key={idx} style={styles.reviewItem}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <AvatarInitials name={rev.reviewer?.name} size={30} />
                 <Text style={{marginLeft: 8, fontWeight: 'bold', color: theme.colors.text}}>{rev.reviewer?.name}</Text>
                 <Text style={{marginLeft: 'auto', color: theme.colors.subtext, fontSize: 12}}>
                    {new Date(rev.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                 </Text>
              </View>
              <View style={{marginVertical: 4}}>
                <StarRating rating={rev.rating} />
              </View>
              {rev.comment ? <Text style={{color: theme.colors.text}}>{rev.comment}</Text> : null}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No reviews yet</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.requestBtn}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.requestBtnText}>Send Request</Text>
      </TouchableOpacity>

      {renderModal()}
    </ScrollView>
  );
}

// ══════════════════════════════════════════════
// Styles
// ══════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    paddingBottom: theme.spacing.xl * 2,
  },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },

  backBtn: {
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },

  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  profileName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    fontSize: theme.fontSizes.lg,
    color: '#FFD700',
    marginRight: theme.spacing.xs,
  },
  ratingNumber: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 100,
  },
  statValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginTop: theme.spacing.xs,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardLabel: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  bioText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    fontStyle: 'italic',
  },

  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.primary + '55',
  },
  skillTagName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  skillTagLevel: {
    fontSize: theme.fontSizes.sm - 1,
    color: theme.colors.primary,
    textTransform: 'capitalize',
  },

  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  availDay: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
    minWidth: 80,
  },
  availSlots: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    flex: 1,
  },

  // ── Reviews ──
  reviewAverage: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
    marginTop: 10,
  },

  requestBtn: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  requestBtnText: {
    color: theme.colors.background,
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    textAlign: 'center'
  },
  modalError: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  label: {
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.sm,
    marginBottom: 4,
    marginTop: 10,
    fontWeight: '600'
  },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 6,
    color: theme.colors.text,
    padding: 10,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  pickerItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background
  },
  pickerItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pickerItemText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm
  },
  pickerItemActiveText: {
    color: theme.colors.background,
    fontWeight: 'bold'
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    borderRadius: 6
  },
  cancelBtnText: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  sendBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6
  },
  sendBtnText: {
    color: theme.colors.background,
    fontWeight: '600'
  }
});
