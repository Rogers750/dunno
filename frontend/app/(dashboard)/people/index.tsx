import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api, Person } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { C, R, FONT } from '../../../lib/design';

function PersonRow({ item, onPress }: { item: Person; onPress: () => void }) {
  const props = item.properties as Record<string, string>;
  const displayName = props?.name || props?.email || item.person_id;
  const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{displayName}</Text>
        {props?.email && props.email !== item.person_id && (
          <Text style={styles.email}>{props.email}</Text>
        )}
        <Text style={styles.date}>First seen {date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={C.outlineVariant} />
    </TouchableOpacity>
  );
}

export default function PeopleScreen() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['people'],
    queryFn: api.listPeople,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>People</Text>
        <Text style={styles.count}>{data?.length ?? 0} users</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={C.secondary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <PersonRow item={item} onPress={() => router.push(`/(dashboard)/people/${item.person_id}` as any)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No people tracked yet</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surface, padding: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle: { color: C.onSurface, fontSize: 26, fontWeight: '600', fontFamily: FONT },
  count: { color: C.primary, fontSize: 13, fontFamily: FONT },
  list: { gap: 0 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surfaceLowest, padding: 16, borderRadius: R.xl,
    boxShadow: '0 1px 8px rgba(45,52,53,0.04)',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: C.secondary, fontSize: 16, fontWeight: '700', fontFamily: FONT },
  info: { flex: 1, gap: 2 },
  name: { color: C.onSurface, fontSize: 15, fontWeight: '600', fontFamily: FONT },
  email: { color: C.primary, fontSize: 13, fontFamily: FONT },
  date: { color: C.primary, fontSize: 11, opacity: 0.6, fontFamily: FONT },
  sep: { height: 8 },
  empty: { color: C.primary, textAlign: 'center', marginTop: 60, fontSize: 14, fontFamily: FONT },
});
