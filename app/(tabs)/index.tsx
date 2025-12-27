import { AddCardModal } from '@/components/add-card-modal';
import { AddTransactionModal, type Transaction } from '@/components/add-transaction-modal';
import { CardCarousel } from '@/components/card-carousel';
import { CardSelector } from '@/components/card-selector';
import { ThemeSwitch } from '@/components/theme-switch';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionList } from '@/components/transaction-list';
import { useApp } from '@/contexts/app-context';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const {
    transactions,
    cards,
    selectedCardId,
    setSelectedCardId,
    addCard,
    deleteCard,
    setEditingTransaction,
    editingTransaction,
    transactionModalVisible,
    setTransactionModalVisible,
    addTransaction,
    updateTransaction,
    isLoading,
  } = useApp();
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const router = useRouter();

  // Obtener índice de la tarjeta seleccionada
  const selectedCardIndex = useMemo(() => {
    if (!selectedCardId || cards.length === 0) return 0;
    const index = cards.findIndex((c) => c.id === selectedCardId);
    return index >= 0 ? index : 0;
  }, [selectedCardId, cards]);

  // Obtener tarjeta seleccionada
  const selectedCard = cards[selectedCardIndex];

  // Filtrar transacciones de la tarjeta seleccionada
  const cardTransactions = selectedCard
    ? transactions.filter((t) => t.cardId === selectedCard.id)
    : [];

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionModalVisible(true);
  };

  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      if (transaction.id) {
        await updateTransaction(transaction);
      } else {
        await addTransaction(transaction);
      }
      setTransactionModalVisible(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error al guardar transacción:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleCloseTransactionModal = () => {
    setTransactionModalVisible(false);
    setEditingTransaction(null);
  };

  const handleSaveCard = async (cardData: { name: string; initialBalance: number; color?: string }) => {
    try {
      const newCard = {
        ...cardData,
        id: Date.now().toString(),
      };
      await addCard(newCard);
      setSelectedCardId(newCard.id);
      setCardModalVisible(false);
    } catch (error) {
      console.error('Error al guardar tarjeta:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleCardChangeByIndex = (index: number) => {
    if (index >= 0 && index < cards.length) {
      setSelectedCardId(cards[index].id);
    }
  };

  const handleCloseCardModal = () => {
    setCardModalVisible(false);
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Cargando datos...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemeSwitch />
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
              onCardChange={handleCardChangeByIndex}
              transactions={transactions}
              onDeleteCard={deleteCard}
            />
          ) : null
        }
        onEditTransaction={handleEditTransaction}
      />
      <AddTransactionModal
        visible={transactionModalVisible}
        onClose={handleCloseTransactionModal}
        onSave={handleSaveTransaction}
        cardId={selectedCardId}
        editingTransaction={editingTransaction}
      />
      <AddCardModal
        visible={cardModalVisible}
        onClose={handleCloseCardModal}
        onSave={handleSaveCard}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
});
