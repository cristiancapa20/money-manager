import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { categoryMap } from '@/utils/categories';
import { useApp } from '@/contexts/app-context';
import { useRouter } from 'expo-router';
import type { Transaction } from './add-transaction-modal';

interface AddTransactionFormProps {
  onSave?: () => void;
  editingTransaction?: Transaction | null;
  cardId?: string | null;
}

const categories = Object.values(categoryMap);

export function AddTransactionForm({ onSave, editingTransaction, cardId: propCardId }: AddTransactionFormProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const router = useRouter();
  const { selectedCardId, addTransaction, updateTransaction } = useApp();
  const cardId = propCardId || selectedCardId;

  const [title, setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount]     = useState('');
  const [type, setType]         = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');

  const handleReset = useCallback(() => {
    setTitle(''); setDescription(''); setAmount(''); setType('expense'); setCategory('');
  }, []);

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
    } else {
      handleReset();
    }
  }, [editingTransaction, handleReset]);

  const handleSave = () => {
    if (!title.trim() || !amount.trim() || !category || !cardId) return;

    const transaction: Transaction = {
      id:          editingTransaction?.id,
      title:       title.trim(),
      description: description.trim(),
      amount:      parseFloat(amount) || 0,
      type,
      category,
      cardId:      cardId || '',
    };

    if (transaction.id) updateTransaction(transaction);
    else addTransaction(transaction);

    handleReset();
    if (onSave) onSave();
    router.back();
  };

  const isValid = title.trim() && amount.trim() && category && cardId;

  // ── Estilos dinámicos ──────────────────────────────────────────────────────
  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.input,
      borderColor: theme.inputBorder,
      color: theme.text,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.form}>

        {/* Tipo */}
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Tipo</ThemedText>
          <View style={styles.typeContainer}>
            {/* Ingreso */}
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  borderColor: type === 'income' ? theme.income : theme.border,
                  backgroundColor:
                    type === 'income' ? theme.income : theme.card,
                },
              ]}
              onPress={() => setType('income')}
            >
              <Ionicons name="arrow-up" size={18} color={type === 'income' ? '#fff' : theme.income} />
              <Text style={[styles.typeButtonText, { color: type === 'income' ? '#fff' : theme.textSecondary }]}>
                Ingreso
              </Text>
            </TouchableOpacity>

            {/* Gasto */}
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  borderColor: type === 'expense' ? theme.expense : theme.border,
                  backgroundColor:
                    type === 'expense' ? theme.expense : theme.card,
                },
              ]}
              onPress={() => setType('expense')}
            >
              <Ionicons name="arrow-down" size={18} color={type === 'expense' ? '#fff' : theme.expense} />
              <Text style={[styles.typeButtonText, { color: type === 'expense' ? '#fff' : theme.textSecondary }]}>
                Gasto
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Título */}
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Título</ThemedText>
          <TextInput
            style={inputStyle}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Compra de supermercado"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Descripción</ThemedText>
          <TextInput
            style={[inputStyle, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción opcional..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Cantidad */}
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Cantidad</ThemedText>
          <TextInput
            style={inputStyle}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={theme.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Categoría */}
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Categoría</ThemedText>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: isSelected ? theme.card : theme.divider,
                      borderColor: isSelected ? cat.color : 'transparent',
                    },
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: `${cat.color}${isSelected ? '30' : '18'}` },
                    ]}
                  >
                    <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: cat.color, fontWeight: isSelected ? '700' : '600' },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.divider }]}
          onPress={() => { if (onSave) onSave(); router.back(); }}
        >
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            {
              backgroundColor: isValid ? theme.tint : theme.border,
              opacity: isValid ? 1 : 0.6,
            },
          ]}
          onPress={handleSave}
          disabled={!isValid}
        >
          <Text style={styles.saveText}>
            {editingTransaction ? 'Actualizar' : 'Guardar'}
          </Text>
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

  // Tipo
  typeContainer: { flexDirection: 'row', gap: 10 },
  typeButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 14,
    borderRadius: 12, borderWidth: 1.5, gap: 6,
  },
  typeButtonText: { fontSize: 15, fontWeight: '600' },

  // Inputs
  input: {
    borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15,
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  // Categorías
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  categoryButton: {
    width: '30%', minWidth: 88,
    alignItems: 'center', padding: 10,
    borderRadius: 14, borderWidth: 1.5,
  },
  categoryIconContainer: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  categoryButtonText: { fontSize: 11, textAlign: 'center' },

  // Footer
  footer: {
    flexDirection: 'row', gap: 10,
    padding: 16, borderTopWidth: 1,
  },
  button: {
    flex: 1, padding: 15,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  saveButton: {},
  cancelText: { fontSize: 15, fontWeight: '600' },
  saveText:   { fontSize: 15, fontWeight: '600', color: '#fff' },
});
