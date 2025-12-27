import type { Card } from '@/types/card';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
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
      <CardItem
        card={selectedCard}
        balance={balance}
        income={income}
        expenses={expenses}
      />
      {cards.length > 1 && (
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePrevious}
            activeOpacity={0.7}
            disabled={selectedCardIndex === 0}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={selectedCardIndex === 0 ? '#D1D5DB' : '#1E3A8A'}
            />
          </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNext}
            activeOpacity={0.7}
            disabled={selectedCardIndex === cards.length - 1}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={selectedCardIndex === cards.length - 1 ? '#D1D5DB' : '#1E3A8A'}
            />
          </TouchableOpacity>
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
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const cardColor = card.color || '#1E3A8A';
  const darkerColor = adjustColor(cardColor, -30);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[cardColor, darkerColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        {/* Pattern overlay */}
        <View style={styles.patternOverlay}>
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Top section with bank icon */}
          <View style={styles.cardTop}>
            <View style={styles.bankSection}>
              <View style={styles.bankIconContainer}>
                <Ionicons name="business-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.bankLabel}>Banco</Text>
                <Text style={styles.bankName}>{card.name}</Text>
              </View>
            </View>
          </View>

          {/* Balance section */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceLabelContainer}>
              <Text style={styles.balanceLabel}>Saldo disponible</Text>
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={toggleBalanceVisibility}
                activeOpacity={0.7}>
                <Ionicons
                  name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {isBalanceVisible ? formatCurrency(balance) : '••••••'}
            </Text>
          </View>

        </View>
      </LinearGradient>
    </View>
  );
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  cardContainer: {
    marginHorizontal: 8,
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    marginBottom: 24,
  },
  bankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 12,
  },
  bankLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 2,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  balanceSection: {
    marginBottom: 6,
  },
  balanceLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  eyeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  indicatorActive: {
    width: 32,
    backgroundColor: '#1E3A8A',
  },
});

