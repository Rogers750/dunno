import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import Sidebar from '../../components/ui/Sidebar';
import { C } from '../../lib/design';

export default function DashboardLayout() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Sidebar />
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.surface } }} />
        </View>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.surface } }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: C.surface },
  content: { flex: 1 },
});
