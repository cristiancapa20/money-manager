import type { Card } from '@/types/card';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Transaction } from './add-transaction-modal';

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
  if (cards.length === 0) {
    return null;
  }

  const selectedCard = cards[selectedCardIndex];
  const cardTransactions = transactions.filter((t) => t.cardId === selectedCard.id);
  const income = cardTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = cardTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = selectedCard.initialBalance + income - expenses;

  const handlePrevious = () => {
    if (selectedCardIndex > 0) {
      onCardChange(selectedCardIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedCardIndex < cards.length - 1) {
      onCardChange(selectedCardIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        {selectedCardIndex > 0 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePrevious}
            activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <CardItem
          card={selectedCard}
          balance={balance}
          income={income}
          expenses={expenses}
        />
        {selectedCardIndex < cards.length - 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonRight]}
            onPress={handleNext}
            activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
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
}

function CardItem({ card, balance }: CardItemProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const cardColor = card.color || '#1E3A8A';

  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      {/* Pattern overlay */}
      <View style={styles.patternOverlay}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
      </View>
      
      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={styles.cardBank}>TARJETA</Text>
          <Text style={styles.cardName}>{card.name}</Text>
        </View>
        
        <View style={styles.cardBottom}>
          <Text style={styles.balanceLabel}>BALANCE</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </View>
      </View>
      
      {/* Card chip decoration */}
      <View style={styles.cardChip} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  cardWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    position: 'absolute',
    left: 10,
    top: 88,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navButtonRight: {
    left: 'auto',
    right: 10,
  },
  card: {
    width: '100%',
    height: 176,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  patternCircle1: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -48,
    left: -48,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  cardTop: {
    marginTop: 4,
  },
  cardBank: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.8,
    letterSpacing: 1.2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  cardBottom: {
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.8,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardChip: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
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

