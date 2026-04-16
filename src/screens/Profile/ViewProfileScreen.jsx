import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserById,
  selectViewedUser,
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

// ══════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════

export default function ViewProfileScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectViewedUser);
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  const { userId } = route.params || {};

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
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

      {/* Placeholder Send Request button (Phase 7) */}
      <TouchableOpacity
        style={styles.requestBtn}
        activeOpacity={0.8}
        onPress={() => {}}
      >
        <Text style={styles.requestBtnText}>Send Request</Text>
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

  // ── Back button ──
  backBtn: {
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },

  // ── Profile Header ──
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

  // ── Availability ──
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

  // ── Placeholder Send Request button ──
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
});
