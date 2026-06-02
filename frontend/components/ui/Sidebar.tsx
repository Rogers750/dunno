import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, R, FONT } from '../../lib/design';

const NAV = [
  { label: 'Dashboard', icon: 'grid-outline', href: '/(dashboard)' },
  { label: 'Sessions', icon: 'chatbubbles-outline', href: '/(dashboard)/sessions' },
  { label: 'Agents', icon: 'hardware-chip-outline', href: '/(dashboard)/agents' },
  { label: 'People', icon: 'people-outline', href: '/(dashboard)/people' },
  { label: 'Settings', icon: 'settings-outline', href: '/(dashboard)/settings' },
] as const;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <Image
          source={require('../../assets/dunno_mark.svg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>Dunno</Text>
      </View>

      <View style={styles.nav}>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/(dashboard)' && pathname.startsWith(item.href));
          return (
            <TouchableOpacity
              key={item.href}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.href as any)}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={active ? C.secondary : C.primary}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>LLM Analytics</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: C.surfaceLow,
    paddingVertical: 24,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 32 },
  logo: { width: 32, height: 32 },
  brandName: { color: C.onSurface, fontSize: 18, fontWeight: '600', fontFamily: FONT },
  nav: { gap: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: R.lg,
  },
  navItemActive: { backgroundColor: C.secondaryContainer },
  navLabel: { color: C.primary, fontSize: 14, fontWeight: '500', fontFamily: FONT },
  navLabelActive: { color: C.secondary, fontWeight: '600' },
  footer: { paddingHorizontal: 8 },
  footerText: { color: C.primary, fontSize: 11, fontFamily: FONT },
});
