import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { C, R, FONT } from '../../../lib/design';

export default function AgentDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ['agent', name],
    queryFn: () => api.getAgent(name),
    enabled: !!name,
  });

  const { data: versions, isLoading: versionsLoading } = useQuery({
    queryKey: ['agent-versions', name],
    queryFn: () => api.listAgentVersions(name),
    enabled: !!name,
  });

  if (agentLoading) {
    return <View style={styles.center}><ActivityIndicator color={C.secondary} /></View>;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color={C.primary} />
        <Text style={styles.backText}>Agents</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.agentIcon}>
          <Ionicons name="hardware-chip-outline" size={24} color={C.secondary} />
        </View>
        <View>
          <Text style={styles.agentName}>{agent?.agent_name}</Text>
          {agent?.description && <Text style={styles.agentDesc}>{agent.description}</Text>}
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>{agent ? new Date(agent.created_at).toLocaleDateString() : '—'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Agent #</Text>
          <Text style={styles.infoValue}>{agent?.agent_number ?? '—'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={[styles.infoValue, { color: agent?.deprecated_at ? C.secondary : '#3a7a5a' }]}>
            {agent?.deprecated_at ? 'Deprecated' : 'Active'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Versions ({versions?.length ?? 0})</Text>
      {versionsLoading ? (
        <ActivityIndicator color={C.secondary} />
      ) : (
        <View style={styles.versionsList}>
          {versions?.map((v) => (
            <View key={v.id} style={styles.versionCard}>
              <View style={styles.versionHeader}>
                <Text style={styles.versionName}>{v.agent_version_name}</Text>
                <Text style={styles.versionNumber}>v{v.agent_version_number}</Text>
              </View>
              {v.model && (
                <View style={styles.modelBadge}>
                  <Text style={styles.modelText}>{v.model}</Text>
                </View>
              )}
              {v.description && <Text style={styles.versionDesc}>{v.description}</Text>}
              <Text style={styles.versionDate}>
                {new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          ))}
          {!versions?.length && <Text style={styles.empty}>No versions yet</Text>}
        </View>
      )}
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
  agentIcon: { width: 56, height: 56, borderRadius: R.xl, backgroundColor: C.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  agentName: { color: C.onSurface, fontSize: 22, fontWeight: '600', fontFamily: FONT },
  agentDesc: { color: C.primary, fontSize: 14, marginTop: 2, fontFamily: FONT },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoCard: { flex: 1, backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 16, gap: 4, boxShadow: '0 1px 8px rgba(45,52,53,0.04)' },
  infoLabel: { color: C.primary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700', fontFamily: FONT },
  infoValue: { color: C.onSurface, fontSize: 16, fontWeight: '600', fontFamily: FONT },
  sectionTitle: { color: C.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONT },
  versionsList: { gap: 8 },
  versionCard: { backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 16, gap: 6, boxShadow: '0 1px 8px rgba(45,52,53,0.04)' },
  versionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  versionName: { color: C.onSurface, fontSize: 15, fontWeight: '600', fontFamily: FONT },
  versionNumber: { color: C.primary, fontSize: 12, fontFamily: FONT },
  modelBadge: { alignSelf: 'flex-start', backgroundColor: C.secondaryContainer, borderRadius: R.md, paddingHorizontal: 8, paddingVertical: 3 },
  modelText: { color: C.secondary, fontSize: 12, fontFamily: FONT },
  versionDesc: { color: C.primary, fontSize: 13, fontFamily: FONT },
  versionDate: { color: C.primary, fontSize: 11, opacity: 0.6, fontFamily: FONT },
  empty: { color: C.primary, fontSize: 14, textAlign: 'center', marginTop: 20, fontFamily: FONT },
});
