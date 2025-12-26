import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/types/card';
import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { Transaction } from './add-transaction-modal';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64; // 32px padding on each side

interface BalanceChartProps {
  transactions: Transaction[];
  cards: Card[];
}

export function BalanceChart({ transactions, cards }: BalanceChartProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  // Calcular datos del gráfico
  const { chartData, maxBalance, minBalance, currentBalance } = useMemo(() => {
    if (transactions.length === 0) {
      return { chartData: [], maxBalance: 0, minBalance: 0, currentBalance: 0 };
    }

    // Obtener balance inicial total de todas las tarjetas
    const initialBalance = cards.reduce((sum, card) => sum + card.initialBalance, 0);

    // Agrupar transacciones por fecha y calcular balance acumulado
    const transactionsByDate = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      let date: Date;
      if ((transaction as any).createdAt) {
        date = new Date((transaction as any).createdAt);
      } else if (transaction.id && !isNaN(parseInt(transaction.id))) {
        date = new Date(parseInt(transaction.id));
      } else {
        return;
      }

      if (isNaN(date.getTime())) return;

      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!transactionsByDate.has(dateKey)) {
        transactionsByDate.set(dateKey, { income: 0, expense: 0 });
      }

      const dayData = transactionsByDate.get(dateKey)!;
      if (transaction.type === 'income') {
        dayData.income += transaction.amount;
      } else {
        dayData.expense += transaction.amount;
      }
    });

    // Convertir a array y ordenar por fecha
    const sortedDates = Array.from(transactionsByDate.keys()).sort();

    // Calcular balance acumulado
    let runningBalance = initialBalance;
    const dataPoints: { value: number; label: string; labelTextStyle?: any }[] = [];

    // Agregar punto inicial si hay transacciones
    if (sortedDates.length > 0) {
      const firstDate = new Date(sortedDates[0]);
      firstDate.setDate(firstDate.getDate() - 1);
      const label = `${firstDate.getDate()}/${firstDate.getMonth() + 1}`;
      dataPoints.push({
        value: initialBalance,
        label,
        labelTextStyle: { color: isDark ? '#999' : '#666', fontSize: 10 },
      });
    }

    sortedDates.forEach((dateKey, index) => {
      const dayData = transactionsByDate.get(dateKey)!;
      runningBalance = runningBalance + dayData.income - dayData.expense;
      const date = new Date(dateKey);
      const label = index % Math.ceil(sortedDates.length / 5) === 0 || index === sortedDates.length - 1
        ? `${date.getDate()}/${date.getMonth() + 1}`
        : '';
      
      dataPoints.push({
        value: runningBalance,
        label,
        labelTextStyle: { color: isDark ? '#999' : '#666', fontSize: 10 },
      });
    });

    const balances = dataPoints.map((d) => d.value);
    const max = Math.max(...balances, initialBalance);
    const min = Math.min(...balances, 0);
    const current = balances[balances.length - 1] || initialBalance;

    return {
      chartData: dataPoints,
      maxBalance: max,
      minBalance: min,
      currentBalance: current,
    };
  }, [transactions, cards, isDark]);

  if (chartData.length === 0) {
    return (
      <ThemedView style={[styles.container, isDark && styles.containerDark]}>
        <ThemedText type="subtitle" style={styles.title}>
          Gráfica de Balance
        </ThemedText>
        <View style={styles.emptyChart}>
          <ThemedText style={styles.emptyText}>
            No hay suficientes datos para mostrar la gráfica
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const textColor = isDark ? '#fff' : '#000';
  const gridColor = isDark ? '#333' : '#E5E5E5';
  const lineColor = isDark ? '#60A5FA' : '#1E3A8A';

  return (
    <ThemedView style={[styles.container, isDark && styles.containerDark]}>
      <ThemedText type="subtitle" style={styles.title}>
        Gráfica de Balance
      </ThemedText>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          height={200}
          width={CHART_WIDTH}
          spacing={chartData.length > 1 ? (CHART_WIDTH - 60) / (chartData.length - 1) : 0}
          thickness={3}
          color={lineColor}
          hideRules={false}
          rulesType="solid"
          rulesColor={gridColor}
          rulesThickness={1}
          initialSpacing={20}
          endSpacing={20}
          yAxisColor={gridColor}
          xAxisColor={gridColor}
          yAxisTextStyle={{ color: isDark ? '#999' : '#666', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: isDark ? '#999' : '#666', fontSize: 10 }}
          maxValue={maxBalance * 1.1}
          noOfSections={4}
          curved
          areaChart
          startFillColor={lineColor}
          endFillColor={isDark ? '#1E3A8A30' : '#1E3A8A15'}
          startOpacity={0.4}
          endOpacity={0.1}
          hideDataPoints={chartData.length > 10}
          dataPointsColor={lineColor}
          dataPointsRadius={4}
          textShiftY={-10}
          textShiftX={-5}
          textFontSize={10}
          textColor={textColor}
          yAxisTextNumberOfLines={1}
          yAxisLabelWidth={50}
          formatYLabel={(value) => {
            const num = parseFloat(value);
            if (num >= 1000) {
              return `$${(num / 1000).toFixed(1)}k`;
            }
            return `$${num.toFixed(0)}`;
          }}
        />
      </View>

      {/* Balance actual */}
      <View style={styles.balanceInfo}>
        <ThemedText style={styles.balanceLabel}>Balance Actual:</ThemedText>
        <ThemedText
          style={[
            styles.balanceValue,
            { color: currentBalance >= 0 ? '#4ADE80' : '#F87171' },
          ]}>
          ${currentBalance.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1F1F1F',
  },
  title: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    overflow: 'hidden',
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});
