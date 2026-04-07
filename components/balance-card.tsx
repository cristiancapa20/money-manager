import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  cardName?: string;
  cardColor?: string;
}

export function BalanceCard({ balance, income, expenses, cardName, cardColor }: BalanceCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { formatCurrency } = useCurrency();
  const backgroundColor = cardColor || theme.tint;

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{cardName || 'Balance Total'}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.balanceAmount}>
          {formatCurrency(balance)}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.cardInfo}>
          <Text style={styles.incomeLabel}>Ingresos</Text>
          <Text style={styles.incomeValue}>
            {formatCurrency(income)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardInfo}>
          <Text style={styles.expenseLabel}>Gastos</Text>
          <Text style={styles.expenseValue}>
            {formatCurrency(expenses)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardBody: {
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    gap: 16,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardInfo: {
    flex: 1,
  },
  incomeLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  incomeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#86efac',
  },
  expenseLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expenseValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fca5a5',
  },
});
