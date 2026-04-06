import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/types/card';
import type { Subscription } from '@/types/subscription';
import type { Category } from '@/types/transaction';
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

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (sub: {
    name: string;
    amount: number;
    billingDay: number;
    active: boolean;
    accountId: string;
    categoryId: string | null;
  }) => void;
  editingSubscription?: Subscription | null;
  cards: Card[];
  categories: Category[];
}

export function AddSubscriptionModal({
  visible,
  onClose,
  onSave,
  editingSubscription,
  cards,
  categories,
}: AddSubscriptionModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [name, setName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [billingDayInput, setBillingDayInput] = useState('');
  const [active, setActive] = useState(true);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name);
      setAmountInput(String(editingSubscription.amount));
      setBillingDayInput(String(editingSubscription.billingDay));
      setActive(editingSubscription.active);
      setAccountId(editingSubscription.accountId);
      setCategoryId(editingSubscription.categoryId);
    } else {
      handleReset();
    }
  }, [editingSubscription, visible]);

  useEffect(() => {
    if (!accountId && cards.length > 0) {
      setAccountId(cards[0].id);
    }
  }, [cards, visible]);

  const handleSave = () => {
    const amount = parseFloat(amountInput);
    const billingDay = parseInt(billingDayInput, 10);
    if (!name.trim() || !amount || !billingDay || !accountId) return;

    onSave({
      name: name.trim(),
      amount,
      billingDay,
      active,
      accountId,
      categoryId,
    });
    handleReset();
  };

  const handleReset = () => {
    setName('');
    setAmountInput('');
    setBillingDayInput('');
    setActive(true);
    setAccountId(cards.length > 0 ? cards[0].id : '');
    setCategoryId(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const amount = parseFloat(amountInput);
  const billingDay = parseInt(billingDayInput, 10);
  const isValid =
    name.trim() &&
    amount > 0 &&
    billingDay >= 1 &&
    billingDay <= 31 &&
    accountId;
  const isEditing = !!editingSubscription;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ThemedView style={styles.sheet}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title">
              {isEditing ? 'Editar Suscripción' : 'Nueva Suscripción'}
            </ThemedText>
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
                placeholder="Ej: Netflix, Spotify"
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

            {/* Día del mes */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Día del mes (1-31)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
                value={billingDayInput}
                onChangeText={setBillingDayInput}
                placeholder="Ej: 15"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
              />
            </View>

            {/* Cuenta */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Cuenta</Text>
              <View style={styles.grid}>
                {cards.map((card) => {
                  const selected = accountId === card.id;
                  return (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.gridOption,
                        {
                          backgroundColor: selected ? theme.tintLight : theme.divider,
                          borderColor: selected ? theme.tint : 'transparent',
                        },
                      ]}
                      onPress={() => setAccountId(card.id)}>
                      <View style={[styles.cardDot, { backgroundColor: card.color }]} />
                      <Text
                        style={[styles.gridLabel, { color: selected ? theme.tint : theme.textSecondary }]}
                        numberOfLines={1}>
                        {card.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Categoría (opcional) */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Categoría (opcional)</Text>
              <View style={styles.grid}>
                <TouchableOpacity
                  style={[
                    styles.gridOption,
                    {
                      backgroundColor: !categoryId ? theme.tintLight : theme.divider,
                      borderColor: !categoryId ? theme.tint : 'transparent',
                    },
                  ]}
                  onPress={() => setCategoryId(null)}>
                  <Ionicons name="remove-circle-outline" size={16} color={!categoryId ? theme.tint : theme.textSecondary} />
                  <Text style={[styles.gridLabel, { color: !categoryId ? theme.tint : theme.textSecondary }]}>
                    Ninguna
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => {
                  const selected = categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.gridOption,
                        {
                          backgroundColor: selected ? theme.tintLight : theme.divider,
                          borderColor: selected ? theme.tint : 'transparent',
                        },
                      ]}
                      onPress={() => setCategoryId(cat.id)}>
                      <Ionicons name={cat.icon as any} size={16} color={selected ? theme.tint : cat.color} />
                      <Text
                        style={[styles.gridLabel, { color: selected ? theme.tint : theme.textSecondary }]}
                        numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Estado (solo en edición) */}
            {isEditing && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Estado</Text>
                <View style={styles.grid}>
                  {[true, false].map((val) => {
                    const selected = active === val;
                    const color = val ? theme.income : theme.textSecondary;
                    return (
                      <TouchableOpacity
                        key={String(val)}
                        style={[
                          styles.gridOption,
                          {
                            backgroundColor: selected ? (val ? theme.incomeBg : theme.divider) : theme.divider,
                            borderColor: selected ? color : 'transparent',
                          },
                        ]}
                        onPress={() => setActive(val)}>
                        <Ionicons
                          name={val ? 'checkmark-circle-outline' : 'pause-circle-outline'}
                          size={20}
                          color={selected ? color : theme.textSecondary}
                        />
                        <Text style={[styles.gridLabel, { color: selected ? color : theme.textSecondary }]}>
                          {val ? 'Activa' : 'Inactiva'}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, minWidth: '45%' },
  gridLabel: { fontSize: 13, fontWeight: '600' },
  cardDot: { width: 12, height: 12, borderRadius: 6 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
