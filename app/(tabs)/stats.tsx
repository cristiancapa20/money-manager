import { BalanceChart } from '@/components/balance-chart';
import { CategoryBreakdown } from '@/components/category-breakdown';
import { MonthlySummary } from '@/components/monthly-summary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useApp } from '@/contexts/app-context';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function StatsScreen() {
  const { transactions, cards, selectedCardId, isLoading } = useApp();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const selectedCard = useMemo(() => {
    if (!selectedCardId || cards.length === 0) return null;
    return cards.find((c) => c.id === selectedCardId) || null;
  }, [selectedCardId, cards]);

  const cardTransactions = useMemo(() => {
    if (!selectedCard) return [];
    return transactions.filter((t) => t.accountId === selectedCard.id);
  }, [transactions, selectedCard]);

  const monthlyTransactions = useMemo(() => {
    return cardTransactions.filter((t) => {
      const d = new Date(t.date || t.createdAt);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [cardTransactions, selectedMonth, selectedYear]);

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    monthlyTransactions.forEach((t) => {
      if (t.type === 'INCOME') income += t.amount;
      else expenses += t.amount;
    });
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
  }, [monthlyTransactions]);

  const selectedCards = useMemo(() => {
    return selectedCard ? [selectedCard] : [];
  }, [selectedCard]);

  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  const handlePrevMonth = useCallback(() => {
    setSelectedMonth((m) => {
      if (m === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setSelectedMonth((m) => {
      if (m === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

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
            <MonthlySummary
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              balance={balance}
              monthLabel={monthLabel}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
            <CategoryBreakdown transactions={monthlyTransactions} />
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
    paddingBottom: 100,
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
