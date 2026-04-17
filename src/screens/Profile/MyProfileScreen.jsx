import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyProfile,
  updateMyProfile,
  selectUserProfile,
  selectUserLoading,
  selectUserError,
} from '../../redux/slices/userSlice';
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

// ── Segmented control for level / priority ──
function SegmentedPicker({ options, selected, onSelect }) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.segmentBtn, selected === opt && styles.segmentBtnActive]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              selected === opt && styles.segmentTextActive,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ══════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════

export default function MyProfileScreen() {
  const dispatch = useDispatch();
  const profile = useSelector(selectUserProfile);
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const authUser = useSelector(state => state.auth.user);
  const userReviews = useSelector(selectUserReviews);

  const [editMode, setEditMode] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // ── Editable local state ──
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [availability, setAvailability] = useState([]);

  // ── Inline-add form state ──
  const [newTeachName, setNewTeachName] = useState('');
  const [newTeachLevel, setNewTeachLevel] = useState('beginner');
  const [newLearnName, setNewLearnName] = useState('');
  const [newLearnPriority, setNewLearnPriority] = useState('low');
  const [newAvailDay, setNewAvailDay] = useState('');
  const [newAvailSlots, setNewAvailSlots] = useState('');

  // ── Fetch profile on mount ──
  useEffect(() => {
    dispatch(fetchMyProfile()).then(() => {
      setInitialLoadDone(true);
    });
    if (authUser && (authUser._id || authUser.id)) {
      dispatch(fetchReviewsByUser(authUser._id || authUser.id));
    }
  }, [dispatch, authUser]);

  // ── When profile loads or changes, hydrate edit fields (and handle new-user) ──
  useEffect(() => {
    if (initialLoadDone && !profile) {
      // New user — enter edit mode immediately
      setEditMode(true);
    }
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setTeachSkills(profile.teachSkills || []);
      setLearnSkills(profile.learnSkills || []);
      setAvailability(profile.availability || []);
    }
  }, [profile, initialLoadDone]);

  // ── Edit actions ──
  const enterEditMode = () => setEditMode(true);

  const cancelEdit = () => {
    // Revert to the stored profile values
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setTeachSkills(profile.teachSkills || []);
      setLearnSkills(profile.learnSkills || []);
      setAvailability(profile.availability || []);
    }
    setEditMode(false);
  };

  const handleSave = useCallback(() => {
    dispatch(
      updateMyProfile({
        name,
        bio,
        teachSkills,
        learnSkills,
        availability,
      })
    ).then((result) => {
      if (!result.error) {
        setEditMode(false);
      }
    });
  }, [dispatch, name, bio, teachSkills, learnSkills, availability]);

  // ── Teach skills management ──
  const addTeachSkill = () => {
    if (!newTeachName.trim()) return;
    setTeachSkills((prev) => [
      ...prev,
      { name: newTeachName.trim(), level: newTeachLevel },
    ]);
    setNewTeachName('');
    setNewTeachLevel('beginner');
  };

  const removeTeachSkill = (idx) => {
    setTeachSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Learn skills management ──
  const addLearnSkill = () => {
    if (!newLearnName.trim()) return;
    setLearnSkills((prev) => [
      ...prev,
      { name: newLearnName.trim(), priority: newLearnPriority },
    ]);
    setNewLearnName('');
    setNewLearnPriority('low');
  };

  const removeLearnSkill = (idx) => {
    setLearnSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Availability management ──
  const addAvailability = () => {
    if (!newAvailDay.trim() || !newAvailSlots.trim()) return;
    const slots = newAvailSlots
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setAvailability((prev) => [...prev, { day: newAvailDay.trim(), slots }]);
    setNewAvailDay('');
    setNewAvailSlots('');
  };

  const removeAvailability = (idx) => {
    setAvailability((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Loading state ──
  if (!initialLoadDone && loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ── EDIT MODE ──
  if (editMode) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>
          {profile ? 'Edit Profile' : 'Create Your Profile'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={theme.colors.subtext}
        />

        {/* Bio */}
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          placeholderTextColor={theme.colors.subtext}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* ── Teach Skills ── */}
        <Text style={styles.sectionTitle}>Skills I Teach</Text>
        {teachSkills.map((skill, idx) => (
          <View key={`teach-${idx}`} style={styles.skillRow}>
            <View style={styles.skillTag}>
              <Text style={styles.skillTagName}>{skill.name}</Text>
              <Text style={styles.skillTagLevel}>{skill.level}</Text>
            </View>
            <TouchableOpacity
              onPress={() => removeTeachSkill(idx)}
              style={styles.removeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, styles.addInput]}
            value={newTeachName}
            onChangeText={setNewTeachName}
            placeholder="Skill name"
            placeholderTextColor={theme.colors.subtext}
          />
          <SegmentedPicker
            options={['beginner', 'intermediate', 'advanced']}
            selected={newTeachLevel}
            onSelect={setNewTeachLevel}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={addTeachSkill}
            activeOpacity={0.7}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* ── Learn Skills ── */}
        <Text style={styles.sectionTitle}>Skills I Want to Learn</Text>
        {learnSkills.map((skill, idx) => (
          <View key={`learn-${idx}`} style={styles.skillRow}>
            <View style={styles.skillTag}>
              <Text style={styles.skillTagName}>{skill.name}</Text>
              <Text style={styles.skillTagLevel}>{skill.priority}</Text>
            </View>
            <TouchableOpacity
              onPress={() => removeLearnSkill(idx)}
              style={styles.removeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, styles.addInput]}
            value={newLearnName}
            onChangeText={setNewLearnName}
            placeholder="Skill name"
            placeholderTextColor={theme.colors.subtext}
          />
          <SegmentedPicker
            options={['low', 'medium', 'high']}
            selected={newLearnPriority}
            onSelect={setNewLearnPriority}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={addLearnSkill}
            activeOpacity={0.7}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* ── Availability ── */}
        <Text style={styles.sectionTitle}>Availability</Text>
        {availability.map((entry, idx) => (
          <View key={`avail-${idx}`} style={styles.skillRow}>
            <View style={styles.availEntry}>
              <Text style={styles.availDay}>{entry.day}</Text>
              <Text style={styles.availSlots}>
                {(entry.slots || []).join(', ')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeAvailability(idx)}
              style={styles.removeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, styles.addInput]}
            value={newAvailDay}
            onChangeText={setNewAvailDay}
            placeholder="Day (e.g. Monday)"
            placeholderTextColor={theme.colors.subtext}
          />
          <TextInput
            style={[styles.input, styles.addInput]}
            value={newAvailSlots}
            onChangeText={setNewAvailSlots}
            placeholder="Slots (comma-separated)"
            placeholderTextColor={theme.colors.subtext}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={addAvailability}
            activeOpacity={0.7}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* ── Save / Cancel ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.text} />
            ) : (
              <Text style={styles.saveBtnText}>Save Profile</Text>
            )}
          </TouchableOpacity>
          {profile && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={cancelEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  // ── DISPLAY MODE ──
  return (
    <View style={styles.container}>
      <View style={styles.topBackground} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <AvatarInitials name={profile?.name} size={100} />
            <View style={styles.checkmarkBadge}><Text style={{ fontSize: 12, color: '#1E293B', fontWeight: 'bold' }}>✔</Text></View>
          </View>

          <Text style={styles.profileName}>{profile?.name}</Text>
          <Text style={styles.bioText}>{profile?.bio || 'Passionate about learning and sharing knowledge.'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={styles.statIcon}>☆ </Text>
                <Text style={styles.statValue}>{profile?.rating ? profile.rating.toFixed(1) : '0.0'}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={styles.statIcon}>📅 </Text>
                <Text style={styles.statValue}>{profile?.totalSessions || '0'}</Text>
              </View>
              <Text style={styles.statLabel}>Total{'\n'}Sessions</Text>
            </View>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={styles.statIcon}>👥 </Text>
                <Text style={styles.statValue}>{profile?.matches || '0'}</Text>
              </View>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtnOutline} onPress={enterEditMode} activeOpacity={0.8}>
            <Text style={styles.editBtnOutlineText}>📝  Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Skills I Can Teach */}
        <Text style={styles.sectionHeading}>Skills I Can Teach</Text>
        <View style={styles.tagBlockCard}>
          {(profile?.teachSkills || []).length > 0 ? (
            <View style={styles.tagContainer}>
              {profile.teachSkills.map((skill, idx) => (
                <View key={idx} style={styles.teachTag}>
                  <Text style={styles.teachTagText}>{skill.name}  <Text style={{ color: '#818CF8', textTransform: 'capitalize' }}>({skill.level})</Text></Text>
                </View>
              ))}
            </View>
          ) : <Text style={styles.emptyText}>No teaching skills added.</Text>}
        </View>

        {/* Skills I Want to Learn */}
        <Text style={styles.sectionHeading}>Skills I Want to Learn</Text>
        <View style={styles.tagBlockCard}>
          {(profile?.learnSkills || []).length > 0 ? (
            <View style={styles.tagContainer}>
              {profile.learnSkills.map((skill, idx) => (
                <View key={idx} style={styles.learnTag}>
                  <Text style={styles.learnTagText}>{skill.name}  <Text style={{ color: '#C084FC', textTransform: 'capitalize' }}>({skill.priority})</Text></Text>
                </View>
              ))}
            </View>
          ) : <Text style={styles.emptyText}>No learning skills added.</Text>}
        </View>

        {/* Availability */}
        <Text style={styles.sectionHeading}>Availability</Text>
        <View style={styles.tagBlockCard}>
          {(profile?.availability || []).length > 0 ? (
            <View style={styles.tagContainer}>
              {profile.availability.map((entry, idx) => (
                <View key={idx} style={styles.availTag}>
                  <Text style={styles.availTagText}>{entry.day} {(entry.slots || []).join(', ')}</Text>
                </View>
              ))}
            </View>
          ) : <Text style={styles.emptyText}>No availability set.</Text>}
        </View>

        {/* Padding at bottom */}
        <View style={{ height: 20 }} />
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
    backgroundColor: '#7C3AED', // Bright purple like the mockup top background
    height: 220,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0
  },
  settingsIcon: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
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
    position: 'relative'
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
  editBtnOutline: {
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  editBtnOutlineText: {
    color: '#818CF8',
    fontWeight: '600',
    fontSize: 14,
  },
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
    paddingHorizontal: 16
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
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // ── Skill Tags ──
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

  // ── Availability display ──
  availDisplayRow: {
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
  availEntry: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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

  // ── Edit Button ──
  editBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  editBtnText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
  },

  // ── Form inputs ──
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputMultiline: {
    minHeight: 100,
  },
  addInput: {
    marginBottom: theme.spacing.sm,
  },

  // ── Section titles (edit mode) ──
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },

  // ── Skill row in edit mode ──
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  removeBtn: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.error + '22',
    borderRadius: theme.borderRadius.sm,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
  },

  // ── Inline add form ──
  addForm: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  addBtn: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  addBtnText: {
    color: theme.colors.background,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
  },

  // ── Segmented control ──
  segmented: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  segmentText: {
    fontSize: theme.fontSizes.sm - 1,
    color: theme.colors.subtext,
    textTransform: 'capitalize',
  },
  segmentTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },

  // ── Save / Cancel ──
  actionRow: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelBtnText: {
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
});
