import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { C, R, FONT } from '../../../lib/design';

const DEMO_MEMBERS = [
  { id: '1', email: 'you@example.com', role: 'owner', status: 'active' },
];

export default function MembersScreen() {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color={C.primary} />
        <Text style={styles.backText}>Settings</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Members</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invite Member</Text>
        <View style={styles.inviteRow}>
          <TextInput
            style={[styles.input, focused && styles.inputFocused]}
            value={inviteEmail}
            onChangeText={setInviteEmail}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="colleague@example.com"
            placeholderTextColor={C.outlineVariant}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={[styles.inviteBtn, !inviteEmail.trim() && { opacity: 0.4 }]}>
            <Text style={styles.inviteBtnText}>Invite</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Members</Text>
        <View style={styles.membersList}>
          {DEMO_MEMBERS.map((m, i) => (
            <View key={m.id} style={[styles.memberRow, i < DEMO_MEMBERS.length - 1 && styles.memberRowBorder]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{m.email[0].toUpperCase()}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberEmail}>{m.email}</Text>
                <Text style={styles.memberStatus}>{m.status}</Text>
              </View>
              <View style={[styles.roleBadge, m.role === 'owner' && styles.roleBadgeOwner]}>
                <Text style={[styles.roleText, m.role === 'owner' && styles.roleTextOwner]}>
                  {m.role.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.surface },
  container: { padding: 32, gap: 24 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: C.primary, fontSize: 14, fontFamily: FONT },
  pageTitle: { color: C.onSurface, fontSize: 26, fontWeight: '600', fontFamily: FONT },
  section: { gap: 12 },
  sectionTitle: { color: C.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONT },
  inviteRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: C.surfaceLow, borderRadius: R.lg, padding: 12, color: C.onSurface, fontSize: 14, fontFamily: FONT },
  inputFocused: { backgroundColor: C.surfaceLowest, boxShadow: `0 0 15px ${C.secondaryContainer}` },
  inviteBtn: { backgroundColor: C.primary, borderRadius: R.lg, paddingHorizontal: 20, justifyContent: 'center' },
  inviteBtnText: { color: C.surfaceLowest, fontWeight: '600', fontSize: 14, fontFamily: FONT },
  membersList: { backgroundColor: C.surfaceLowest, borderRadius: R.xl, overflow: 'hidden', boxShadow: '0 1px 8px rgba(45,52,53,0.04)' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  memberRowBorder: { borderBottomWidth: 1, borderBottomColor: C.surfaceLow },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: C.secondary, fontWeight: '700', fontSize: 15, fontFamily: FONT },
  memberInfo: { flex: 1 },
  memberEmail: { color: C.onSurface, fontSize: 14, fontFamily: FONT },
  memberStatus: { color: C.primary, fontSize: 12, opacity: 0.6, fontFamily: FONT },
  roleBadge: { backgroundColor: C.surfaceLow, borderRadius: R.md, paddingHorizontal: 10, paddingVertical: 4 },
  roleBadgeOwner: { backgroundColor: C.secondaryContainer },
  roleText: { color: C.primary, fontSize: 11, fontWeight: '700', fontFamily: FONT },
  roleTextOwner: { color: C.secondary },
});
