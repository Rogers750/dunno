import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, FONT } from '../../lib/design';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
}

export default function StatCard({ title, value, icon, subtitle }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
        <View style={styles.iconWrap}>
          <Ionicons name={icon as any} size={16} color={C.secondary} />
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: C.surfaceLowest,
    borderRadius: R.xl,
    padding: 20,
    gap: 8,
    boxShadow: '0 2px 40px rgba(45,52,53,0.04)',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: C.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, fontFamily: FONT },
  iconWrap: { width: 32, height: 32, borderRadius: R.lg, backgroundColor: C.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  value: { color: C.onSurface, fontSize: 28, fontWeight: '600', fontFamily: FONT },
  subtitle: { color: C.primary, fontSize: 12, fontFamily: FONT },
});
