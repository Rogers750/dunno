import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import StatCard from '../../components/ui/StatCard';
import SimpleBarChart from '../../components/charts/BarChart';
import IntentBar from '../../components/ui/IntentBar';
import { C, R, FONT } from '../../lib/design';


export default function DashboardScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(30),
  });

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.secondary} />}
    >
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <Text style={styles.pageSubtitle}>Last 30 days</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="Total Events" value={isLoading ? '—' : fmt(data?.total_events ?? 0)} icon="flash-outline" />
        <StatCard title="Sessions" value={isLoading ? '—' : fmt(data?.total_sessions ?? 0)} icon="chatbubbles-outline" />
        <StatCard title="People" value={isLoading ? '—' : fmt(data?.total_people ?? 0)} icon="people-outline" />
        <StatCard title="Agents" value={isLoading ? '—' : fmt(data?.total_agents ?? 0)} icon="hardware-chip-outline" />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Resolution Rate"
          value={isLoading ? '—' : data?.resolution_rate != null ? `${data.resolution_rate}%` : 'N/A'}
          icon="checkmark-circle-outline"
        />
        <StatCard
          title="Correction Rate"
          value={isLoading ? '—' : data?.correction_rate != null ? `${data.correction_rate}%` : 'N/A'}
          icon="refresh-outline"
        />
        <StatCard
          title="Avg Latency"
          value={isLoading ? '—' : `${data?.avg_latency_ms ?? 0}ms`}
          icon="timer-outline"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Events Over Time</Text>
        <View style={styles.chartCard}>
          <SimpleBarChart data={data?.chart_data ?? []} height={180} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intent Breakdown — across all sessions</Text>
        <View style={styles.intentCard}>
          {isLoading ? (
            <Text style={styles.emptyText}>Loading…</Text>
          ) : !data?.intent_breakdown?.filter(i => i.intent !== 'other').length ? (
            <Text style={styles.emptyText}>No intents detected yet. They appear after sessions are analyzed by the LLM.</Text>
          ) : (
            <IntentBar
              intents={data.intent_breakdown.filter(i => i.intent !== 'other').map(i => ({
                intent: i.intent,
                display_name: i.display_name || i.intent,
                weight: i.weight,
              }))}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.surface },
  container: { padding: 32, gap: 24 },
  header: { gap: 6 },
  pageTitle: { color: C.onSurface, fontSize: 26, fontWeight: '600', fontFamily: FONT },
  pageSubtitle: { color: C.primary, fontSize: 14, fontFamily: FONT },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  section: { gap: 12 },
  sectionTitle: { color: C.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONT },
  chartCard: { backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 24, boxShadow: '0 2px 40px rgba(45,52,53,0.04)' },
  intentCard: { backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 20, boxShadow: '0 1px 8px rgba(45,52,53,0.04)' },
  emptyText: { color: C.primary, fontSize: 13, fontFamily: FONT, textAlign: 'center', paddingVertical: 8 },
});
