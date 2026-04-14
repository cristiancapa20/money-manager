import { AddLoanModal } from '@/components/add-loan-modal';
import { LoanDetailModal } from '@/components/loan-detail-modal';
import { SuccessOverlay } from '@/components/success-overlay';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import type { Loan, LoanType } from '@/types/loan';
import { LOAN_TYPE_LABELS, LOAN_TYPE_ICONS, LOAN_STATUS_LABELS } from '@/types/loan';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterType = 'ALL' | 'LENT' | 'OWED';
type StatusFilter = 'ALL' | 'ACTIVE' | 'PAID';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function AnimatedProgressBar({ percent, color, gradientEnd }: { percent: number; color: string; gradientEnd: string }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(200, withTiming(percent, { duration: 600 }));
  }, [percent]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.track}>
        <Animated.View style={[progressStyles.fill, barStyle]}>
          <LinearGradient
            colors={[color, gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <Text style={[progressStyles.label, { color }]}>
        {Math.round(percent)}%
      </Text>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(128,128,128,0.15)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
});

export default function LoansScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { loans, cards, addLoan, updateLoan, deleteLoan, refreshLoans, isLoading } = useApp();
  const { formatCurrency } = useCurrency();

  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [detailLoan, setDetailLoan] = useState<Loan | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredLoans = useMemo(() => {
    let result = loans;
    if (filterType !== 'ALL') result = result.filter((l) => l.type === filterType);
    if (statusFilter !== 'ALL') result = result.filter((l) => l.status === statusFilter);
    return result;
  }, [loans, filterType, statusFilter]);

  const summary = useMemo(() => {
    const activeLent = loans.filter((l) => l.type === 'LENT' && l.status === 'ACTIVE');
    const activeOwed = loans.filter((l) => l.type === 'OWED' && l.status === 'ACTIVE');
    const totalLent = activeLent.reduce((s, l) => s + (l.amount - (l.totalPaid ?? 0)), 0);
    const totalOwed = activeOwed.reduce((s, l) => s + (l.amount - (l.totalPaid ?? 0)), 0);
    return { totalLent, totalOwed, net: totalLent - totalOwed };
  }, [loans]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLoans();
    setRefreshing(false);
  };

  const handleSave = async (data: Parameters<typeof addLoan>[0]) => {
    try {
      if (editingLoan) {
        await updateLoan({
          id: editingLoan.id,
          contactName: data.contactName,
          amount: data.amount,
          description: data.description,
          dueDate: data.dueDate,
          reminderDays: data.reminderDays,
          status: data.status,
        });
      } else {
        await addLoan(data);
      }
      setModalVisible(false);
      setEditingLoan(null);
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setModalVisible(true);
  };

  const handleDetail = (loan: Loan) => {
    setDetailLoan(loan);
    setDetailVisible(true);
  };

  const handleDelete = (loan: Loan) => {
    Alert.alert(
      'Eliminar Préstamo',
      `¿Eliminar el préstamo de ${loan.contactName} por ${formatCurrency(loan.amount)}? Se eliminarán también los pagos asociados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLoan(loan.id);
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
    );
  };

  const loanCounts = useMemo(() => {
    const byType = { ALL: loans.length, LENT: 0, OWED: 0 };
    const byStatus = { ALL: 0, ACTIVE: 0, PAID: 0 };
    for (const l of loans) {
      byType[l.type]++;
    }
    // Status counts respect current type filter
    const typeFiltered = filterType === 'ALL' ? loans : loans.filter((l) => l.type === filterType);
    byStatus.ALL = typeFiltered.length;
    for (const l of typeFiltered) {
      byStatus[l.status]++;
    }
    return { byType, byStatus };
  }, [loans, filterType]);

  const filters: { label: string; value: FilterType; icon: string }[] = [
    { label: 'Todos', value: 'ALL', icon: 'list-outline' },
    { label: 'Prestados', value: 'LENT', icon: 'arrow-up-circle-outline' },
    { label: 'Deudas', value: 'OWED', icon: 'arrow-down-circle-outline' },
  ];

  const statusFilters: { label: string; value: StatusFilter; icon: string }[] = [
    { label: 'Todos', value: 'ALL', icon: 'albums-outline' },
    { label: 'Activos', value: 'ACTIVE', icon: 'time-outline' },
    { label: 'Pagados', value: 'PAID', icon: 'checkmark-circle-outline' },
  ];

  const renderLoanItem = ({ item }: { item: Loan }) => {
    const balance = item.amount - (item.totalPaid ?? 0);
    const isLent = item.type === 'LENT';
    const isPaid = item.status === 'PAID';
    const color = isLent ? theme.income : theme.expense;
    const bgColor = isLent ? theme.incomeBg : theme.expenseBg;
    const dueDate = item.dueDate ? new Date(item.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && !isPaid;

    return (
      <TouchableOpacity
        style={[styles.loanCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => handleDetail(item)}
        activeOpacity={0.7}>
        <View style={styles.loanHeader}>
          <View style={[styles.typeBadge, { backgroundColor: bgColor }]}>
            <Ionicons name={LOAN_TYPE_ICONS[item.type] as any} size={18} color={color} />
          </View>
          <View style={styles.loanInfo}>
            <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
              {item.contactName}
            </Text>
            <Text style={[styles.loanDesc, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.description || LOAN_TYPE_LABELS[item.type]}
            </Text>
          </View>
          <View style={styles.loanAmounts}>
            <Text style={[styles.loanAmount, { color }]}>
              {isLent ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
            {balance > 0 && !isPaid && (
              <Text style={[styles.loanBalance, { color: theme.textSecondary }]}>
                Pendiente: {formatCurrency(balance)}
              </Text>
            )}
          </View>
        </View>

        {(item.totalPaid ?? 0) > 0 && (
          <AnimatedProgressBar
            percent={Math.min(((item.totalPaid ?? 0) / item.amount) * 100, 100)}
            color={color}
            gradientEnd={isLent ? '#34d399' : '#f87171'}
          />
        )}

        <View style={styles.loanFooter}>
          <View style={styles.loanTags}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: isPaid ? theme.incomeBg : (isOverdue ? theme.expenseBg : theme.tintLight) },
            ]}>
              <Text style={[
                styles.statusText,
                { color: isPaid ? theme.income : (isOverdue ? theme.expense : theme.tint) },
              ]}>
                {isPaid ? 'Pagado' : (isOverdue ? 'Vencido' : 'Activo')}
              </Text>
            </View>
            {item.accountName && (
              <Text style={[styles.accountLabel, { color: theme.textMuted }]}>
                {item.accountName}
              </Text>
            )}
          </View>

          <View style={styles.loanActions}>
            {item.reminderDays != null && dueDate && !isPaid && (
              <View style={styles.reminderBadge}>
                <Ionicons name="notifications-outline" size={12} color={theme.textMuted} />
                <Text style={[styles.reminderText, { color: theme.textMuted }]}>
                  {item.reminderDays}d
                </Text>
              </View>
            )}
            {dueDate && (
              <Text style={[styles.dueDateText, { color: isOverdue ? theme.expense : theme.textMuted }]}>
                {dueDate.toLocaleDateString()}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.tintLight }]}
              onPress={() => handleEdit(item)}
              hitSlop={8}
              activeOpacity={0.7}>
              <Ionicons name="pencil-outline" size={16} color={theme.tint} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.expenseBg }]}
              onPress={() => handleDelete(item)}
              hitSlop={8}
              activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={16} color={theme.expense} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <LottieView
          source={require('@/assets/animations/loading.json')}
          autoPlay
          loop
          style={styles.lottieLoading}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <ThemedText type="title">Préstamos</ThemedText>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.tint }]}
          onPress={() => { setEditingLoan(null); setModalVisible(true); }}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: theme.incomeBg }]}>
          <Ionicons name="arrow-up-circle-outline" size={20} color={theme.income} />
          <Text style={[styles.summaryLabel, { color: theme.income }]}>Prestado</Text>
          <Text style={[styles.summaryAmount, { color: theme.income }]}>
            {formatCurrency(summary.totalLent)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.expenseBg }]}>
          <Ionicons name="arrow-down-circle-outline" size={20} color={theme.expense} />
          <Text style={[styles.summaryLabel, { color: theme.expense }]}>Deuda</Text>
          <Text style={[styles.summaryAmount, { color: theme.expense }]}>
            {formatCurrency(summary.totalOwed)}
          </Text>
        </View>
      </View>

      {/* Type Filter — Segmented Control */}
      <View style={[styles.segmentedContainer, { paddingHorizontal: 20 }]}>
        <View style={[styles.segmentedControl, { backgroundColor: theme.divider }]}>
          {filters.map((f) => {
            const active = filterType === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.segmentedButton,
                  active && { backgroundColor: theme.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
                ]}
                onPress={() => setFilterType(f.value)}>
                <Ionicons
                  name={f.icon as any}
                  size={15}
                  color={active ? theme.tint : theme.textSecondary}
                />
                <Text style={[
                  styles.segmentedText,
                  { color: active ? theme.text : theme.text },
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
                    { color: active ? theme.tint : theme.textSecondary },
                  ]}>
                    {loanCounts.byType[f.value]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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
                  color={active ? theme.tint : theme.textSecondary}
                />
                <Text style={[
                  styles.segmentedText,
                  { color: active ? theme.text : theme.text },
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
                    { color: active ? theme.tint : theme.textSecondary },
                  ]}>
                    {loanCounts.byStatus[f.value]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => item.id}
        renderItem={(info) => (
          <Animated.View entering={FadeInDown.delay(info.index * 50).duration(300).springify()}>
            {renderLoanItem(info)}
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.tint} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LottieView
              source={require('@/assets/animations/wallet-empty.json')}
              autoPlay
              loop
              style={styles.lottieEmpty}
            />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No hay préstamos registrados
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
              Toca + para agregar uno
            </Text>
          </View>
        }
      />

      <AddLoanModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingLoan(null); }}
        onSave={handleSave}
        editingLoan={editingLoan}
        cards={cards}
      />

      <LoanDetailModal
        visible={detailVisible}
        onClose={() => { setDetailVisible(false); setDetailLoan(null); }}
        loan={detailLoan}
        cards={cards}
      />

      <SuccessOverlay visible={showSuccess} onFinish={() => setShowSuccess(false)} />
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
    borderRadius: 12,
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
  loanCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  loanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  typeBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loanInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600' },
  loanDesc: { fontSize: 13, marginTop: 2 },
  loanAmounts: { alignItems: 'flex-end' },
  loanAmount: { fontSize: 16, fontWeight: '700' },
  loanBalance: { fontSize: 11, marginTop: 2 },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  accountLabel: { fontSize: 11 },
  loanActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  reminderBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reminderText: { fontSize: 10, fontWeight: '500' },
  dueDateText: { fontSize: 11 },
  lottieLoading: { width: 120, height: 120 },
  lottieEmpty: { width: 150, height: 150 },
  emptyState: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptySubtext: { fontSize: 13 },
});
