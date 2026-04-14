import { AddPaymentModal } from '@/components/add-payment-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import type { Card } from '@/types/card';
import type { Loan, LoanPayment } from '@/types/loan';
import { LOAN_TYPE_LABELS } from '@/types/loan';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LoanDetailModalProps {
  visible: boolean;
  onClose: () => void;
  loan: Loan | null;
  cards: Card[];
}

export function LoanDetailModal({ visible, onClose, loan, cards }: LoanDetailModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { getLoanPayments, addLoanPayment, updateLoanPayment, deleteLoanPayment, loans } = useApp();
  const { formatCurrency } = useCurrency();

  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<LoanPayment | null>(null);

  // Keep loan data fresh from context
  const currentLoan = loan ? loans.find((l) => l.id === loan.id) ?? loan : null;

  const loadPayments = useCallback(async () => {
    if (!currentLoan) return;
    setLoading(true);
    try {
      const data = await getLoanPayments(currentLoan.id);
      setPayments(data);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  }, [currentLoan?.id, getLoanPayments]);

  useEffect(() => {
    if (visible && currentLoan) {
      loadPayments();
    }
  }, [visible, currentLoan?.id]);

  if (!currentLoan) return null;

  const balance = currentLoan.amount - (currentLoan.totalPaid ?? 0);
  const progress = currentLoan.amount > 0 ? ((currentLoan.totalPaid ?? 0) / currentLoan.amount) : 0;
  const isLent = currentLoan.type === 'LENT';
  const color = isLent ? theme.income : theme.expense;
  const bgColor = isLent ? theme.incomeBg : theme.expenseBg;
  const isPaid = currentLoan.status === 'PAID';

  const handleAddPayment = () => {
    setEditingPayment(null);
    setPaymentModalVisible(true);
  };

  const handleEditPayment = (payment: LoanPayment) => {
    setEditingPayment(payment);
    setPaymentModalVisible(true);
  };

  const handleDeletePayment = (payment: LoanPayment) => {
    Alert.alert(
      'Eliminar Pago',
      `¿Eliminar el pago de ${formatCurrency(payment.amount)}? La transacción de balance asociada también se eliminará.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLoanPayment(payment.id, currentLoan, payment.amount);
              await loadPayments();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
    );
  };

  const handleSavePayment = async (data: { accountId: string; amount: number; date: string; note: string }) => {
    try {
      if (editingPayment) {
        await updateLoanPayment(
          { id: editingPayment.id, ...data },
          currentLoan,
          editingPayment.amount,
        );
      } else {
        await addLoanPayment(
          { loanId: currentLoan.id, ...data },
          currentLoan,
        );
      }
      setPaymentModalVisible(false);
      setEditingPayment(null);
      await loadPayments();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const renderPaymentItem = ({ item }: { item: LoanPayment }) => (
    <TouchableOpacity
      style={[styles.paymentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => handleEditPayment(item)}
      activeOpacity={0.7}>
      <View style={styles.paymentLeft}>
        <View style={[styles.paymentIcon, { backgroundColor: bgColor }]}>
          <Ionicons name="checkmark-circle-outline" size={18} color={color} />
        </View>
        <View>
          <Text style={[styles.paymentAmount, { color }]}>
            {formatCurrency(item.amount)}
          </Text>
          <Text style={[styles.paymentDate, { color: theme.textSecondary }]}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
          {item.note ? (
            <Text style={[styles.paymentNote, { color: theme.textMuted }]} numberOfLines={1}>
              {item.note}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.paymentActions}>
        {item.accountName && (
          <Text style={[styles.paymentAccount, { color: theme.textMuted }]}>
            {item.accountName}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: theme.expenseBg }]}
          onPress={() => handleDeletePayment(item)}
          hitSlop={8}
          activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={16} color={theme.expense} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ThemedView style={styles.sheet}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title">Detalle del Préstamo</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Loan Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={[styles.contactName, { color: theme.text }]}>{currentLoan.contactName}</Text>
                <Text style={[styles.loanType, { color: theme.textSecondary }]}>
                  {LOAN_TYPE_LABELS[currentLoan.type]} {currentLoan.accountName ? `· ${currentLoan.accountName}` : ''}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isPaid ? theme.incomeBg : bgColor }]}>
                <Text style={[styles.statusText, { color: isPaid ? theme.income : color }]}>
                  {isPaid ? 'Pagado' : 'Activo'}
                </Text>
              </View>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                  Pagado: {formatCurrency(currentLoan.totalPaid ?? 0)}
                </Text>
                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                  Total: {formatCurrency(currentLoan.amount)}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.divider }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={[styles.pendingText, { color }]}>
                {balance > 0 ? `Pendiente: ${formatCurrency(balance)}` : 'Completamente pagado'}
              </Text>
            </View>
          </View>

          {/* Payments Header */}
          <View style={[styles.paymentsHeader, { borderTopColor: theme.border }]}>
            <Text style={[styles.paymentsTitle, { color: theme.text }]}>Pagos</Text>
            {!isPaid && (
              <TouchableOpacity
                style={[styles.addPaymentBtn, { backgroundColor: theme.tint }]}
                onPress={handleAddPayment}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addPaymentText}>Agregar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Payments List */}
          {loading ? (
            <ActivityIndicator size="small" color={theme.tint} style={styles.loader} />
          ) : (
            <FlatList
              data={payments}
              keyExtractor={(item) => item.id}
              renderItem={renderPaymentItem}
              contentContainerStyle={styles.paymentsList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={36} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    No hay pagos registrados
                  </Text>
                </View>
              }
            />
          )}
        </ThemedView>
      </View>

      <AddPaymentModal
        visible={paymentModalVisible}
        onClose={() => { setPaymentModalVisible(false); setEditingPayment(null); }}
        onSave={handleSavePayment}
        editingPayment={editingPayment}
        cards={cards}
        maxAmount={balance > 0 ? balance : undefined}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  closeBtn: { padding: 4 },

  // Summary
  summary: { padding: 20, gap: 16 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  contactName: { fontSize: 20, fontWeight: '700' },
  loanType: { fontSize: 13, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600' },

  // Progress
  progressSection: { gap: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  pendingText: { fontSize: 13, fontWeight: '600' },

  // Payments
  paymentsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  paymentsTitle: { fontSize: 16, fontWeight: '700' },
  addPaymentBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  addPaymentText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  paymentsList: { paddingHorizontal: 20, paddingBottom: 20 },
  paymentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  paymentIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  paymentAmount: { fontSize: 15, fontWeight: '700' },
  paymentDate: { fontSize: 12, marginTop: 1 },
  paymentNote: { fontSize: 11, marginTop: 1 },
  paymentActions: { alignItems: 'flex-end', gap: 6 },
  paymentAccount: { fontSize: 11 },
  deleteBtn: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  loader: { paddingVertical: 40 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14 },
});
