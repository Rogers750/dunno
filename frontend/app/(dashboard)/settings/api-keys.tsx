import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api, ApiKey } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { C, R, FONT } from '../../../lib/design';

export default function ApiKeysScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: api.listApiKeys,
  });

  const createMutation = useMutation({
    mutationFn: () => api.createApiKey(newKeyName),
    onSuccess: (data) => {
      setCreatedKey(data.key);
      setNewKeyName('');
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.revokeApiKey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const handleRevoke = (key: ApiKey) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Revoke key "${key.name}"? This cannot be undone.`)) {
        revokeMutation.mutate(key.id);
      }
    } else {
      Alert.alert('Revoke Key', `Revoke "${key.name}"? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Revoke', style: 'destructive', onPress: () => revokeMutation.mutate(key.id) },
      ]);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color={C.primary} />
        <Text style={styles.backText}>Settings</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.pageTitle}>API Keys</Text>
        <Text style={styles.desc}>Use these keys to authenticate SDK requests.</Text>
      </View>

      {createdKey && (
        <View style={styles.newKeyBanner}>
          <View style={styles.newKeyHeader}>
            <Ionicons name="checkmark-circle" size={16} color={C.secondary} />
            <Text style={styles.newKeyTitle}>Key created — copy it now, it won't be shown again</Text>
          </View>
          <Text style={styles.newKeyValue} selectable>{createdKey}</Text>
          <TouchableOpacity onPress={() => setCreatedKey(null)}>
            <Text style={styles.dismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.createForm}>
        <Text style={styles.label}>KEY NAME</Text>
        <View style={styles.createRow}>
          <TextInput
            style={[styles.input, focused && styles.inputFocused]}
            value={newKeyName}
            onChangeText={setNewKeyName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. Production"
            placeholderTextColor={C.outlineVariant}
          />
          <TouchableOpacity
            style={[styles.createBtn, !newKeyName.trim() && { opacity: 0.4 }]}
            onPress={() => newKeyName.trim() && createMutation.mutate()}
            disabled={!newKeyName.trim() || createMutation.isPending}
          >
            {createMutation.isPending
              ? <ActivityIndicator color={C.surfaceLowest} size="small" />
              : <Text style={styles.createBtnText}>Create</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={C.secondary} />
      ) : (
        <View style={styles.keysList}>
          {keys?.map((key) => (
            <View key={key.id} style={styles.keyRow}>
              <View style={styles.keyInfo}>
                <Text style={styles.keyName}>{key.name}</Text>
                <Text style={styles.keyPrefix}>{key.key_prefix}••••••••</Text>
                <Text style={styles.keyMeta}>
                  Created {new Date(key.created_at).toLocaleDateString()}
                  {key.last_used_at ? ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}` : ' · Never used'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRevoke(key)} style={styles.revokeBtn}>
                <Text style={styles.revokeBtnText}>Revoke</Text>
              </TouchableOpacity>
            </View>
          ))}
          {!keys?.length && <Text style={styles.empty}>No API keys yet</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.surface },
  container: { padding: 32, gap: 20 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: C.primary, fontSize: 14, fontFamily: FONT },
  header: { gap: 4 },
  pageTitle: { color: C.onSurface, fontSize: 26, fontWeight: '600', fontFamily: FONT },
  desc: { color: C.primary, fontSize: 14, fontFamily: FONT },
  newKeyBanner: { backgroundColor: C.secondaryContainer, borderRadius: R.xl, padding: 16, gap: 8 },
  newKeyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newKeyTitle: { color: C.secondary, fontSize: 13, fontWeight: '600', flex: 1, fontFamily: FONT },
  newKeyValue: { color: C.onSurface, fontSize: 13, fontFamily: 'monospace', backgroundColor: C.surfaceLowest, padding: 10, borderRadius: R.lg },
  dismiss: { color: C.secondary, fontSize: 13, alignSelf: 'flex-end', fontFamily: FONT },
  createForm: { gap: 8 },
  label: { color: C.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, fontFamily: FONT },
  createRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: C.surfaceLow, borderRadius: R.lg, padding: 12, color: C.onSurface, fontSize: 14, fontFamily: FONT },
  inputFocused: { backgroundColor: C.surfaceLowest, boxShadow: `0 0 15px ${C.secondaryContainer}` },
  createBtn: { backgroundColor: C.primary, borderRadius: R.lg, paddingHorizontal: 20, justifyContent: 'center' },
  createBtnText: { color: C.surfaceLowest, fontWeight: '600', fontSize: 14, fontFamily: FONT },
  keysList: { gap: 8 },
  keyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.surfaceLowest, borderRadius: R.xl, padding: 16,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },
  keyInfo: { gap: 3, flex: 1 },
  keyName: { color: C.onSurface, fontSize: 14, fontWeight: '600', fontFamily: FONT },
  keyPrefix: { color: C.primary, fontSize: 13, fontFamily: 'monospace' },
  keyMeta: { color: C.primary, fontSize: 12, opacity: 0.6, fontFamily: FONT },
  revokeBtn: { backgroundColor: C.secondaryContainer, borderRadius: R.lg, paddingHorizontal: 12, paddingVertical: 6 },
  revokeBtnText: { color: C.secondary, fontSize: 13, fontFamily: FONT },
  empty: { color: C.primary, fontSize: 14, textAlign: 'center', marginTop: 20, fontFamily: FONT },
});
