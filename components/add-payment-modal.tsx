import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/types/card';
import type { LoanPayment } from '@/types/loan';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payment: { accountId: string; amount: number; date: string; note: string }) => void;
  editingPayment?: LoanPayment | null;
  cards: Card[];
  maxAmount?: number;
}

export function AddPaymentModal({ visible, onClose, onSave, editingPayment, cards, maxAmount }: AddPaymentModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    if (editingPayment) {
      setAmountInput(String(editingPayment.amount));
      setNote(editingPayment.note);
      setDate(new Date(editingPayment.date));
      setAccountId(editingPayment.accountId);
    } else {
      handleReset();
    }
  }, [editingPayment, visible]);

  useEffect(() => {
    if (!accountId && cards.length > 0) {
      setAccountId(cards[0].id);
    }
  }, [cards, visible]);

  const handleSave = () => {
    const amount = parseFloat(amountInput);
    if (!amount || !accountId) return;

    onSave({
      accountId,
      amount,
      date: date.toISOString(),
      note: note.trim(),
    });
    handleReset();
  };

  const handleReset = () => {
    setAmountInput(maxAmount ? String(maxAmount) : '');
    setNote('');
    setDate(new Date());
    setShowDatePicker(false);
    setAccountId(cards.length > 0 ? cards[0].id : '');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const amount = parseFloat(amountInput);
  const isValid = amount > 0 && accountId;
  const isEditing = !!editingPayment;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ThemedView style={styles.sheet}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title">{isEditing ? 'Editar Pago' : 'Registrar Pago'}</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Monto */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Monto</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
                value={amountInput}
                onChangeText={setAmountInput}
                placeholder="0.00"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
              />
              {maxAmount != null && maxAmount > 0 && (
                <Text style={[styles.hint, { color: theme.textMuted }]}>
                  Pendiente: ${maxAmount.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Cuenta */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Cuenta</Text>
              <View style={styles.typeGrid}>
                {cards.map((card) => {
                  const active = accountId === card.id;
                  return (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: active ? theme.tintLight : theme.divider,
                          borderColor: active ? theme.tint : 'transparent',
                        },
                      ]}
                      onPress={() => setAccountId(card.id)}>
                      <View style={[styles.cardDot, { backgroundColor: card.color }]} />
                      <Text
                        style={[styles.typeLabel, { color: active ? theme.tint : theme.textSecondary }]}
                        numberOfLines={1}>
                        {card.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Fecha */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Fecha</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}
                onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={theme.text} />
                <Text style={{ color: theme.text, fontSize: 15, flex: 1 }}>
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(_event, selectedDate) => {
                    if (Platform.OS === 'android') setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                  themeVariant={scheme}
                />
              )}
            </View>

            {/* Nota */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Nota (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
                value={note}
                onChangeText={setNote}
                placeholder="Nota opcional"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={2}
              />
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
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  hint: { fontSize: 12, marginTop: 6 },
  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, minWidth: '45%' },
  typeLabel: { fontSize: 13, fontWeight: '600' },
  cardDot: { width: 12, height: 12, borderRadius: 6 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
