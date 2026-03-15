import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
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
  { name: 'Índigo',   value: '#4f46e5' },
  { name: 'Verde',    value: '#059669' },
  { name: 'Rojo',     value: '#DC2626' },
  { name: 'Púrpura',  value: '#7C3AED' },
  { name: 'Naranja',  value: '#EA580C' },
  { name: 'Rosa',     value: '#DB2777' },
];

export function AddCardModal({ visible, onClose, onSave }: AddCardModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(cardColors[0].value);

  const handleSave = () => {
    if (!name.trim() || !initialBalance.trim()) return;

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

  const isValid = name.trim() && initialBalance.trim();

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
            <ThemedText type="title">Nueva Cuenta</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Nombre */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Nombre de la Cuenta</Text>
              <TextInput
                style={inputStyle}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Cuenta Principal, Ahorros, etc."
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Balance Inicial */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Balance Inicial</Text>
              <TextInput
                style={inputStyle}
                value={initialBalance}
                onChangeText={setInitialBalance}
                placeholder="0.00"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Color */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
              <View style={styles.colorsContainer}>
                {cardColors.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color.value },
                      selectedColor === color.value && styles.colorButtonActive,
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

          {/* Footer */}
          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.divider }]}
              onPress={handleClose}>
              <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                Cancelar
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
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
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
