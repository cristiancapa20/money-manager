import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import type { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64;

interface DailyChartProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
}

export function DailyChart({ transactions, selectedMonth, selectedYear }: DailyChartProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { formatCurrency, formatCompact } = useCurrency();

  const { chartData, maxValue, totalIncome, totalExpenses } = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    // Initialize daily totals for every day of the month
    const dailyTotals: { income: number; expense: number }[] = Array.from(
      { length: daysInMonth },
      () => ({ income: 0, expense: 0 }),
    );

    // Accumulate transactions into their respective days
    transactions.forEach((t) => {
      const d = new Date(t.date || t.createdAt);
      if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return;
      const day = d.getDate() - 1;
      if (t.type === 'INCOME') dailyTotals[day].income += t.amount;
      else dailyTotals[day].expense += t.amount;
    });

    let incomeSum = 0;
    let expenseSum = 0;
    let max = 0;

    const data: any[] = [];

    dailyTotals.forEach((day, i) => {
      incomeSum += day.income;
      expenseSum += day.expense;
      const dayMax = Math.max(day.income, day.expense);
      if (dayMax > max) max = dayMax;

      // Show label every ~5 days for readability
      const dayNum = i + 1;
      const showLabel = dayNum === 1 || dayNum % 5 === 0 || dayNum === daysInMonth;

      // Income bar (first in pair)
      data.push({
        value: day.income,
        label: showLabel ? `${dayNum}` : '',
        labelTextStyle: { color: theme.textMuted, fontSize: 8 },
        frontColor: theme.income,
        spacing: 1,
      });

      // Expense bar (second in pair)
      data.push({
        value: day.expense,
        frontColor: theme.expense,
        spacing: i < daysInMonth - 1 ? 6 : 0,
      });
    });

    return {
      chartData: data,
      maxValue: max,
      totalIncome: incomeSum,
      totalExpenses: expenseSum,
    };
  }, [transactions, selectedMonth, selectedYear, theme]);

  const hasData = totalIncome > 0 || totalExpenses > 0;

  if (!hasData) {
    return (
      <ThemedView style={[styles.container, { borderColor: theme.border }]}>
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
    <ThemedView style={[styles.container, { borderColor: theme.border }]}>
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
        <BarChart
          data={chartData}
          height={180}
          width={CHART_WIDTH}
          barWidth={4}
          noOfSections={4}
          maxValue={maxValue * 1.15 || 100}
          yAxisColor="transparent"
          xAxisColor={theme.border}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 9 }}
          xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 8 }}
          hideRules={false}
          rulesType="dashed"
          rulesColor={theme.border}
          rulesThickness={0.5}
          dashWidth={4}
          dashGap={4}
          initialSpacing={8}
          endSpacing={8}
          yAxisLabelWidth={50}
          formatYLabel={(value) => formatCompact(parseFloat(value))}
          isAnimated
        />
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
