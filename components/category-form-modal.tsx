import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Category } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#F0A500', '#6C5CE7', '#A29BFE', '#00B894', '#E17055', '#fd79a8',
];

export const CATEGORY_ICONS = [
  'pricetag-outline', 'cart-outline', 'gift-outline', 'heart-outline',
  'star-outline', 'flash-outline', 'fitness-outline', 'pizza-outline',
  'cafe-outline', 'airplane-outline', 'bus-outline', 'bicycle-outline',
  'book-outline', 'briefcase-outline', 'build-outline', 'camera-outline',
  'musical-notes-outline', 'paw-outline', 'leaf-outline', 'globe-outline',
];

export type CategoryFormValues = Pick<Category, 'name' | 'color' | 'icon'>;

interface CategoryFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialValues?: CategoryFormValues;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
}

export function CategoryFormModal({
  visible,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [name, setName] = useState(initialValues?.name ?? '');
  const [color, setColor] = useState(initialValues?.color ?? CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(initialValues?.icon ?? CATEGORY_ICONS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialValues?.name ?? '');
      setColor(initialValues?.color ?? CATEGORY_COLORS[0]);
      setIcon(initialValues?.icon ?? CATEGORY_ICONS[0]);
      setSubmitting(false);
    }
  }, [visible, initialValues]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: trimmed, color, icon });
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === 'create' ? 'Nueva categoría' : 'Editar categoría';
  const cta = mode === 'create' ? 'Crear categoría' : 'Guardar cambios';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text },
            ]}
            placeholder="Nombre de la categoría"
            placeholderTextColor={theme.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus={mode === 'create'}
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
          <View style={styles.optionsGrid}>
            {CATEGORY_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  color === c && styles.colorSelected,
                ]}
              />
            ))}
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Icono</Text>
          <View style={styles.optionsGrid}>
            {CATEGORY_ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                onPress={() => setIcon(ic)}
                style={[
                  styles.iconOption,
                  { backgroundColor: theme.input, borderColor: theme.inputBorder },
                  icon === ic && { borderColor: color, backgroundColor: `${color}20` },
                ]}>
                <Ionicons
                  name={ic as any}
                  size={22}
                  color={icon === ic ? color : theme.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.preview, { backgroundColor: theme.input }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <Text style={[styles.previewText, { color: theme.text }]}>
              {name.trim() || 'Vista previa'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: theme.tint, opacity: name.trim() && !submitting ? 1 : 0.5 },
            ]}
            onPress={handleSubmit}
            disabled={!name.trim() || submitting}
            activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>{submitting ? 'Guardando…' : cta}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  previewText: { fontSize: 15, fontWeight: '600' },
  saveBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
