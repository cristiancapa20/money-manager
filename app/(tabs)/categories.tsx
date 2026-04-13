import { BackButton } from '@/components/back-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COLOR_OPTIONS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#F0A500', '#6C5CE7', '#A29BFE', '#00B894', '#E17055', '#fd79a8',
];

const ICON_OPTIONS = [
  'pricetag-outline', 'cart-outline', 'gift-outline', 'heart-outline',
  'star-outline', 'flash-outline', 'fitness-outline', 'pizza-outline',
  'cafe-outline', 'airplane-outline', 'bus-outline', 'bicycle-outline',
  'book-outline', 'briefcase-outline', 'build-outline', 'camera-outline',
  'musical-notes-outline', 'paw-outline', 'leaf-outline', 'globe-outline',
];

export default function CategoriesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { categories, addCategory, deleteCategory } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);

  const resetForm = () => {
    setName('');
    setSelectedColor(COLOR_OPTIONS[0]);
    setSelectedIcon(ICON_OPTIONS[0]);
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await addCategory({ name: trimmed, color: selectedColor, icon: selectedIcon });
      setModalVisible(false);
      resetForm();
    } catch (err) {
      Alert.alert('Error', 'No se pudo crear la categoría');
    }
  };

  const handleDelete = (id: string, categoryName: string) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Eliminar "${categoryName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'No se pudo eliminar la categoría');
            }
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <ThemedText type="title" style={styles.headerTitle}>Categorías</ThemedText>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: theme.tint }]}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Category List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowName, { color: theme.text }]}>{item.name}</Text>
              {item.isSystem && (
                <Text style={[styles.badge, { color: theme.textMuted }]}>Sistema</Text>
              )}
            </View>
            {!item.isSystem && (
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                hitSlop={12}>
                <Ionicons name="trash-outline" size={20} color={theme.expense} />
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva categoría</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <TextInput
              style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder="Nombre de la categoría"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            {/* Color Picker */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
            <View style={styles.optionsGrid}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorSelected,
                  ]}
                />
              ))}
            </View>

            {/* Icon Picker */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Icono</Text>
            <View style={styles.optionsGrid}>
              {ICON_OPTIONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setSelectedIcon(ic)}
                  style={[
                    styles.iconOption,
                    { backgroundColor: theme.input, borderColor: theme.inputBorder },
                    selectedIcon === ic && { borderColor: selectedColor, backgroundColor: selectedColor + '20' },
                  ]}>
                  <Ionicons
                    name={ic as any}
                    size={22}
                    color={selectedIcon === ic ? selectedColor : theme.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <View style={[styles.preview, { backgroundColor: theme.input }]}>
              <View style={[styles.iconCircle, { backgroundColor: selectedColor + '20' }]}>
                <Ionicons name={selectedIcon as any} size={22} color={selectedColor} />
              </View>
              <Text style={[styles.previewText, { color: theme.text }]}>
                {name.trim() || 'Vista previa'}
              </Text>
            </View>

            {/* Save */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.tint, opacity: name.trim() ? 1 : 0.5 }]}
              onPress={handleCreate}
              disabled={!name.trim()}
              activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Crear categoría</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
  },
  headerTitle: { flex: 1 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { paddingHorizontal: 20, paddingBottom: 120, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontWeight: '600' },
  badge: { fontSize: 12 },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
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
    marginBottom: 16,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
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
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  previewText: { fontSize: 15, fontWeight: '600' },
  saveBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
