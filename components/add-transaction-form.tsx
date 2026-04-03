import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AddTransactionFormProps {
  onSave?: () => void;
  editingTransaction?: Transaction | null;
}

export function AddTransactionForm({ onSave, editingTransaction }: AddTransactionFormProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const router = useRouter();
  const { selectedCardId, categories, addTransaction, updateTransaction, getAccountBalance } = useApp();

  const [description, setDescription] = useState('');
  const [amount, setAmount]           = useState('');
  const [type, setType]               = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [categoryId, setCategoryId]   = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState('');

  const handleReset = useCallback(() => {
    setDescription('');
    setAmount('');
    setType('EXPENSE');
    setCategoryId(null);
    setBalanceError('');
  }, []);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategoryId(editingTransaction.categoryId);
    } else {
      handleReset();
    }
  }, [editingTransaction, handleReset]);

  const handleSave = async () => {
    if (!amount.trim() || categoryId === null || !selectedCardId) return;

    const parsedAmount = parseFloat(amount) || 0;
    const accountId = editingTransaction?.accountId ?? selectedCardId;

    if (type === 'EXPENSE') {
      const balance = getAccountBalance(accountId);
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
    const base = {
      amount:      parsedAmount,
      type,
      categoryId,
      accountId,
      description: description.trim(),
      date:        editingTransaction?.date ?? now,
    };

    try {
      if (editingTransaction?.id) {
        await updateTransaction({ ...editingTransaction, ...base });
      } else {
        await addTransaction(base);
      }
      handleReset();
      if (onSave) onSave();
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo guardar la transacción');
    }
  };

  const isValid = amount.trim() && categoryId !== null && selectedCardId;

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {/* Tipo */}
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Tipo</ThemedText>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, { borderColor: type === 'INCOME' ? theme.income : theme.border, backgroundColor: type === 'INCOME' ? theme.income : theme.card }]}
              onPress={() => { setType('INCOME'); setBalanceError(''); }}>
              <Ionicons name="arrow-up" size={18} color={type === 'INCOME' ? '#fff' : theme.income} />
              <Text style={[styles.typeButtonText, { color: type === 'INCOME' ? '#fff' : theme.textSecondary }]}>Ingreso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, { borderColor: type === 'EXPENSE' ? theme.expense : theme.border, backgroundColor: type === 'EXPENSE' ? theme.expense : theme.card }]}
              onPress={() => setType('EXPENSE')}>
              <Ionicons name="arrow-down" size={18} color={type === 'EXPENSE' ? '#fff' : theme.expense} />
              <Text style={[styles.typeButtonText, { color: type === 'EXPENSE' ? '#fff' : theme.textSecondary }]}>Gasto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monto */}
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Monto</ThemedText>
          <TextInput style={inputStyle} value={amount} onChangeText={(v) => { setAmount(v); setBalanceError(''); }} placeholder="0.00" placeholderTextColor={theme.textMuted} keyboardType="decimal-pad" />
          {balanceError ? <Text style={styles.errorText}>{balanceError}</Text> : null}
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Descripción</ThemedText>
          <TextInput style={[inputStyle, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Descripción opcional..." placeholderTextColor={theme.textMuted} multiline numberOfLines={3} />
        </View>

        {/* Categoría */}
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Categoría</ThemedText>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryButton, { backgroundColor: isSelected ? theme.card : theme.divider, borderColor: isSelected ? cat.color : 'transparent' }]}
                  onPress={() => setCategoryId(cat.id)}>
                  <View style={[styles.categoryIconContainer, { backgroundColor: `${cat.color}${isSelected ? '30' : '18'}` }]}>
                    <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <Text style={[styles.categoryButtonText, { color: cat.color, fontWeight: isSelected ? '700' : '600' }]} numberOfLines={1}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.divider }]} onPress={() => { if (onSave) onSave(); router.back(); }}>
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: isValid ? theme.tint : theme.border, opacity: isValid ? 1 : 0.6 }]} onPress={handleSave} disabled={!isValid}>
          <Text style={styles.saveText}>{editingTransaction ? 'Actualizar' : 'Guardar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  typeContainer: { flexDirection: 'row', gap: 10 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, gap: 6 },
  typeButtonText: { fontSize: 15, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top' },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 6 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  categoryButton: { width: '30%', minWidth: 88, alignItems: 'center', padding: 10, borderRadius: 14, borderWidth: 1.5 },
  categoryIconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  categoryButtonText: { fontSize: 11, textAlign: 'center' },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  button: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveButton: {},
  cancelText: { fontSize: 15, fontWeight: '600' },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
