import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/types/card';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (card: Omit<Card, 'id'>) => void;
}

const cardColors = [
  { name: 'Azul', value: '#1E3A8A' },
  { name: 'Verde', value: '#059669' },
  { name: 'Rojo', value: '#DC2626' },
  { name: 'Púrpura', value: '#7C3AED' },
  { name: 'Naranja', value: '#EA580C' },
  { name: 'Rosa', value: '#DB2777' },
];

export function AddCardModal({ visible, onClose, onSave }: AddCardModalProps) {
  const theme = useColorScheme() ?? 'light';
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(cardColors[0].value);

  const handleSave = () => {
    if (!name.trim() || !initialBalance.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      initialBalance: parseFloat(initialBalance) || 0,
      color: selectedColor,
    });

    handleReset();
  };

  const handleReset = () => {
    setName('');
    setInitialBalance('');
    setSelectedColor(cardColors[0].value);
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
            <ThemedText type="title">Nueva Tarjeta</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme === 'light' ? '#000' : '#fff'} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Nombre de la Tarjeta */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.label}>
                Nombre de la Tarjeta
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  theme === 'dark' && styles.inputDark,
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Tarjeta Principal, Ahorros, etc."
                placeholderTextColor={theme === 'light' ? '#999' : '#666'}
              />
            </View>

            {/* Balance Inicial */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.label}>
                Balance Inicial
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  theme === 'dark' && styles.inputDark,
                ]}
                value={initialBalance}
                onChangeText={setInitialBalance}
                placeholder="0.00"
                placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Color */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.label}>
                Color
              </ThemedText>
              <View style={styles.colorsContainer}>
                {cardColors.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    style={[
                      styles.colorButton,
                      selectedColor === color.value && styles.colorButtonActive,
                      { backgroundColor: color.value },
                    ]}
                    onPress={() => setSelectedColor(color.value)}>
                    {selectedColor === color.value && (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Botones */}
          <View style={[styles.modalFooter, theme === 'dark' && styles.modalFooterDark]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, theme === 'dark' && styles.cancelButtonDark]}
              onPress={handleClose}>
              <Text style={[styles.cancelButtonText, theme === 'dark' && styles.cancelButtonTextDark]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (!name.trim() || !initialBalance.trim()) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!name.trim() || !initialBalance.trim()}>
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
    backgroundColor: '#fff',
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
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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

