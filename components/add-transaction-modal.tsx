import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { categoryMap } from '@/utils/categories';
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

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  cardId: string;
  createdAt?: string;
}

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  cardId: string | null;
  editingTransaction?: Transaction | null;
}

const categories = Object.values(categoryMap);

export function AddTransactionModal({
  visible,
  onClose,
  onSave,
  cardId,
  editingTransaction,
}: AddTransactionModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
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
  }, [editingTransaction, visible]);

  const handleSave = () => {
    if (!title.trim() || !amount.trim() || !category || !cardId) return;

    const transaction: Transaction = {
      id: editingTransaction?.id,
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount) || 0,
      type,
      category,
      cardId: cardId || editingTransaction?.cardId || '',
    };

    onSave(transaction);
    handleReset();
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isValid = title.trim() && amount.trim() && category && cardId;

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.input,
      borderColor: theme.inputBorder,
      color: theme.text,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText type="title">
              {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
            </ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Tipo */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo</Text>
              <View style={styles.typeContainer}>
                {/* Ingreso */}
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      borderColor: type === 'income' ? theme.income : theme.border,
                      backgroundColor: type === 'income' ? theme.income : theme.card,
                    },
                  ]}
                  onPress={() => setType('income')}>
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color={type === 'income' ? '#fff' : theme.income}
                  />
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
                      backgroundColor: type === 'expense' ? theme.expense : theme.card,
                    },
                  ]}
                  onPress={() => setType('expense')}>
                  <Ionicons
                    name="arrow-down"
                    size={18}
                    color={type === 'expense' ? '#fff' : theme.expense}
                  />
                  <Text style={[styles.typeButtonText, { color: type === 'expense' ? '#fff' : theme.textSecondary }]}>
                    Gasto
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Título */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Título</Text>
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
              <Text style={[styles.label, { color: theme.textSecondary }]}>Descripción</Text>
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
              <Text style={[styles.label, { color: theme.textSecondary }]}>Cantidad</Text>
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
              <Text style={[styles.label, { color: theme.textSecondary }]}>Categoría</Text>
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
                      onPress={() => setCategory(cat.name)}>
                      <View
                        style={[
                          styles.categoryIconContainer,
                          { backgroundColor: `${cat.color}${isSelected ? '30' : '18'}` },
                        ]}>
                        <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                      </View>
                      <Text
                        style={[
                          styles.categoryButtonText,
                          { color: cat.color, fontWeight: isSelected ? '700' : '600' },
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
          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.divider }]}
              onPress={handleClose}>
              <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancelar</Text>
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
              disabled={!isValid}>
              <Text style={styles.saveButtonText}>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  categoryButton: {
    width: '30%',
    minWidth: 88,
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryButtonText: {
    fontSize: 11,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {},
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
