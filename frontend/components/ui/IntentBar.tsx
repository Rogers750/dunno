import { View, Text, StyleSheet } from 'react-native';
import { C, R, FONT } from '../../lib/design';

export interface IntentSegment {
  intent: string;
  display_name: string;
  weight: number; // 0–1
}

interface Props {
  intents: IntentSegment[];
  showLabels?: boolean;
}

// Deterministic color per intent name — same name always gets same color
const PALETTE = [
  '#4a90d9', '#7c5cbf', '#e07b39', '#d94f4f', '#3aaa8c',
  '#c09a2a', '#5a9a6a', '#e05a8c', '#5a7abf', '#d97a4a',
];

export function intentColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function IntentBar({ intents, showLabels = true }: Props) {
  if (!intents || intents.length === 0) return null;

  // Normalize weights to sum to 1
  const total = intents.reduce((s, i) => s + (i.weight || 0), 0) || 1;
  const normalized = intents.map(i => ({ ...i, weight: (i.weight || 0) / total }));

  return (
    <View style={styles.wrap}>
      {/* Segmented bar */}
      <View style={styles.bar}>
        {normalized.map((seg, idx) => (
          <View
            key={seg.intent}
            style={[
              styles.segment,
              {
                flex: seg.weight,
                backgroundColor: intentColor(seg.intent),
                borderTopLeftRadius: idx === 0 ? R.lg : 0,
                borderBottomLeftRadius: idx === 0 ? R.lg : 0,
                borderTopRightRadius: idx === normalized.length - 1 ? R.lg : 0,
                borderBottomRightRadius: idx === normalized.length - 1 ? R.lg : 0,
              },
            ]}
          />
        ))}
      </View>

      {/* Labels row — wraps to second line naturally */}
      {showLabels && (
        <View style={styles.labels}>
          {normalized.map((seg) => (
            <View key={seg.intent} style={styles.labelItem}>
              <View style={[styles.dot, { backgroundColor: intentColor(seg.intent) }]} />
              <Text style={styles.labelText} numberOfLines={1}>
                {seg.display_name || seg.intent.replace(/_/g, ' ')}
              </Text>
              <Text style={styles.pct}>{Math.round(seg.weight * 100)}%</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  segment: { height: 10 },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  labelText: {
    color: C.onSurface,
    fontSize: 11,
    fontFamily: FONT,
    maxWidth: 120,
  },
  pct: {
    color: C.primary,
    fontSize: 11,
    fontFamily: FONT,
    opacity: 0.7,
  },
});
