import { AddSubscriptionModal } from '@/components/add-subscription-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Subscription } from '@/types/subscription';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export default function SubscriptionsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();
  const {
    subscriptions,
    cards,
    categories,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions,
    isLoading,
    subscriptionProcessResult,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredSubs = useMemo(() => {
    if (statusFilter === 'ALL') return subscriptions;
    if (statusFilter === 'ACTIVE') return subscriptions.filter((s) => s.active);
    return subscriptions.filter((s) => !s.active);
  }, [subscriptions, statusFilter]);

  const summary = useMemo(() => {
    const activeSubs = subscriptions.filter((s) => s.active);
    const totalMonthly = activeSubs.reduce((s, sub) => s + sub.amount, 0);
    return { activeCount: activeSubs.length, totalMonthly };
  }, [subscriptions]);

  const counts = useMemo(() => {
    const active = subscriptions.filter((s) => s.active).length;
    return {
      ALL: subscriptions.length,
      ACTIVE: active,
      INACTIVE: subscriptions.length - active,
    };
  }, [subscriptions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSubscriptions();
    setRefreshing(false);
  };

  const handleSave = async (data: {
    name: string;
    amount: number;
    billingDay: number;
    active: boolean;
    accountId: string;
    categoryId: string | null;
  }) => {
    try {
      if (editingSub) {
        await updateSubscription({
          id: editingSub.id,
          name: data.name,
          amount: data.amount,
          billingDay: data.billingDay,
          active: data.active,
          accountId: data.accountId,
          categoryId: data.categoryId,
        });
      } else {
        await addSubscription(data);
      }
      setModalVisible(false);
      setEditingSub(null);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setModalVisible(true);
  };

  const handleDelete = (sub: Subscription) => {
    Alert.alert(
      'Eliminar Suscripción',
      `¿Eliminar "${sub.name}" ($${sub.amount.toFixed(2)}/mes)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubscription(sub.id);
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
    );
  };

  const statusFilters: { label: string; value: StatusFilter; icon: string }[] = [
    { label: 'Todas', value: 'ALL', icon: 'albums-outline' },
    { label: 'Activas', value: 'ACTIVE', icon: 'checkmark-circle-outline' },
    { label: 'Inactivas', value: 'INACTIVE', icon: 'pause-circle-outline' },
  ];

  const renderItem = ({ item }: { item: Subscription }) => {
    const isActive = item.active;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => handleEdit(item)}
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBadge, { backgroundColor: isActive ? theme.tintLight : theme.divider }]}>
            {item.categoryIcon ? (
              <Ionicons name={item.categoryIcon as any} size={18} color={isActive ? theme.tint : theme.textMuted} />
            ) : (
              <Ionicons name="repeat-outline" size={18} color={isActive ? theme.tint : theme.textMuted} />
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>
              Día {item.billingDay} de cada mes
            </Text>
          </View>
          <View style={styles.cardAmounts}>
            <Text style={[styles.cardAmount, { color: theme.expense }]}>
              ${item.amount.toFixed(2)}
            </Text>
            <Text style={[styles.cardFreq, { color: theme.textMuted }]}>/mes</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardTags}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: isActive ? theme.incomeBg : theme.divider },
            ]}>
              <Text style={[
                styles.statusText,
                { color: isActive ? theme.income : theme.textMuted },
              ]}>
                {isActive ? 'Activa' : 'Inactiva'}
              </Text>
            </View>
            {item.accountName && (
              <Text style={[styles.accountLabel, { color: theme.textMuted }]}>
                {item.accountName}
              </Text>
            )}
            {item.categoryName && (
              <View style={styles.categoryTag}>
                <View style={[styles.categoryDot, { backgroundColor: item.categoryColor ?? theme.textMuted }]} />
                <Text style={[styles.categoryLabel, { color: theme.textMuted }]}>
                  {item.categoryName}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => handleEdit(item)} hitSlop={8}>
              <Ionicons name="create-outline" size={18} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <ThemedText type="title">Suscripciones</ThemedText>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.tint }]}
          onPress={() => { setEditingSub(null); setModalVisible(true); }}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: theme.tintLight }]}>
          <Ionicons name="repeat-outline" size={20} color={theme.tint} />
          <Text style={[styles.summaryLabel, { color: theme.tint }]}>Activas</Text>
          <Text style={[styles.summaryAmount, { color: theme.tint }]}>
            {summary.activeCount}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.expenseBg }]}>
          <Ionicons name="wallet-outline" size={20} color={theme.expense} />
          <Text style={[styles.summaryLabel, { color: theme.expense }]}>Total Mensual</Text>
          <Text style={[styles.summaryAmount, { color: theme.expense }]}>
            ${summary.totalMonthly.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Último procesamiento */}
      {subscriptionProcessResult && (
        <View style={[styles.processBanner, { backgroundColor: subscriptionProcessResult.created > 0 ? theme.incomeBg : theme.divider }]}>
          <Ionicons
            name={subscriptionProcessResult.created > 0 ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={subscriptionProcessResult.created > 0 ? theme.income : theme.textMuted}
          />
          <View style={styles.processBannerText}>
            <Text style={[styles.processTitle, { color: subscriptionProcessResult.created > 0 ? theme.income : theme.textSecondary }]}>
              {subscriptionProcessResult.created > 0
                ? `${subscriptionProcessResult.created} cobro${subscriptionProcessResult.created > 1 ? 's' : ''} registrado${subscriptionProcessResult.created > 1 ? 's' : ''} hoy`
                : 'Sin cobros pendientes hoy'}
            </Text>
            <Text style={[styles.processSubtitle, { color: theme.textMuted }]}>
              Última verificación: {new Date(subscriptionProcessResult.processedAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      )}

      {/* Status Filter — Segmented Control */}
      <View style={[styles.segmentedContainer, { paddingHorizontal: 20 }]}>
        <View style={[styles.segmentedControl, { backgroundColor: theme.divider }]}>
          {statusFilters.map((f) => {
            const active = statusFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.segmentedButton,
                  active && { backgroundColor: theme.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
                ]}
                onPress={() => setStatusFilter(f.value)}>
                <Ionicons
                  name={f.icon as any}
                  size={15}
                  color={active ? theme.tint : theme.textMuted}
                />
                <Text style={[
                  styles.segmentedText,
                  { color: active ? theme.text : theme.textSecondary },
                  active && { fontWeight: '700' },
                ]}>
                  {f.label}
                </Text>
                <View style={[
                  styles.countBadge,
                  { backgroundColor: active ? theme.tintLight : 'transparent' },
                ]}>
                  <Text style={[
                    styles.countText,
                    { color: active ? theme.tint : theme.textMuted },
                  ]}>
                    {counts[f.value]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredSubs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.tint} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="repeat-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No hay suscripciones registradas
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
              Toca + para agregar una
            </Text>
          </View>
        }
      />

      <AddSubscriptionModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingSub(null); }}
        onSave={handleSave}
        editingSubscription={editingSub}
        cards={cards}
        categories={categories}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    gap: 4,
  },
  summaryLabel: { fontSize: 12, fontWeight: '600' },
  summaryAmount: { fontSize: 18, fontWeight: '700' },
  segmentedContainer: {
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  segmentedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentedText: { fontSize: 13, fontWeight: '600' },
  countBadge: {
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: { fontSize: 11, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 13, marginTop: 2 },
  cardAmounts: { alignItems: 'flex-end' },
  cardAmount: { fontSize: 16, fontWeight: '700' },
  cardFreq: { fontSize: 11, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTags: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  accountLabel: { fontSize: 11 },
  categoryTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryLabel: { fontSize: 11 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  processBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  processBannerText: { flex: 1, gap: 2 },
  processTitle: { fontSize: 13, fontWeight: '600' },
  processSubtitle: { fontSize: 11 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptySubtext: { fontSize: 13 },
});
