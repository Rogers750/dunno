import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api, Message } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import IntentBar from '../../../components/ui/IntentBar';
import { C, R, FONT } from '../../../lib/design';

const ROLE_COLORS: Record<string, string> = {
  user: C.secondary,
  assistant: C.primary,
  system: '#a07020',
  tool: '#3a7a5a',
};

const RESOLUTION_COLORS: Record<string, string> = {
  success: C.secondary,
  abandoned: C.primary,
  escalated: '#a07020',
};

function MessageBubble({ msg }: { msg: Message }) {
  const color = ROLE_COLORS[msg.role] || C.primary;
  return (
    <View style={[styles.bubble, { borderLeftColor: color }]}>
      <Text style={[styles.roleLabel, { color }]}>{msg.role.toUpperCase()}</Text>
      <Text style={styles.messageContent}>{msg.content || '[tool call]'}</Text>
      {msg.tool_calls && msg.tool_calls.length > 0 && (
        <View style={styles.toolCallsWrap}>
          <Text style={styles.toolCallsLabel}>Tool Calls</Text>
          <Text style={styles.toolCallsJson}>{JSON.stringify(msg.tool_calls, null, 2)}</Text>
        </View>
      )}
    </View>
  );
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => api.getSession(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={C.secondary} /></View>;
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  const fmt = (n: number) =>
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color={C.primary} />
        <Text style={styles.backText}>Sessions</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Session Details</Text>
        <Text style={styles.sessionId}>{data.session_id}</Text>
      </View>

      {/* Meta chips */}
      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Ionicons name="hardware-chip-outline" size={13} color={C.primary} />
          <Text style={styles.metaChipText}>{data.agents?.agent_name ?? 'No agent'}</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="person-outline" size={13} color={C.primary} />
          <Text style={styles.metaChipText}>{data.people?.person_id ?? 'Anonymous'}</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="time-outline" size={13} color={C.primary} />
          <Text style={styles.metaChipText}>
            {new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>

      {/* Token + latency stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{fmt(data.total_tokens ?? 0)}</Text>
          <Text style={styles.statLabel}>Total Tokens</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{fmt(data.total_input_tokens ?? 0)}</Text>
          <Text style={styles.statLabel}>Input</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{fmt(data.total_output_tokens ?? 0)}</Text>
          <Text style={styles.statLabel}>Output</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data.total_latency_ms ?? 0}ms</Text>
          <Text style={styles.statLabel}>Total Latency</Text>
        </View>
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{data.summary}</Text>
        </View>
      )}

      {/* Resolution */}
      {data.resolution && (
        <View style={[styles.resolutionBanner, { borderLeftColor: RESOLUTION_COLORS[data.resolution.resolution_type] ?? C.primary }]}>
          <Ionicons
            name={data.resolution.resolved ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={RESOLUTION_COLORS[data.resolution.resolution_type] ?? C.primary}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.resolutionText, { color: RESOLUTION_COLORS[data.resolution.resolution_type] ?? C.primary }]}>
              {data.resolution.resolved ? 'Resolved' : 'Unresolved'} · {data.resolution.resolution_type}
            </Text>
            {data.resolution.summary && (
              <Text style={styles.resolutionReason}>{data.resolution.summary}</Text>
            )}
          </View>
        </View>
      )}

      {/* Intent bar — session path visualized */}
      {data.intents && data.intents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intent Path</Text>
          <View style={styles.intentBarCard}>
            <IntentBar
              intents={data.intents.map(i => ({
                intent: i.intent,
                display_name: i.display_name || i.intent,
                weight: i.weight,
              }))}
            />
          </View>
        </View>
      )}

      {/* Corrections */}
      {data.corrections && data.corrections.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Corrections ({data.corrections.length})</Text>
          {data.corrections.map((c, i) => (
            <View key={i} style={styles.correctionCard}>
              <Text style={styles.correctionLabel}>At message {c.msg_index ?? '?'}</Text>
              <Text style={styles.correctionText}>{c.reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Event Timeline */}
      <Text style={styles.sectionTitle}>Timeline ({data.events?.length ?? 0} events)</Text>
      {data.events?.map((event, idx) => (
        <View key={event.id} style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>{idx + 1}</Text>
            </View>
            <View style={styles.eventMeta}>
              <Text style={styles.eventName}>{event.event_name}</Text>
              <View style={styles.eventStats}>
                {event.model && <Text style={styles.eventStat}>{event.model}</Text>}
                {event.input_tokens != null && (
                  <Text style={styles.eventStat}>{event.input_tokens + (event.output_tokens ?? 0)} tokens</Text>
                )}
                {event.latency_ms != null && (
                  <Text style={styles.eventStat}>{event.latency_ms}ms</Text>
                )}
              </View>
            </View>
            <Text style={styles.eventTime}>
              {new Date(event.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          </View>

          {event.messages?.length > 0 && (
            <View style={styles.messages}>
              {event.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.surface },
  container: { padding: 32, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.surface },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  backText: { color: C.primary, fontSize: 14, fontFamily: FONT },
  header: { gap: 4 },
  pageTitle: { color: C.onSurface, fontSize: 26, fontWeight: '600', fontFamily: FONT },
  sessionId: { color: C.primary, fontSize: 13, fontFamily: 'monospace' },
  errorText: { color: C.secondary, fontSize: 16, fontFamily: FONT },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.surfaceLowest, borderRadius: R.lg, paddingHorizontal: 12, paddingVertical: 6,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },
  metaChipText: { color: C.primary, fontSize: 12, fontFamily: FONT },

  statsRow: {
    flexDirection: 'row', gap: 8,
    backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 16,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { color: C.onSurface, fontSize: 16, fontWeight: '600', fontFamily: FONT },
  statLabel: { color: C.primary, fontSize: 11, fontFamily: FONT, textAlign: 'center' },

  summaryCard: {
    backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 16, gap: 8,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },
  summaryText: { color: C.onSurface, fontSize: 14, lineHeight: 22, fontFamily: FONT },

  resolutionBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: C.surfaceLowest, borderRadius: R.lg, padding: 12, borderLeftWidth: 3,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },
  resolutionText: { fontSize: 13, fontWeight: '600', fontFamily: FONT },
  resolutionReason: { color: C.primary, fontSize: 12, fontFamily: FONT, marginTop: 2 },

  section: { gap: 8 },
  sectionTitle: { color: C.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONT },

  intentBarCard: {
    backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 16,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },

  correctionCard: {
    backgroundColor: C.surfaceLowest, borderRadius: R.lg, padding: 12, gap: 4,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },
  correctionLabel: { color: C.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONT },
  correctionText: { color: C.onSurface, fontSize: 13, fontFamily: FONT },

  eventCard: { backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 16, gap: 12, boxShadow: '0 1px 8px rgba(45,52,53,0.04)' },
  eventHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  eventBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  eventBadgeText: { color: C.secondary, fontSize: 11, fontWeight: '700', fontFamily: FONT },
  eventMeta: { flex: 1, gap: 4 },
  eventName: { color: C.onSurface, fontSize: 14, fontWeight: '600', fontFamily: FONT },
  eventStats: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  eventStat: { color: C.primary, fontSize: 12, backgroundColor: C.surfaceLow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.md, fontFamily: FONT },
  eventTime: { color: C.primary, fontSize: 11, fontFamily: FONT },
  messages: { gap: 8, paddingLeft: 38 },
  bubble: { borderLeftWidth: 2, paddingLeft: 12, paddingVertical: 4, gap: 4 },
  roleLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, fontFamily: FONT },
  messageContent: { color: C.onSurface, fontSize: 13, lineHeight: 20, fontFamily: FONT },
  toolCallsWrap: { backgroundColor: C.surfaceLow, borderRadius: R.md, padding: 8, marginTop: 4 },
  toolCallsLabel: { color: C.secondary, fontSize: 11, fontWeight: '600', marginBottom: 4, fontFamily: FONT },
  toolCallsJson: { color: C.primary, fontSize: 11, fontFamily: 'monospace' },
});
