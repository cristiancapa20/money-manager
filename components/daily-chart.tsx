import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import type { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CartesianChart, BarGroup } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';

const CHART_FONT = require('@/assets/fonts/Roboto-Medium.ttf');

interface DailyChartProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
}

interface DailyDataPoint {
  day: number;
  income: number;
  expense: number;
}

export function DailyChart({ transactions, selectedMonth, selectedYear }: DailyChartProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { formatCurrency } = useCurrency();
  const font = useFont(CHART_FONT, 10);

  const { chartData, totalIncome, totalExpenses } = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const dailyTotals: { income: number; expense: number }[] = Array.from(
      { length: daysInMonth },
      () => ({ income: 0, expense: 0 }),
    );

    transactions.forEach((t) => {
      const d = new Date(t.date || t.createdAt);
      if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return;
      const day = d.getDate() - 1;
      if (t.type === 'INCOME') dailyTotals[day].income += t.amount;
      else dailyTotals[day].expense += t.amount;
    });

    let incomeSum = 0;
    let expenseSum = 0;

    const data: DailyDataPoint[] = dailyTotals.map((day, i) => {
      incomeSum += day.income;
      expenseSum += day.expense;
      return {
        day: i + 1,
        income: day.income,
        expense: day.expense,
      };
    });

    return {
      chartData: data,
      totalIncome: incomeSum,
      totalExpenses: expenseSum,
    };
  }, [transactions, selectedMonth, selectedYear]);

  const hasData = totalIncome > 0 || totalExpenses > 0;

  if (!hasData) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Ingresos y Gastos Diarios
        </ThemedText>
        <View style={styles.emptyChart}>
          <Ionicons name="bar-chart-outline" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { marginTop: 12 }]}>
            No hay movimientos en este mes
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <ThemedText type="subtitle" style={styles.title}>
        Ingresos y Gastos Diarios
      </ThemedText>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.income }]} />
          <ThemedText style={styles.legendText}>
            Ingresos: {formatCurrency(totalIncome)}
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.expense }]} />
          <ThemedText style={styles.legendText}>
            Gastos: {formatCurrency(totalExpenses)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <CartesianChart
          data={chartData}
          xKey="day"
          yKeys={['income', 'expense']}
          domainPadding={{ left: 10, right: 10, top: 20 }}
          axisOptions={{
            font,
            tickCount: { x: 6, y: 4 },
            labelColor: theme.textMuted,
            lineColor: theme.border,
          }}
        >
          {({ points, chartBounds }) => (
            <BarGroup chartBounds={chartBounds} betweenGroupPadding={0.3} withinGroupPadding={0.1}>
              <BarGroup.Bar
                points={points.income}
                color={theme.income}
                animate={{ type: 'spring' }}
              />
              <BarGroup.Bar
                points={points.expense}
                color={theme.expense}
                animate={{ type: 'spring' }}
              />
            </BarGroup>
          )}
        </CartesianChart>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.8,
  },
  chartContainer: {
    height: 220,
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
});
