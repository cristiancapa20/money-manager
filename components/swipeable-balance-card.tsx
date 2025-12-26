import { StyleSheet, View, PanResponder } from 'react-native';
import { BalanceCard } from './balance-card';
import type { Card } from '@/types/card';
import type { Transaction } from './add-transaction-modal';
import { useRef } from 'react';

interface SwipeableBalanceCardProps {
  cards: Card[];
  selectedCardIndex: number;
  onCardChange: (index: number) => void;
  transactions: Transaction[];
}

export function SwipeableBalanceCard({
  cards,
  selectedCardIndex,
  onCardChange,
  transactions,
}: SwipeableBalanceCardProps) {
  if (cards.length === 0) {
    return null;
  }

  const selectedCard = cards[selectedCardIndex];
  if (!selectedCard) {
    return null;
  }

  // Filtrar transacciones de la tarjeta seleccionada
  const cardTransactions = transactions.filter((t) => t.cardId === selectedCard.id);

  // Calcular totales
  const income = cardTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = cardTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = selectedCard.initialBalance + income - expenses;

  // Usar PanResponder para detectar swipes solo en la tarjeta
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Solo activar si el movimiento es principalmente horizontal (más horizontal que vertical)
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const hasEnoughMovement = Math.abs(gestureState.dx) > 15;
        return isHorizontal && hasEnoughMovement;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // No capturar si es scroll vertical
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 15;
      },
      onPanResponderTerminationRequest: () => true, // Permitir que otros gestos tomen el control
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        const swipeThreshold = 60; // Mínimo de píxeles
        const velocityThreshold = 0.5; // Velocidad mínima

        // Solo procesar si fue principalmente horizontal
        if (Math.abs(dx) < Math.abs(gestureState.dy || 0)) {
          return;
        }

        // Swipe hacia la izquierda (siguiente tarjeta)
        if ((dx < -swipeThreshold || vx < -velocityThreshold) && 
            selectedCardIndex < cards.length - 1) {
          onCardChange(selectedCardIndex + 1);
        }
        // Swipe hacia la derecha (tarjeta anterior)
        else if ((dx > swipeThreshold || vx > velocityThreshold) && 
                 selectedCardIndex > 0) {
          onCardChange(selectedCardIndex - 1);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
        <BalanceCard
          balance={balance}
          income={income}
          expenses={expenses}
          cardName={selectedCard.name}
          cardColor={selectedCard.color}
        />
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
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

