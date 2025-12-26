import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

export function AddTransactionForm({
  onSave,
  editingTransaction,
  cardId: propCardId,
}: AddTransactionFormProps) {
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { selectedCardId, addTransaction, updateTransaction } = useApp();
  const cardId = propCardId || selectedCardId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');

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
  }, [editingTransaction]);

  const handleSave = () => {
    if (!title.trim() || !amount.trim() || !category || !cardId) {
      return;
    }

    const transaction: Transaction = {
      id: editingTransaction?.id,
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount) || 0,
      type,
      category,
      cardId: cardId || '',
    };

    if (transaction.id) {
      updateTransaction(transaction);
    } else {
      addTransaction(transaction);
    }

    handleReset();
    if (onSave) {
      onSave();
    }
    router.back();
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {/* Tipo de Transacción */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.label}>
            Tipo
          </ThemedText>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && styles.typeButtonActive,
                type === 'income' && styles.typeButtonIncome,
              ]}
              onPress={() => setType('income')}>
              <Ionicons
                name="arrow-up"
                size={20}
                color={type === 'income' ? '#fff' : '#4ADE80'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'income' && styles.typeButtonTextActive,
                ]}>
                Ingreso
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && styles.typeButtonActive,
                type === 'expense' && styles.typeButtonExpense,
              ]}
              onPress={() => setType('expense')}>
              <Ionicons
                name="arrow-down"
                size={20}
                color={type === 'expense' ? '#fff' : '#F87171'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.typeButtonTextActive,
                ]}>
                Gasto
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Título */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.label}>
            Título
          </ThemedText>
          <TextInput
            style={[styles.input, theme === 'dark' && styles.inputDark]}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Compra de supermercado"
            placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          />
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.label}>
            Descripción
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              theme === 'dark' && styles.inputDark,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción opcional..."
            placeholderTextColor={theme === 'light' ? '#999' : '#666'}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Cantidad */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.label}>
            Cantidad
          </ThemedText>
          <TextInput
            style={[styles.input, theme === 'dark' && styles.inputDark]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={theme === 'light' ? '#999' : '#666'}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Categoría */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.label}>
            Categoría
          </ThemedText>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonActive,
                    theme === 'dark' && styles.categoryButtonDark,
                    isSelected && { borderColor: cat.color },
                  ]}
                  onPress={() => setCategory(cat.name)}>
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: `${cat.color}15` },
                      isSelected && { backgroundColor: `${cat.color}30` },
                    ]}>
                    <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                  </View>
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: cat.color },
                      isSelected && styles.categoryButtonTextSelected,
                    ]}
                    numberOfLines={1}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Botones */}
      <View style={[styles.footer, theme === 'dark' && styles.footerDark]}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, theme === 'dark' && styles.cancelButtonDark]}
          onPress={() => {
            if (onSave) {
              onSave();
            }
            router.back();
          }}>
          <Text style={[styles.cancelButtonText, theme === 'dark' && styles.cancelButtonTextDark]}>
            Cancelar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            (!title.trim() || !amount.trim() || !category || !cardId) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!title.trim() || !amount.trim() || !category || !cardId}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    gap: 8,
  },
  typeButtonActive: {
    borderWidth: 2,
  },
  typeButtonIncome: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  },
  typeButtonExpense: {
    backgroundColor: '#F87171',
    borderColor: '#F87171',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  inputDark: {
    backgroundColor: '#1F1F1F',
    borderColor: '#333',
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  categoryButton: {
    width: '30%',
    minWidth: 90,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonDark: {
    backgroundColor: '#1F1F1F',
  },
  categoryButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryButtonTextSelected: {
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerDark: {
    borderTopColor: '#333',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonDark: {
    backgroundColor: '#1F1F1F',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cancelButtonTextDark: {
    color: '#E5E5E5',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

