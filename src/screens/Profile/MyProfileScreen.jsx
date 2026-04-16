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
  }, [dispatch]);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.screenTitle}>My Profile</Text>

      {/* Avatar + Name + Rating */}
      <View style={styles.profileHeader}>
        <AvatarInitials name={profile?.name} size={90} />
        <Text style={styles.profileName}>{profile?.name}</Text>
        <StarRating rating={profile?.rating || 0} />
      </View>

      {/* Bio */}
      {profile?.bio ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bio</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      ) : null}

      {/* XP & Level */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile?.xp || 0}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile?.level || 1}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      {/* Teach Skills */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Skills I Teach</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(profile?.teachSkills || []).length > 0 ? (
            profile.teachSkills.map((skill, idx) => (
              <SkillTag key={`teach-${idx}`} skill={skill} labelKey="level" />
            ))
          ) : (
            <Text style={styles.emptyText}>No teach skills yet</Text>
          )}
        </ScrollView>
      </View>

      {/* Learn Skills */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Skills I Want to Learn</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(profile?.learnSkills || []).length > 0 ? (
            profile.learnSkills.map((skill, idx) => (
              <SkillTag key={`learn-${idx}`} skill={skill} labelKey="priority" />
            ))
          ) : (
            <Text style={styles.emptyText}>No learn skills yet</Text>
          )}
        </ScrollView>
      </View>

      {/* Availability */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Availability</Text>
        {(profile?.availability || []).length > 0 ? (
          profile.availability.map((entry, idx) => (
            <View key={`avail-${idx}`} style={styles.availDisplayRow}>
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

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={enterEditMode}
        activeOpacity={0.8}
      >
        <Text style={styles.editBtnText}>Edit Profile</Text>
      </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: theme.spacing.xl * 2,
  },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.md,
  },

  // ── Profile Header (display mode) ──
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

  // ── Stars ──
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

  // ── Stats ──
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

  // ── Card ──
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
