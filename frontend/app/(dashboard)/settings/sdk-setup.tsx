import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type Lang = 'python' | 'typescript';

const CODE = {
  python: {
    install: `pip install voker`,
    usage: `import os
from voker.ai.provider_openai import OpenAI

os.environ["VOKER_API_KEY"] = "vk_live_..."
os.environ["OPENAI_API_KEY"] = "sk-..."

client = OpenAI()

response = client.chat.completions.create(
    voker_agent="my-agent",
    voker_session="session-123",
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}]
)`,
  },
  typescript: {
    install: `npm install @voker/voker`,
    usage: `import { OpenAI } from '@voker/voker/ai/provider-openai';

const client = new OpenAI();

await client.chat.completions.create({
    vokerAgent: 'my-agent',
    vokerSession: 'session-123',
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Hello!' }],
});`,
  },
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.codeWrap}>
      <TouchableOpacity style={styles.copyBtn} onPress={copy}>
        <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={copied ? '#10b981' : '#666'} />
        <Text style={[styles.copyText, copied && { color: '#10b981' }]}>{copied ? 'Copied' : 'Copy'}</Text>
      </TouchableOpacity>
      <Text style={styles.code} selectable>{code}</Text>
    </View>
  );
}

export default function SdkSetupScreen() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('python');

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#888" />
        <Text style={styles.backText}>Settings</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>SDK Setup</Text>
      <Text style={styles.desc}>Integrate Voker into your AI application in minutes.</Text>

      {/* Language picker */}
      <View style={styles.tabs}>
        {(['python', 'typescript'] as Lang[]).map((l) => (
          <TouchableOpacity
            key={l}
            style={[styles.tab, lang === l && styles.tabActive]}
            onPress={() => setLang(l)}
          >
            <Text style={[styles.tabText, lang === l && styles.tabTextActive]}>
              {l === 'python' ? 'Python' : 'TypeScript'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.steps}>
        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Install the SDK</Text>
            <CodeBlock code={CODE[lang].install} />
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Set your API key</Text>
            <Text style={styles.stepDesc}>
              Set the <Text style={styles.mono}>VOKER_API_KEY</Text> environment variable from Settings → API Keys.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Wrap your LLM client</Text>
            <CodeBlock code={CODE[lang].usage} />
          </View>
        </View>
      </View>

      <View style={styles.providers}>
        <Text style={styles.providersTitle}>Supported Providers</Text>
        {['OpenAI', 'Anthropic', 'Google Gemini', 'AI SDK (Vercel)'].map((p) => (
          <View key={p} style={styles.providerRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.providerText}>{p}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { padding: 24, gap: 24 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: '#888', fontSize: 14 },
  pageTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  desc: { color: '#666', fontSize: 14 },
  tabs: { flexDirection: 'row', backgroundColor: '#151515', borderRadius: 10, padding: 4, alignSelf: 'flex-start' },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  tabActive: { backgroundColor: '#222' },
  tabText: { color: '#555', fontSize: 14 },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  steps: { gap: 20 },
  step: { flexDirection: 'row', gap: 16 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1a1230', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  stepNumText: { color: '#a78bfa', fontWeight: '700', fontSize: 13 },
  stepContent: { flex: 1, gap: 10 },
  stepTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stepDesc: { color: '#888', fontSize: 14, lineHeight: 22 },
  mono: { fontFamily: 'monospace', color: '#a78bfa' },
  codeWrap: { backgroundColor: '#0d0d0d', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#1e1e1e' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginBottom: 8 },
  copyText: { color: '#666', fontSize: 12 },
  code: { color: '#e2e8f0', fontSize: 13, fontFamily: 'monospace', lineHeight: 22 },
  providers: { backgroundColor: '#111', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#1e1e1e', gap: 12 },
  providersTitle: { color: '#aaa', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  providerText: { color: '#ccc', fontSize: 14 },
});
