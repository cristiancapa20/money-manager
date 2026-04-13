import { Colors } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/types/card';
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS } from '@/types/card';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Transaction } from '@/types/transaction';
import Carousel from 'react-native-reanimated-carousel';
import type { ICarouselInstance } from 'react-native-reanimated-carousel';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PARENT_PADDING = 36; // listContent (16) + headerContainer (20)
const CARD_PADDING = 20;
const CAROUSEL_WIDTH = SCREEN_WIDTH;

interface CardCarouselProps {
  cards: Card[];
  selectedCardIndex: number;
  onCardChange: (index: number) => void;
  transactions: Transaction[];
  onDeleteCard?: (cardId: string) => Promise<void>;
  onEditCard?: (card: Card) => void;
  onAddCard?: () => void;
}

export const CardCarousel = React.memo(function CardCarousel({
  cards,
  selectedCardIndex,
  onCardChange,
  transactions,
  onDeleteCard,
  onEditCard,
  onAddCard,
}: CardCarouselProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const carouselRef = useRef<ICarouselInstance>(null);

  const handleSnapToItem = useCallback(
    (index: number) => {
      onCardChange(index);
    },
    [onCardChange],
  );

  const balances = useMemo(() => {
    const map: Record<string, { balance: number; income: number; expenses: number }> = {};
    for (const card of cards) {
      const cardTx = transactions.filter((t) => t.accountId === card.id);
      const income = cardTx
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = cardTx
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
      map[card.id] = {
        balance: card.initialBalance + income - expenses,
        income,
        expenses,
      };
    }
    return map;
  }, [cards, transactions]);

  const renderCard = useCallback(
    ({ item }: { item: Card }) => {
      const data = balances[item.id] ?? { balance: 0, income: 0, expenses: 0 };
      return (
        <View style={styles.cardWrapper}>
          <CardItem
            card={item}
            balance={data.balance}
            income={data.income}
            expenses={data.expenses}
            onDeleteCard={onDeleteCard}
            onEditCard={onEditCard}
          />
        </View>
      );
    },
    [balances, onDeleteCard, onEditCard],
  );

  if (cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={cards}
        renderItem={renderCard}
        width={CAROUSEL_WIDTH}
        height={210}
        style={styles.carousel}
        defaultIndex={selectedCardIndex}
        onSnapToItem={handleSnapToItem}
        loop={false}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
      />
      <View style={styles.footer}>
        {cards.length > 1 ? (
          <View style={styles.indicators}>
            {cards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: theme.border },
                  index === selectedCardIndex && [
                    styles.indicatorActive,
                    { backgroundColor: theme.tint },
                  ],
                ]}
              />
            ))}
          </View>
        ) : (
          <View />
        )}
        {onAddCard && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.tintLight, borderColor: theme.tintBorder }]}
            onPress={onAddCard}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={16} color={theme.tint} />
            <Text style={[styles.addButtonText, { color: theme.tint }]}>Nueva</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

interface CardItemProps {
  card: Card;
  balance: number;
  income: number;
  expenses: number;
  onDeleteCard?: (cardId: string) => Promise<void>;
  onEditCard?: (card: Card) => void;
}

function CardItem({ card, balance, onDeleteCard, onEditCard }: CardItemProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const { formatCurrency } = useCurrency();

  const cardColor = card.color || '#1E3A8A';
  const darkerColor = adjustColor(cardColor, -30);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Eliminar tarjeta',
      `Estas seguro de que deseas eliminar la tarjeta "${card.name}"? Esta accion no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (onDeleteCard) {
              try {
                await onDeleteCard(card.id);
              } catch (error: any) {
                Alert.alert('No se puede eliminar', error.message);
              }
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <LinearGradient
      colors={[cardColor, darkerColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <View style={styles.patternOverlay}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={styles.bankSection}>
            <View style={styles.bankIconContainer}>
              <Ionicons name={(ACCOUNT_TYPE_ICONS[card.type] || 'wallet-outline') as any} size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.bankLabel}>{ACCOUNT_TYPE_LABELS[card.type] || card.type}</Text>
              <Text style={styles.bankName}>{card.name}</Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            {onEditCard && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEditCard(card)}
                activeOpacity={0.7}>
                <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {onDeleteCard && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDeletePress}
                activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

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
            {isBalanceVisible ? formatCurrency(balance) : '******'}
          </Text>
        </View>
      </View>
    </LinearGradient>
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
    marginHorizontal: -PARENT_PADDING,
  },
  carousel: {
    width: CAROUSEL_WIDTH,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: CARD_PADDING,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorActive: {
    width: 28,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
