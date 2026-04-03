import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/types/card';
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS, type AccountType } from '@/types/card';
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

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (card: Omit<Card, 'id' | 'userId'>) => void;
  editingCard?: Card | null;
}

const cardColors = [
  { name: 'Índigo',  value: '#4f46e5' },
  { name: 'Verde',   value: '#059669' },
  { name: 'Rojo',    value: '#DC2626' },
  { name: 'Púrpura', value: '#7C3AED' },
  { name: 'Naranja', value: '#EA580C' },
  { name: 'Rosa',    value: '#DB2777' },
];

const accountTypes: AccountType[] = ['CASH', 'BANK', 'CREDIT_CARD', 'OTHER'];

export function AddCardModal({ visible, onClose, onSave, editingCard }: AddCardModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(cardColors[0].value);
  const [selectedType, setSelectedType] = useState<AccountType>('BANK');
  const [initialBalance, setInitialBalance] = useState('');

  useEffect(() => {
    if (editingCard) {
      setName(editingCard.name);
      setSelectedColor(editingCard.color);
      setSelectedType(editingCard.type);
      setInitialBalance(editingCard.initialBalance ? String(editingCard.initialBalance) : '');
    } else {
      handleReset();
    }
  }, [editingCard, visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color: selectedColor,
      type: selectedType,
      initialBalance: parseFloat(initialBalance) || 0,
    });
    handleReset();
  };

  const handleReset = () => {
    setName('');
    setSelectedColor(cardColors[0].value);
    setSelectedType('BANK');
    setInitialBalance('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isValid = name.trim();
  const isEditing = !!editingCard;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ThemedView style={styles.sheet}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title">{isEditing ? 'Editar Cuenta' : 'Nueva Cuenta'}</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Nombre */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Nombre</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Cuenta Principal, Ahorros…"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Tipo de cuenta */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo de cuenta</Text>
              <View style={styles.typeGrid}>
                {accountTypes.map((t) => {
                  const active = selectedType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: active ? theme.tintLight : theme.divider,
                          borderColor: active ? theme.tint : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedType(t)}>
                      <Ionicons
                        name={ACCOUNT_TYPE_ICONS[t] as any}
                        size={20}
                        color={active ? theme.tint : theme.textSecondary}
                      />
                      <Text style={[styles.typeLabel, { color: active ? theme.tint : theme.textSecondary }]}>
                        {ACCOUNT_TYPE_LABELS[t]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Balance inicial */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Balance inicial</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
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
              <View style={styles.colorsRow}>
                {cardColors.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c.value },
                      selectedColor === c.value && styles.colorDotActive,
                    ]}
                    onPress={() => setSelectedColor(c.value)}>
                    {selectedColor === c.value && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
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
              style={[styles.btn, { backgroundColor: isValid ? theme.tint : theme.border, opacity: isValid ? 1 : 0.6 }]}
              onPress={handleSave}
              disabled={!isValid}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  closeBtn: { padding: 4 },
  form: { padding: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, minWidth: '45%' },
  typeLabel: { fontSize: 13, fontWeight: '600' },
  colorsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorDot: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
  colorDotActive: { borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
