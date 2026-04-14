import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNetwork } from '@/contexts/network-context';
import { subscribeQueue, getQueueSize } from '@/database/sync-queue';

/**
 * Banner que se muestra cuando la app esta offline o sincronizando
 * operaciones pendientes al recuperar la conexion.
 */
export function OfflineBanner() {
  const { isOnline } = useNetwork();
  const insets = useSafeAreaInsets();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    getQueueSize().then(setPending).catch(() => {});
    const unsub = subscribeQueue(setPending);
    return unsub;
  }, []);

  if (isOnline && pending === 0) return null;

  const syncing = isOnline && pending > 0;
  const bg = syncing ? '#f59e0b' : '#ef4444';
  const icon = syncing ? 'sync' : 'cloud-offline';
  const label = syncing
    ? `Sincronizando ${pending} cambio${pending === 1 ? '' : 's'}...`
    : pending > 0
      ? `Sin conexion (${pending} pendiente${pending === 1 ? '' : 's'})`
      : 'Sin conexion';

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      pointerEvents="none"
      style={[styles.container, { backgroundColor: bg, paddingTop: insets.top + 6 }]}
    >
      <View style={styles.row}>
        <Ionicons name={icon} size={14} color="#fff" />
        <Text style={styles.text}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingBottom: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
