import { Ionicons } from '@expo/vector-icons';
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
function AvatarInitials({ name, size = 50 }) {
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
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

// ── User Card Component ──
function UserCard({ user, onPress }) {
  const topSkills = (user.teachSkills || []).slice(0, 2);

  return (
    <TouchableOpacity
      style={styles.userCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeaderArea}>
         <View style={styles.avatarHolder}>
            <AvatarInitials name={user.name} size={50} />
            <View style={styles.checkmarkBadge}><Ionicons name="checkmark" size={10} color="#1E293B" style={{fontWeight:'bold'}} /></View>
         </View>
         <View style={styles.cardInfo}>
           <Text style={styles.cardName}>{user.name}</Text>
           <Text style={styles.cardStats}><Ionicons name="star" size={13} color="#FFD700"/> {user.rating?.toFixed(1) || '0.0'}   •   <Ionicons name="people" size={13} color="#94A3B8"/> {user.matches || '0'} matches</Text>
         </View>
         <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.skillsRow}>
         {topSkills.map((skill, idx) => (
           <View key={idx} style={styles.teachTag}>
             <Text style={styles.teachTagText}>{skill.name}</Text>
           </View>
         ))}
         {(user.teachSkills || []).length > 2 && (
           <View style={[styles.teachTag, {backgroundColor: '#334155'}]}>
              <Text style={styles.teachTagText}>+{(user.teachSkills || []).length - 2} more</Text>
           </View>
         )}
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
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find people to learn from & teach</Text>
      </View>

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
          <Ionicons name="search-outline" size={50} color="#64748B" style={{marginBottom:10}} />
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
    backgroundColor: '#0F172A',
  },
  headerArea: {
    backgroundColor: '#1E293B',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  
  // ── Filter container ──
  filterContainer: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  filterInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    color: '#F8FAFC',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  segmented: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  segmentBtnActive: {
    backgroundColor: '#3730A3', // Active segment
    borderColor: '#3730A3',
  },
  segmentText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  segmentTextActive: {
    color: '#F8FAFC',
  },
  filterBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBtn: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  clearBtnText: {
    color: '#94A3B8',
    fontWeight: 'bold',
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },

  // ── User Card ──
  userCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },
  cardHeaderArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarHolder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#475569',
    position: 'relative'
  },
  avatar: {
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  cardName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardStats: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  chevron: {
    color: '#475569',
    fontSize: 24,
    fontWeight: 'bold',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 65, // align with text
  },
  teachTag: {
    backgroundColor: '#312E81',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teachTagText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // ── Empty state ──
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
