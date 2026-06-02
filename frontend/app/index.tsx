import { Redirect } from 'expo-router';
import { useAppStore } from '../lib/store';

export default function Index() {
  const apiKey = useAppStore((s) => s.apiKey);
  return <Redirect href={apiKey ? '/(dashboard)' : '/(auth)/login'} />;
}
