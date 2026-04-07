import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface MonthlySummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthlySummary({
  totalIncome,
  totalExpenses,
  balance,
  monthLabel,
  onPrevMonth,
  onNextMonth,
}: MonthlySummaryProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { formatCurrency } = useCurrency();

  return (
    <ThemedView style={[styles.container, { borderColor: theme.border }]}>
      {/* Month navigator */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={onPrevMonth} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={theme.tint} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.monthLabel}>
          {monthLabel}
        </ThemedText>
        <TouchableOpacity onPress={onNextMonth} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={theme.tint} />
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: theme.incomeBg }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="arrow-down-circle" size={18} color={theme.income} />
            <ThemedText style={[styles.cardLabel, { color: theme.income }]}>
              Ingresos
            </ThemedText>
          </View>
          <ThemedText style={[styles.cardValue, { color: theme.income }]}>
            {formatCurrency(totalIncome)}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.expenseBg }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="arrow-up-circle" size={18} color={theme.expense} />
            <ThemedText style={[styles.cardLabel, { color: theme.expense }]}>
              Gastos
            </ThemedText>
          </View>
          <ThemedText style={[styles.cardValue, { color: theme.expense }]}>
            {formatCurrency(totalExpenses)}
          </ThemedText>
        </View>
      </View>

      {/* Net balance */}
      <View style={[styles.balanceRow, { borderTopColor: theme.border }]}>
        <ThemedText style={styles.balanceLabel}>Balance neto</ThemedText>
        <ThemedText
          style={[
            styles.balanceValue,
            { color: balance >= 0 ? theme.income : theme.expense },
          ]}>
          {formatCurrency(balance)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});
