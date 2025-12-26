import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, View } from 'react-native';

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  cardName?: string;
  cardColor?: string;
}

export function BalanceCard({ balance, income, expenses, cardName, cardColor }: BalanceCardProps) {
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = cardColor || (theme === 'dark' ? '#1E40AF' : '#1E3A8A');

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{cardName || 'Balance Total'}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.balanceAmount}>
          ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.cardInfo}>
          <Text style={styles.incomeLabel}>Ingresos</Text>
          <Text style={styles.incomeValue}>
            ${income.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.expenseLabel}>Gastos</Text>
          <Text style={styles.expenseValue}>
            ${expenses.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    color: '#E0E7FF',
    opacity: 0.8,
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: 24,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardInfo: {
    flex: 1,
  },
  incomeLabel: {
    fontSize: 11,
    color: '#4ADE80',
    opacity: 0.9,
    marginBottom: 4,
  },
  incomeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ADE80',
  },
  expenseLabel: {
    fontSize: 11,
    color: '#F87171',
    opacity: 0.9,
    marginBottom: 4,
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F87171',
  },
});

