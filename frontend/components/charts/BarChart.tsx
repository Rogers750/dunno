import { View, Text, StyleSheet } from 'react-native';
import { C, FONT } from '../../lib/design';

interface DataPoint {
  date: string;
  events: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

export default function SimpleBarChart({ data, height = 160 }: Props) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No data</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.events), 1);
  const displayData = data.slice(-30);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.bars}>
        {displayData.map((d, i) => {
          const barHeight = Math.max(2, (d.events / maxVal) * (height - 40));
          return (
            <View key={i} style={styles.barWrap}>
              <View style={[styles.bar, { height: barHeight }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {displayData.length > 0 && (
          <>
            <Text style={styles.label}>{displayData[0].date.slice(5)}</Text>
            <Text style={styles.label}>{displayData[displayData.length - 1].date.slice(5)}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2, paddingBottom: 24 },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '80%', backgroundColor: C.secondary, borderRadius: 3 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  label: { color: C.primary, fontSize: 11, fontFamily: FONT },
  empty: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: C.outlineVariant, fontSize: 13, fontFamily: FONT },
});
