import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}

const categories = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Servicios',
  'Compras',
  'Salario',
  'Freelance',
  'Inversiones',
  'Otros',
];

export function AddTransactionModal({
  visible,
  onClose,
  onSave,
}: AddTransactionModalProps) {
  const theme = useColorScheme() ?? 'light';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');

  const handleSave = () => {
    if (!title.trim() || !amount.trim() || !category) {
      return;
    }

    const transaction: Transaction = {
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount) || 0,
      type,
      category,
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <View style={[styles.modalHeader, theme === 'dark' && styles.modalHeaderDark]}>
            <ThemedText type="title">Nueva Transacción</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme === 'light' ? '#000' : '#fff'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
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
                style={[
                  styles.input,
                  theme === 'dark' && styles.inputDark,
                ]}
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
                style={[
                  styles.input,
                  theme === 'dark' && styles.inputDark,
                ]}
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                      theme === 'dark' && styles.categoryButtonDark,
                    ]}
                    onPress={() => setCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextActive,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Botones */}
          <View style={[styles.modalFooter, theme === 'dark' && styles.modalFooterDark]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, theme === 'dark' && styles.cancelButtonDark]}
              onPress={handleClose}>
              <Text style={[styles.cancelButtonText, theme === 'dark' && styles.cancelButtonTextDark]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (!title.trim() || !amount.trim() || !category) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!title.trim() || !amount.trim() || !category}>
              <Text style={styles.saveButtonText}>Guardar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalHeaderDark: {
    borderBottomColor: '#333',
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
  categoriesContainer: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryButtonDark: {
    backgroundColor: '#1F1F1F',
    borderColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  modalFooterDark: {
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

