import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../lib/store';
import { C, R, FONT } from '../../../lib/design';

const SETTINGS_ITEMS = [
  { label: 'API Keys', icon: 'key-outline', href: '/(dashboard)/settings/api-keys', desc: 'Manage your project API keys' },
  { label: 'Members', icon: 'people-outline', href: '/(dashboard)/settings/members', desc: 'Invite and manage team members' },
  { label: 'SDK Setup', icon: 'code-slash-outline', href: '/(dashboard)/settings/sdk-setup', desc: 'Quickstart guide for Python & TypeScript SDKs' },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const clearApiKey = useAppStore((s) => s.clearApiKey);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Settings</Text>

      <View style={styles.section}>
        {SETTINGS_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.href}
            style={[styles.row, i < SETTINGS_ITEMS.length - 1 && styles.rowBorder]}
            onPress={() => router.push(item.href as any)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon as any} size={18} color={C.secondary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={C.outlineVariant} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.signOut}
        onPress={async () => {
          await clearApiKey();
          router.replace('/(auth)/login');
        }}
      >
        <Ionicons name="log-out-outline" size={18} color={C.secondary} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.surface },
  container: { padding: 32, gap: 24 },
  pageTitle: { color: C.onSurface, fontSize: 26, fontWeight: '600', fontFamily: FONT },
  section: { backgroundColor: C.surfaceLowest, borderRadius: R.xl, overflow: 'hidden', boxShadow: '0 1px 8px rgba(45,52,53,0.04)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.surfaceLow },
  iconWrap: { width: 36, height: 36, borderRadius: R.lg, backgroundColor: C.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  label: { color: C.onSurface, fontSize: 15, fontWeight: '500', fontFamily: FONT },
  desc: { color: C.primary, fontSize: 13, marginTop: 2, fontFamily: FONT },
  signOut: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 18,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },
  signOutText: { color: C.secondary, fontSize: 15, fontWeight: '500', fontFamily: FONT },
});
