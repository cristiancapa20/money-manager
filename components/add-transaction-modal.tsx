import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Re-exportar Transaction para compatibilidad con otros componentes
export type { Transaction };
export type TransactionType = 'INCOME' | 'EXPENSE';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt' | 'userId' | 'deletedAt'>) => void;
  accountId: string | null;
  editingTransaction?: Transaction | null;
}

export function AddTransactionModal({
  visible,
  onClose,
  onSave,
  accountId,
  editingTransaction,
}: AddTransactionModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { categories, getAccountBalance } = useApp();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategoryId(editingTransaction.categoryId);
    } else {
      resetForm();
    }
  }, [editingTransaction, visible]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('EXPENSE');
    setCategoryId(null);
    setBalanceError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!amount.trim() || categoryId === null || !accountId) return;

    const parsedAmount = parseFloat(amount) || 0;
    const targetAccountId = editingTransaction?.accountId ?? accountId;

    if (type === 'EXPENSE') {
      const balance = getAccountBalance(targetAccountId);
      const available = editingTransaction?.type === 'EXPENSE'
        ? balance + editingTransaction.amount
        : balance;
      if (parsedAmount > available) {
        setBalanceError(`Saldo insuficiente. Balance disponible: $${available.toFixed(2)}`);
        return;
      }
    }
    setBalanceError('');

    const now = new Date().toISOString();
    const tx: Omit<Transaction, 'id' | 'createdAt' | 'userId' | 'deletedAt'> = {
      amount: parsedAmount,
      type,
      categoryId,
      accountId: targetAccountId,
      description: description.trim(),
      date: editingTransaction?.date ?? now,
    };

    onSave(tx);
    resetForm();
  };

  const isValid = amount.trim() && categoryId !== null && accountId;

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ThemedView style={styles.sheet}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title">
              {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
            </ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Tipo */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    {
                      borderColor: type === 'INCOME' ? theme.income : theme.border,
                      backgroundColor: type === 'INCOME' ? theme.income : theme.card,
                    },
                  ]}
                  onPress={() => { setType('INCOME'); setBalanceError(''); }}>
                  <Ionicons name="arrow-up" size={18} color={type === 'INCOME' ? '#fff' : theme.income} />
                  <Text style={[styles.typeBtnText, { color: type === 'INCOME' ? '#fff' : theme.textSecondary }]}>
                    Ingreso
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    {
                      borderColor: type === 'EXPENSE' ? theme.expense : theme.border,
                      backgroundColor: type === 'EXPENSE' ? theme.expense : theme.card,
                    },
                  ]}
                  onPress={() => setType('EXPENSE')}>
                  <Ionicons name="arrow-down" size={18} color={type === 'EXPENSE' ? '#fff' : theme.expense} />
                  <Text style={[styles.typeBtnText, { color: type === 'EXPENSE' ? '#fff' : theme.textSecondary }]}>
                    Gasto
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Monto */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Monto</Text>
              <TextInput
                style={inputStyle}
                value={amount}
                onChangeText={(v) => { setAmount(v); setBalanceError(''); }}
                placeholder="0.00"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
              />
              {balanceError ? <Text style={styles.errorText}>{balanceError}</Text> : null}
            </View>

            {/* Descripción */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Descripción</Text>
              <TextInput
                style={[inputStyle, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descripción opcional…"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Categoría */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Categoría</Text>
              <View style={styles.catGrid}>
                {categories.map((cat) => {
                  const selected = categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catBtn,
                        {
                          backgroundColor: selected ? theme.card : theme.divider,
                          borderColor: selected ? cat.color : 'transparent',
                        },
                      ]}
                      onPress={() => setCategoryId(cat.id)}>
                      <View
                        style={[
                          styles.catIcon,
                          { backgroundColor: `${cat.color}${selected ? '30' : '18'}` },
                        ]}>
                        <Text style={styles.catEmoji}>{cat.icon}</Text>
                      </View>
                      <Text
                        style={[
                          styles.catText,
                          { color: scheme === 'dark' ? '#FFFFFF' : '#000000', fontWeight: selected ? '700' : '600' },
                        ]}
                        numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.divider }]}
              onPress={handleClose}>
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.saveBtn, { backgroundColor: isValid ? theme.tint : theme.border, opacity: isValid ? 1 : 0.6 }]}
              onPress={handleSave}
              disabled={!isValid}>
              <Text style={styles.saveText}>
                {editingTransaction ? 'Actualizar' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  closeBtn: { padding: 4 },
  form: { padding: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, gap: 6 },
  typeBtnText: { fontSize: 15, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  textArea: { height: 72, textAlignVertical: 'top' },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 6 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  catBtn: { width: '30%', minWidth: 88, alignItems: 'center', padding: 10, borderRadius: 14, borderWidth: 1.5 },
  catIcon: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  catEmoji: { fontSize: 22, lineHeight: 28 },
  catText: { fontSize: 11, textAlign: 'center' },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtn: {},
  cancelText: { fontSize: 15, fontWeight: '600' },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
