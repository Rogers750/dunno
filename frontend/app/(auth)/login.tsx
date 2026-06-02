import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../lib/store';
import { api } from '../../lib/api';
import { C, R, FONT } from '../../lib/design';

export default function LoginScreen() {
  const [apiKey, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const setApiKey = useAppStore((s) => s.setApiKey);

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await setApiKey(apiKey.trim());
      await api.getDashboard(7);
      router.replace('/(dashboard)');
    } catch {
      setError('Invalid API key. Please check and try again.');
      useAppStore.getState().clearApiKey();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>D</Text>
        </View>
        <Text style={styles.title}>Dunno Tracker</Text>
        <Text style={styles.subtitle}>LLM Analytics for AI Agents</Text>

        <View style={styles.form}>
          <Text style={styles.label}>API KEY</Text>
          <TextInput
            style={[styles.input, focused && styles.inputFocused]}
            value={apiKey}
            onChangeText={setApiKeyInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="dn_live_..."
            placeholderTextColor={C.outlineVariant}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={C.surfaceLowest} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Get your API key from Settings → API Keys
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: C.surfaceLowest,
    borderRadius: R.xl,
    padding: 40,
    alignItems: 'center',
    boxShadow: '0 4px 40px rgba(45,52,53,0.04)',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: R.lg,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: { color: C.surfaceLowest, fontSize: 28, fontWeight: '700', fontFamily: FONT },
  title: { color: C.onSurface, fontSize: 24, fontWeight: '600', marginBottom: 4, fontFamily: FONT },
  subtitle: { color: C.primary, fontSize: 14, marginBottom: 36, fontFamily: FONT },
  form: { width: '100%', gap: 8 },
  label: {
    color: C.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: FONT,
  },
  input: {
    backgroundColor: C.surfaceLow,
    borderRadius: R.lg,
    padding: 14,
    color: C.onSurface,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputFocused: {
    backgroundColor: C.surfaceLowest,
    boxShadow: `0 0 15px ${C.secondaryContainer}`,
  },
  error: { color: C.secondary, fontSize: 13, marginTop: 4, fontFamily: FONT },
  button: {
    backgroundColor: C.primary,
    borderRadius: R.lg,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: C.surfaceLowest, fontSize: 15, fontWeight: '600', fontFamily: FONT },
  hint: { color: C.primary, fontSize: 12, marginTop: 28, textAlign: 'center', opacity: 0.6, fontFamily: FONT },
});
