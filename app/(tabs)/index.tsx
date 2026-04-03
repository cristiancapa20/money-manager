import { AddCardModal } from '@/components/add-card-modal';
import { AddTransactionModal } from '@/components/add-transaction-modal';
import { CardCarousel } from '@/components/card-carousel';
import { CardSelector } from '@/components/card-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionList } from '@/components/transaction-list';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/types/card';
import type { Transaction } from '@/types/transaction';
import { ThemeSwitch } from '@/components/theme-switch';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const {
    transactions,
    cards,
    selectedCardId,
    setSelectedCardId,
    addCard,
    updateCard,
    deleteCard,
    setEditingTransaction,
    editingTransaction,
    transactionModalVisible,
    setTransactionModalVisible,
    addTransaction,
    updateTransaction,
    isLoading,
  } = useApp();

  const { user } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const theme  = Colors[scheme];
  const router = useRouter();

  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const selectedCardIndex = useMemo(() => {
    if (!selectedCardId || cards.length === 0) return 0;
    const index = cards.findIndex((c) => c.id === selectedCardId);
    return index >= 0 ? index : 0;
  }, [selectedCardId, cards]);

  const selectedCard = cards[selectedCardIndex];

  const cardTransactions = selectedCard
    ? transactions.filter((t) => t.accountId === selectedCard.id)
    : [];

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionModalVisible(true);
  };

  const handleSaveTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt' | 'userId' | 'deletedAt'>) => {
    try {
      if (editingTransaction?.id) {
        await updateTransaction({ ...editingTransaction, ...tx });
      } else {
        await addTransaction(tx);
      }
      setTransactionModalVisible(false);
      setEditingTransaction(null);
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'No se pudo guardar la transacción');
    }
  };

  const handleSaveCard = async (cardData: Omit<Card, 'id' | 'userId'>) => {
    try {
      if (editingCard) {
        await updateCard({ ...editingCard, ...cardData });
      } else {
        await addCard(cardData);
      }
      setCardModalVisible(false);
      setEditingCard(null);
    } catch (error) {
      console.error('Error al guardar tarjeta:', error);
    }
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setCardModalVisible(true);
  };

  // Iniciales para el avatar de texto
  const initials = (user?.displayName || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <ThemedText style={styles.loadingText}>Cargando datos...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header con saludo + avatar de perfil */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Hola,</Text>
          <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
            {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <ThemeSwitch />
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: theme.tintLight }]}
            onPress={() => router.push('/(tabs)/settings')}
            activeOpacity={0.8}>
            <Ionicons name="settings-outline" size={20} color={theme.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.avatarBtn, { borderColor: theme.tintBorder }]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}>
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: theme.tintLight }]}>
                <Text style={[styles.avatarInitials, { color: theme.tint }]}>{initials}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <CardSelector
        cards={cards}
        selectedCardId={selectedCardId}
        onSelectCard={setSelectedCardId}
        onAddCard={() => setCardModalVisible(true)}
      />

      <TransactionList
        transactions={cardTransactions}
        balanceCard={
          cards.length > 0 ? (
            <CardCarousel
              cards={cards}
              selectedCardIndex={selectedCardIndex}
              onCardChange={(index) => {
                if (index >= 0 && index < cards.length) setSelectedCardId(cards[index].id);
              }}
              transactions={transactions}
              onDeleteCard={deleteCard}
              onEditCard={handleEditCard}
            />
          ) : null
        }
        onEditTransaction={handleEditTransaction}
      />

      <AddTransactionModal
        visible={transactionModalVisible}
        onClose={() => { setTransactionModalVisible(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        accountId={selectedCardId}
        editingTransaction={editingTransaction}
      />

      <AddCardModal
        visible={cardModalVisible}
        onClose={() => { setCardModalVisible(false); setEditingCard(null); }}
        onSave={handleSaveCard}
        editingCard={editingCard}
        transactions={transactions}
      />

    </ThemedView>
  );
}

const AVATAR = 40;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 10,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { fontSize: 13, fontWeight: '500' },
  userName: { fontSize: 20, fontWeight: '700', marginTop: 1 },

  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  // Avatar
  avatarBtn: {
    position: 'relative',
    borderRadius: AVATAR / 2,
    borderWidth: 2,
  },
  avatarImg: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },
  avatarFallback: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { fontSize: 15, fontWeight: '700' },
  avatarBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
