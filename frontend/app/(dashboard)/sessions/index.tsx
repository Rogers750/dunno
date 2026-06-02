import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api, Session } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { C, R, FONT } from '../../../lib/design';

function SessionRow({ item, onPress }: { item: Session; onPress: () => void }) {
  const agentName = item.agents?.agent_name ?? 'Unknown Agent';
  const personId = item.people?.person_id ?? 'Anonymous';
  const date = new Date(item.updated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name="chatbubbles-outline" size={16} color={C.secondary} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.sessionId} numberOfLines={1}>{item.session_id}</Text>
        <View style={styles.rowMeta}>
          <Text style={styles.metaText}>{agentName}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{personId}</Text>
        </View>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.date}>{date}</Text>
        <Ionicons name="chevron-forward" size={14} color={C.outlineVariant} />
      </View>
    </TouchableOpacity>
  );
}

export default function SessionsScreen() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.listSessions(50),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Sessions</Text>
        <Text style={styles.count}>{data?.length ?? 0} sessions</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={C.secondary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <SessionRow
              item={item}
              onPress={() => router.push(`/(dashboard)/sessions/${item.session_id}` as any)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No sessions yet</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surface, padding: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle: { color: C.onSurface, fontSize: 26, fontWeight: '600', fontFamily: FONT },
  count: { color: C.primary, fontSize: 13, fontFamily: FONT },
  list: { gap: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surfaceLowest,
    padding: 16,
    borderRadius: R.xl,
  },
  iconWrap: { width: 36, height: 36, borderRadius: R.lg, backgroundColor: C.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  rowInfo: { flex: 1 },
  sessionId: { color: C.onSurface, fontSize: 14, fontWeight: '500', fontFamily: 'monospace' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { color: C.primary, fontSize: 12, fontFamily: FONT },
  metaDot: { color: C.primary, opacity: 0.4 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { color: C.primary, fontSize: 12, fontFamily: FONT },
  sep: { height: 8 },
  empty: { color: C.primary, textAlign: 'center', marginTop: 60, fontSize: 14, fontFamily: FONT },
});
