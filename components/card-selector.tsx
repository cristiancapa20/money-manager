import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/types/card';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CardSelectorProps {
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  onAddCard: () => void;
}

export function CardSelector({ cards, selectedCardId, onSelectCard, onAddCard }: CardSelectorProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Pill buttons for existing cards */}
        {cards.map((card) => {
          const isActive = card.id === selectedCardId;
          return (
            <TouchableOpacity
              key={card.id}
              onPress={() => onSelectCard(card.id)}
              activeOpacity={0.75}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? theme.tint : theme.card,
                  borderColor: isActive ? theme.tint : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: isActive ? '#FFFFFF' : theme.textSecondary },
                ]}
                numberOfLines={1}
              >
                {card.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Add card button */}
        <TouchableOpacity
          onPress={onAddCard}
          activeOpacity={0.75}
          style={[
            styles.pill,
            styles.addPill,
            { backgroundColor: theme.tintLight, borderColor: theme.tintBorder },
          ]}
        >
          <Ionicons name="add" size={16} color={theme.tint} />
          <Text style={[styles.pillText, { color: theme.tint }]}>
            {cards.length === 0 ? 'Agregar cuenta' : 'Nueva'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 120,
  },
  addPill: {
    gap: 4,
  },
});
