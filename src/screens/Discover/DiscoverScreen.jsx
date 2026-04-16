import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDiscoverList,
  selectDiscoverList,
  selectUserLoading,
} from '../../redux/slices/userSlice';
import theme from '../../theme';

// ── Level options for segmented filter ──
const LEVEL_OPTIONS = ['any', 'beginner', 'intermediate', 'advanced'];

// ── Helper: Avatar with initials ──
function AvatarInitials({ name, size = 48 }) {
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

// ── Helper: Star rating ──
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
    <Text style={styles.miniStars}>
      {stars.join('')}{' '}
      <Text style={styles.miniRating}>{rating.toFixed(1)}</Text>
    </Text>
  );
}

// ── User Card Component ──
function UserCard({ user, onPress }) {
  const topSkills = (user.teachSkills || []).slice(0, 2);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        <AvatarInitials name={user.name} size={52} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{user.name}</Text>
          <StarRating rating={user.rating || 0} />
          <View style={styles.cardSkillsRow}>
            {topSkills.map((skill, idx) => (
              <View key={idx} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill.name}</Text>
              </View>
            ))}
            {(user.teachSkills || []).length > 2 && (
              <Text style={styles.moreSkills}>
                +{user.teachSkills.length - 2}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ══════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════

export default function DiscoverScreen({ navigation }) {
  const dispatch = useDispatch();
  const discoverList = useSelector(selectDiscoverList);
  const loading = useSelector(selectUserLoading);

  // ── Filter state ──
  const [skillFilter, setSkillFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('any');
  const [availFilter, setAvailFilter] = useState('');

  // ── Load all users on mount ──
  useEffect(() => {
    dispatch(fetchDiscoverList({}));
  }, [dispatch]);

  // ── Search handler ──
  const handleSearch = () => {
    const filters = {};
    if (skillFilter.trim()) filters.skill = skillFilter.trim();
    if (levelFilter && levelFilter !== 'any') filters.level = levelFilter;
    if (availFilter.trim()) filters.availability = availFilter.trim();
    dispatch(fetchDiscoverList(filters));
  };

  // ── Clear handler ──
  const handleClear = () => {
    setSkillFilter('');
    setLevelFilter('any');
    setAvailFilter('');
    dispatch(fetchDiscoverList({}));
  };

  // ── Navigate to ViewProfile ──
  const handleCardPress = (userId) => {
    navigation.navigate('ViewProfile', { userId });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.screenTitle}>Discover</Text>
      <Text style={styles.screenSubtitle}>Find people to learn from & teach</Text>

      {/* ── Filter Bar ── */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.filterInput}
          value={skillFilter}
          onChangeText={setSkillFilter}
          placeholder="Search by skill..."
          placeholderTextColor={theme.colors.subtext}
        />

        {/* Level segmented control */}
        <View style={styles.segmented}>
          {LEVEL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.segmentBtn,
                levelFilter === opt && styles.segmentBtnActive,
              ]}
              onPress={() => setLevelFilter(opt)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  levelFilter === opt && styles.segmentTextActive,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.filterInput}
          value={availFilter}
          onChangeText={setAvailFilter}
          placeholder="Availability day (e.g. Monday)"
          placeholderTextColor={theme.colors.subtext}
        />

        <View style={styles.filterBtnRow}>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Results ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : discoverList.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your filters or search terms
          </Text>
        </View>
      ) : (
        <FlatList
          data={discoverList}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <UserCard user={item} onPress={() => handleCardPress(item._id)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ══════════════════════════════════════════════
// Styles
// ══════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
  },
  screenTitle: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
  },
  screenSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },

  // ── Filter container ──
  filterContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  filterInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm + 2,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
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
    fontSize: theme.fontSizes.sm - 2,
    color: theme.colors.subtext,
    textTransform: 'capitalize',
  },
  segmentTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  filterBtnRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  searchBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  searchBtnText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearBtnText: {
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },

  // ── List ──
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing.xl * 2,
  },

  // ── User Card ──
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  miniStars: {
    fontSize: theme.fontSizes.sm,
    color: '#FFD700',
    marginBottom: theme.spacing.xs,
  },
  miniRating: {
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.sm - 1,
  },
  cardSkillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: theme.colors.primary + '22',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  skillChipText: {
    fontSize: theme.fontSizes.sm - 2,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  moreSkills: {
    fontSize: theme.fontSizes.sm - 2,
    color: theme.colors.subtext,
  },
  chevron: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.subtext,
    marginLeft: theme.spacing.sm,
  },

  // ── Empty state ──
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
  },
});
