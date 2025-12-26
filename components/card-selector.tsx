import { ThemedText } from '@/components/themed-text';
import type { Card } from '@/types/card';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface CardSelectorProps {
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  onAddCard: () => void;
}

export function CardSelector({
  cards,
  selectedCardId,
  onSelectCard,
  onAddCard,
}: CardSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={onAddCard}>
        <Ionicons name="add" size={20} color="#1E3A8A" />
        <ThemedText style={styles.addButtonText}>Agregar Tarjeta</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
  },
  addButtonText: {
    color: '#1E3A8A',
    fontWeight: '600',
    fontSize: 14,
  },
});

