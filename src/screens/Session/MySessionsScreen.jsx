import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SectionList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySessions, selectUpcomingSessions, selectPastSessions, selectSessionLoading } from '../../redux/slices/sessionSlice';
import theme from '../../theme';

function formatSessionDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return date.toLocaleDateString(undefined, options);
}

export default function MySessionsScreen({ navigation }) {
  const dispatch = useDispatch();
  const upcomingSessions = useSelector(selectUpcomingSessions);
  const pastSessions = useSelector(selectPastSessions);
  const loading = useSelector(selectSessionLoading);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchMySessions());
  }, [dispatch]);

  const renderSessionCard = ({ item }) => {
    const session = item;
    const otherParticipant = session.participants?.find(p => p._id !== (user?._id || user?.id)) || {};
    
    let badgeColor = theme.colors.subtext;
    if (session.status === 'scheduled') badgeColor = '#4CAF50';
    if (session.status === 'cancelled') badgeColor = theme.colors.error;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{session.skill}</Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
             <Text style={styles.badgeText}>{session.status}</Text>
          </View>
        </View>
        <Text style={styles.cardText}><Text style={{fontWeight: 'bold'}}>With:</Text> {otherParticipant.name || 'Unknown'}</Text>
        <Text style={styles.cardText}>{formatSessionDate(session.scheduledTime)}</Text>
        <Text style={styles.cardText}><Text style={{fontWeight: 'bold'}}>Duration:</Text> {session.duration} mins</Text>
        {session.status === 'scheduled' && (
           <TouchableOpacity 
             style={styles.openBtn}
             onPress={() => navigation.navigate('Session', { requestId: session.requestId?._id || session.requestId, offeredSkill: session.skill })}
           >
             <Text style={styles.openBtnText}>Open</Text>
           </TouchableOpacity>
        )}
      </View>
    );
  };

  const sections = [];
  if (upcomingSessions?.length > 0) sections.push({ title: 'Upcoming Sessions', data: upcomingSessions });
  if (pastSessions?.length > 0) sections.push({ title: 'Past Sessions', data: pastSessions });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Sessions</Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={item => item._id}
        renderItem={renderSessionCard}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No sessions scheduled.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  headerTitle: { fontSize: theme.fontSizes.xl, fontWeight: 'bold', color: theme.colors.text },
  list: { padding: 20 },
  sectionHeader: { fontSize: theme.fontSizes.lg, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15, marginTop: 10 },
  card: {
    backgroundColor: theme.colors.surface, padding: 15, borderRadius: 10, 
    borderWidth: 1, borderColor: theme.colors.border, marginBottom: 15
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: theme.fontSizes.md, fontWeight: 'bold', color: theme.colors.text },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  cardText: { color: theme.colors.subtext, fontSize: 13, marginBottom: 4 },
  openBtn: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 15, backgroundColor: theme.colors.primary, borderRadius: 5 },
  openBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyText: { color: theme.colors.subtext, textAlign: 'center', marginTop: 20 }
});
