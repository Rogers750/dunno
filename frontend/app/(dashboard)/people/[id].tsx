import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { C, R, FONT } from '../../../lib/design';

export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', id],
    queryFn: () => api.getPerson(id),
    enabled: !!id,
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions', { person: id }],
    queryFn: () => api.listSessions(20),
    enabled: !!id,
  });

  const personSessions = sessions?.filter((s) => s.people?.person_id === id) ?? [];
  const props = (person?.properties ?? {}) as Record<string, string>;

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={C.secondary} /></View>;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color={C.primary} />
        <Text style={styles.backText}>People</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(props?.name || person?.person_id || '?')[0].toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.name}>{props?.name || person?.person_id}</Text>
          <Text style={styles.personId}>{person?.person_id}</Text>
        </View>
      </View>

      {Object.keys(props).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Properties</Text>
          <View style={styles.propsCard}>
            {Object.entries(props).map(([k, v], i, arr) => (
              <View key={k} style={[styles.propRow, i < arr.length - 1 && styles.propRowBorder]}>
                <Text style={styles.propKey}>{k}</Text>
                <Text style={styles.propValue}>{String(v)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions ({personSessions.length})</Text>
        {personSessions.length === 0 ? (
          <Text style={styles.empty}>No sessions yet</Text>
        ) : (
          personSessions.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.sessionRow}
              onPress={() => router.push(`/(dashboard)/sessions/${s.session_id}` as any)}
            >
              <Text style={styles.sessionId} numberOfLines={1}>{s.session_id}</Text>
              <Text style={styles.sessionDate}>{new Date(s.updated_at).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.surface },
  container: { padding: 32, gap: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.surface },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: C.primary, fontSize: 14, fontFamily: FONT },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: C.secondary, fontSize: 24, fontWeight: '700', fontFamily: FONT },
  name: { color: C.onSurface, fontSize: 22, fontWeight: '600', fontFamily: FONT },
  personId: { color: C.primary, fontSize: 13, fontFamily: 'monospace' },
  section: { gap: 10 },
  sectionTitle: { color: C.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONT },
  propsCard: { backgroundColor: C.surfaceLowest, borderRadius: R.xl, overflow: 'hidden', boxShadow: '0 1px 8px rgba(45,52,53,0.04)' },
  propRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  propRowBorder: { borderBottomWidth: 1, borderBottomColor: C.surfaceLow },
  propKey: { color: C.primary, fontSize: 13, fontFamily: FONT },
  propValue: { color: C.onSurface, fontSize: 13, fontWeight: '500', fontFamily: FONT },
  sessionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 14,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },
  sessionId: { color: C.onSurface, fontSize: 13, fontFamily: 'monospace', flex: 1 },
  sessionDate: { color: C.primary, fontSize: 12, fontFamily: FONT },
  empty: { color: C.primary, fontSize: 14, fontFamily: FONT },
});
