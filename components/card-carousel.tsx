import type { Card } from '@/types/card';
import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import type { Transaction } from './add-transaction-modal';
import { BalanceCard } from './balance-card';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75; // 75% del ancho de pantalla - más pequeño
const CARD_SPACING = 12;
const CARD_OFFSET = 15; // Menos superposición

interface CardCarouselProps {
  cards: Card[];
  selectedCardIndex: number;
  onCardChange: (index: number) => void;
  transactions: Transaction[];
}

export function CardCarousel({
  cards,
  selectedCardIndex,
  onCardChange,
  transactions,
}: CardCarouselProps) {
  const scrollX = useSharedValue(selectedCardIndex * CARD_WIDTH);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  if (cards.length === 0) {
    return null;
  }

  // Sincronizar scroll cuando cambia el índice seleccionado
  useEffect(() => {
    if (scrollViewRef.current) {
      const cardWidthWithSpacing = CARD_WIDTH + CARD_SPACING;
      scrollViewRef.current.scrollTo({
        x: selectedCardIndex * cardWidthWithSpacing,
        animated: true,
      });
    }
    const cardWidthWithSpacing = CARD_WIDTH + CARD_SPACING;
    scrollX.value = selectedCardIndex * cardWidthWithSpacing;
  }, [selectedCardIndex]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const cardWidthWithSpacing = CARD_WIDTH + CARD_SPACING;
    const index = Math.round(offsetX / cardWidthWithSpacing);
    if (index !== selectedCardIndex && index >= 0 && index < cards.length) {
      onCardChange(index);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        bounces={false}>
        {cards.map((card, index) => {
          const cardTransactions = transactions.filter((t) => t.cardId === card.id);
          const income = cardTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const expenses = cardTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          const balance = card.initialBalance + income - expenses;

          return (
            <CardItem
              key={card.id}
              card={card}
              balance={balance}
              income={income}
              expenses={expenses}
              index={index}
              scrollX={scrollX}
            />
          );
        })}
      </Animated.ScrollView>
      {cards.length > 1 && (
        <View style={styles.indicators}>
          {cards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === selectedCardIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

interface CardItemProps {
  card: Card;
  balance: number;
  income: number;
  expenses: number;
  index: number;
  scrollX: Animated.SharedValue<number>;
}

function CardItem({ card, balance, income, expenses, index, scrollX }: CardItemProps) {
  const cardWidthWithSpacing = CARD_WIDTH + CARD_SPACING;
  const inputRange = [
    (index - 1) * cardWidthWithSpacing,
    index * cardWidthWithSpacing,
    (index + 1) * cardWidthWithSpacing,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      'clamp'
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      'clamp'
    );

    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [CARD_OFFSET, 0, -CARD_OFFSET],
      'clamp'
    );

    return {
      transform: [{ scale }, { translateX }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <BalanceCard
        balance={balance}
        income={income}
        expenses={expenses}
        cardName={card.name}
        cardColor={card.color}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    paddingVertical: 10,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#1E3A8A',
  },
});

