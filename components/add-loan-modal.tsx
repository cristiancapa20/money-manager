import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/types/card';
import type { Loan, LoanType, LoanStatus } from '@/types/loan';
import { LOAN_TYPE_LABELS, LOAN_TYPE_ICONS, LOAN_STATUS_LABELS } from '@/types/loan';
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

interface AddLoanModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (loan: {
    type: LoanType;
    contactName: string;
    amount: number;
    description: string;
    dueDate: string | null;
    reminderDays: number | null;
    status: LoanStatus;
    accountId: string;
  }) => void;
  editingLoan?: Loan | null;
  cards: Card[];
}

const loanTypes: LoanType[] = ['LENT', 'OWED'];

export function AddLoanModal({ visible, onClose, onSave, editingLoan, cards }: AddLoanModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [type, setType] = useState<LoanType>('LENT');
  const [contactName, setContactName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderDaysInput, setReminderDaysInput] = useState('');
  const [status, setStatus] = useState<LoanStatus>('ACTIVE');
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    if (editingLoan) {
      setType(editingLoan.type);
      setContactName(editingLoan.contactName);
      setAmountInput(String(editingLoan.amount));
      setDescription(editingLoan.description);
      setDueDate(editingLoan.dueDate ? new Date(editingLoan.dueDate) : null);
      setReminderDaysInput(editingLoan.reminderDays != null ? String(editingLoan.reminderDays) : '');
      setStatus(editingLoan.status);
      setAccountId(editingLoan.accountId);
    } else {
      handleReset();
    }
  }, [editingLoan, visible]);

  useEffect(() => {
    if (!accountId && cards.length > 0) {
      setAccountId(cards[0].id);
    }
  }, [cards, visible]);

  const handleSave = () => {
    const amount = parseFloat(amountInput);
    if (!contactName.trim() || !amount || !accountId) return;

    onSave({
      type,
      contactName: contactName.trim(),
      amount,
      description: description.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      reminderDays: reminderDaysInput ? parseInt(reminderDaysInput, 10) : null,
      status,
      accountId,
    });
    handleReset();
  };

  const handleReset = () => {
    setType('LENT');
    setContactName('');
    setAmountInput('');
    setDescription('');
    setDueDate(null);
    setShowDatePicker(false);
    setReminderDaysInput('');
    setStatus('ACTIVE');
    setAccountId(cards.length > 0 ? cards[0].id : '');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isValid = contactName.trim() && parseFloat(amountInput) > 0 && accountId;
  const isEditing = !!editingLoan;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ThemedView style={styles.sheet}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title">{isEditing ? 'Editar Préstamo' : 'Nuevo Préstamo'}</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Tipo de préstamo */}
            {!isEditing && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo</Text>
                <View style={styles.typeGrid}>
                  {loanTypes.map((t) => {
                    const active = type === t;
                    const color = t === 'LENT' ? theme.income : theme.expense;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.typeOption,
                          {
                            backgroundColor: active ? (t === 'LENT' ? theme.incomeBg : theme.expenseBg) : theme.divider,
                            borderColor: active ? color : 'transparent',
                          },
                        ]}
                        onPress={() => setType(t)}>
                        <Ionicons name={LOAN_TYPE_ICONS[t] as any} size={20} color={active ? color : theme.textSecondary} />
                        <Text style={[styles.typeLabel, { color: active ? color : theme.textSecondary }]}>
                          {LOAN_TYPE_LABELS[t]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Contacto */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {type === 'LENT' ? '¿A quién le prestaste?' : '¿A quién le debes?'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
                value={contactName}
                onChangeText={setContactName}
                placeholder={type === 'LENT' ? 'Ej: Juan Pérez' : 'Ej: María López'}
                placeholderTextColor={theme.textMuted}
              />
            </View>

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

            {/* Descripción */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descripción opcional"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Fecha de vencimiento */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Fecha de vencimiento (opcional)</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={[styles.input, styles.dateInput, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}
                  onPress={() => {
                    if (!dueDate) setDueDate(new Date());
                    setShowDatePicker(true);
                  }}>
                  <Ionicons name="calendar-outline" size={18} color={dueDate ? theme.text : theme.textMuted} />
                  <Text style={{ color: dueDate ? theme.text : theme.textMuted, fontSize: 15, flex: 1 }}>
                    {dueDate ? dueDate.toLocaleDateString() : 'Seleccionar fecha'}
                  </Text>
                </TouchableOpacity>
                {dueDate && (
                  <TouchableOpacity
                    style={[styles.clearDateBtn, { backgroundColor: theme.divider }]}
                    onPress={() => { setDueDate(null); setShowDatePicker(false); }}>
                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={new Date()}
                  onChange={(_event, selectedDate) => {
                    if (Platform.OS === 'android') setShowDatePicker(false);
                    if (selectedDate) setDueDate(selectedDate);
                  }}
                  themeVariant={scheme}
                />
              )}
            </View>

            {/* Días de recordatorio */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Días de recordatorio (opcional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
                value={reminderDaysInput}
                onChangeText={setReminderDaysInput}
                placeholder="Ej: 3"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
              />
            </View>

            {/* Estado (solo en edición) */}
            {isEditing && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Estado</Text>
                <View style={styles.typeGrid}>
                  {(['ACTIVE', 'PAID'] as LoanStatus[]).map((s) => {
                    const active = status === s;
                    const color = s === 'PAID' ? theme.income : theme.tint;
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.typeOption,
                          {
                            backgroundColor: active ? (s === 'PAID' ? theme.incomeBg : theme.tintLight) : theme.divider,
                            borderColor: active ? color : 'transparent',
                          },
                        ]}
                        onPress={() => setStatus(s)}>
                        <Ionicons
                          name={s === 'PAID' ? 'checkmark-circle-outline' : 'time-outline'}
                          size={20}
                          color={active ? color : theme.textSecondary}
                        />
                        <Text style={[styles.typeLabel, { color: active ? color : theme.textSecondary }]}>
                          {LOAN_STATUS_LABELS[s]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  dateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  clearDateBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, minWidth: '45%' },
  typeLabel: { fontSize: 13, fontWeight: '600' },
  cardDot: { width: 12, height: 12, borderRadius: 6 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
