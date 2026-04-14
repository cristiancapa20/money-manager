import { BackButton } from '@/components/back-button';
import { CategoryFormModal, type CategoryFormValues } from '@/components/category-form-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Category } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CategoriesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();

  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editInitial, setEditInitial] = useState<CategoryFormValues | undefined>(undefined);

  const handleCreate = async (values: CategoryFormValues) => {
    try {
      await addCategory(values);
      setCreateVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo crear la categoria');
    }
  };

  const handleEdit = useCallback((cat: Category) => {
    if (cat.isSystem) return;
    setEditingCategoryId(cat.id);
    setEditInitial({ name: cat.name, color: cat.color, icon: cat.icon });
    setEditVisible(true);
  }, []);

  const handleUpdate = async (values: CategoryFormValues) => {
    if (!editingCategoryId) return;
    try {
      await updateCategory(editingCategoryId, values);
      setEditVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo editar la categoria');
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
        <ThemedText type="title" style={styles.headerTitle}>Categorias</ThemedText>
        <TouchableOpacity
          onPress={() => setCreateVisible(true)}
          style={[styles.addBtn, { backgroundColor: theme.tint }]}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Category Grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => handleEdit(cat)}
            onLongPress={() => {
              if (!cat.isSystem) handleDelete(cat.id, cat.name);
            }}
            activeOpacity={0.7}>
            <View style={[styles.categoryIconContainer, { backgroundColor: cat.color + '20' }]}>
              <Ionicons name={cat.icon as any} size={22} color={cat.color} />
            </View>
            <Text style={[styles.categoryName, { color: theme.text }]} numberOfLines={1}>
              {cat.name}
            </Text>
            {cat.isSystem && (
              <Text style={[styles.badge, { color: theme.textMuted }]}>Sistema</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <CategoryFormModal
        visible={createVisible}
        mode="create"
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreate}
      />

      <CategoryFormModal
        visible={editVisible}
        mode="edit"
        initialValues={editInitial}
        onClose={() => setEditVisible(false)}
        onSubmit={handleUpdate}
      />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  categoryButton: {
    width: '30%',
    minWidth: 88,
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: { fontSize: 11, textAlign: 'center', fontWeight: '600' },
  badge: { fontSize: 10, marginTop: 2 },
});
