import { BalanceChart } from '@/components/balance-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionCalendar } from '@/components/transaction-calendar';
import { useApp } from '@/contexts/app-context';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

export default function StatsScreen() {
  const { transactions, cards, selectedCardId, isLoading } = useApp();

  const selectedCard = useMemo(() => {
    if (!selectedCardId || cards.length === 0) return null;
    return cards.find((c) => c.id === selectedCardId) || null;
  }, [selectedCardId, cards]);

  const cardTransactions = useMemo(() => {
    if (!selectedCard) return [];
    return transactions.filter((t) => t.accountId === selectedCard.id);
  }, [transactions, selectedCard]);

  const selectedCards = useMemo(() => {
    return selectedCard ? [selectedCard] : [];
  }, [selectedCard]);

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
        <ThemedText type="title">Estadísticas</ThemedText>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {selectedCard ? (
          <>
            <TransactionCalendar transactions={cardTransactions} />
            <BalanceChart transactions={cardTransactions} cards={selectedCards} />
          </>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Selecciona una tarjeta para ver las estadísticas
            </ThemedText>
          </View>
        )}
      </ScrollView>
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Espacio para el tab bar flotante
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
});

