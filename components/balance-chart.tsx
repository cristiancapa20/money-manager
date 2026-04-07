import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import type { Card } from '@/types/card';
import type { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64;

type Period = '1M' | '3M' | '6M' | '1Y' | 'ALL';

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '6M', label: '6M' },
  { key: '1Y', label: '1Y' },
  { key: 'ALL', label: 'Todo' },
];

function getStartDateForPeriod(period: Period): Date | null {
  if (period === 'ALL') return null;
  const now = new Date();
  const months = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 }[period];
  now.setMonth(now.getMonth() - months);
  return now;
}

interface BalanceChartProps {
  transactions: Transaction[];
  cards: Card[];
}

export function BalanceChart({ transactions, cards }: BalanceChartProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const isDark = scheme === 'dark';
  const { formatCurrency, formatCompact } = useCurrency();
  const [period, setPeriod] = useState<Period>('3M');

  const { chartData, maxBalance, currentBalance, changeAmount, changePercent } = useMemo(() => {
    if (transactions.length === 0) {
      return { chartData: [], maxBalance: 0, currentBalance: 0, changeAmount: 0, changePercent: 0 };
    }

    const initialBalance = cards.reduce((sum, card) => sum + card.initialBalance, 0);
    const startDate = getStartDateForPeriod(period);

    // Group all transactions by date to compute running balance
    const byDate = new Map<string, { income: number; expense: number }>();

    const sorted = [...transactions].sort((a, b) => {
      const da = new Date(a.date || a.createdAt).getTime();
      const db = new Date(b.date || b.createdAt).getTime();
      return da - db;
    });

    sorted.forEach((t) => {
      const d = new Date(t.date || t.createdAt);
      if (isNaN(d.getTime())) return;
      const key = d.toISOString().split('T')[0];

      if (!byDate.has(key)) byDate.set(key, { income: 0, expense: 0 });
      const day = byDate.get(key)!;
      if (t.type === 'INCOME') day.income += t.amount;
      else day.expense += t.amount;
    });

    const allDates = Array.from(byDate.keys()).sort();
    if (allDates.length === 0) {
      return { chartData: [], maxBalance: 0, currentBalance: 0, changeAmount: 0, changePercent: 0 };
    }

    // Compute full running balance series
    let running = initialBalance;
    const fullSeries: { date: string; balance: number }[] = [];

    allDates.forEach((dateKey) => {
      const day = byDate.get(dateKey)!;
      running += day.income - day.expense;
      fullSeries.push({ date: dateKey, balance: running });
    });

    // Filter to period
    const filtered = startDate
      ? fullSeries.filter((p) => new Date(p.date) >= startDate)
      : fullSeries;

    if (filtered.length === 0) {
      return { chartData: [], maxBalance: 0, currentBalance: 0, changeAmount: 0, changePercent: 0 };
    }

    // Downsample if too many points (keep max ~30 for readability)
    const MAX_POINTS = 30;
    const sampled =
      filtered.length <= MAX_POINTS
        ? filtered
        : filtered.filter((_, i) => {
            const step = Math.ceil(filtered.length / MAX_POINTS);
            return i % step === 0 || i === filtered.length - 1;
          });

    const dataPoints = sampled.map((p, i) => {
      const d = new Date(p.date);
      const showLabel =
        sampled.length <= 7 ||
        i === 0 ||
        i === sampled.length - 1 ||
        i % Math.ceil(sampled.length / 5) === 0;

      return {
        value: p.balance,
        label: showLabel ? `${d.getDate()}/${d.getMonth() + 1}` : '',
        labelTextStyle: { color: isDark ? '#999' : '#666', fontSize: 9 },
        dataPointLabelComponent: () => null as any,
      };
    });

    const balances = dataPoints.map((d) => d.value);
    const max = Math.max(...balances);
    const current = balances[balances.length - 1] ?? initialBalance;
    const start = balances[0] ?? initialBalance;
    const change = current - start;
    const pct = start !== 0 ? (change / Math.abs(start)) * 100 : 0;

    return {
      chartData: dataPoints,
      maxBalance: max,
      currentBalance: current,
      changeAmount: change,
      changePercent: pct,
    };
  }, [transactions, cards, isDark, period]);

  const lineColor = isDark ? '#818cf8' : '#4f46e5';
  const gridColor = theme.border;
  const isPositiveChange = changeAmount >= 0;

  if (chartData.length === 0) {
    return (
      <ThemedView style={[styles.container, { borderColor: theme.border }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Gráfica de Balance
        </ThemedText>
        <View style={styles.emptyChart}>
          <Ionicons name="analytics-outline" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { marginTop: 12 }]}>
            No hay suficientes datos para mostrar la gráfica
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <View>
          <ThemedText type="subtitle" style={styles.title}>
            Gráfica de Balance
          </ThemedText>
          <ThemedText
            style={[
              styles.balanceValue,
              { color: currentBalance >= 0 ? theme.income : theme.expense },
            ]}>
            {formatCurrency(currentBalance)}
          </ThemedText>
        </View>
        <View style={styles.changeContainer}>
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: isPositiveChange ? theme.incomeBg : theme.expenseBg },
            ]}>
            <Ionicons
              name={isPositiveChange ? 'trending-up' : 'trending-down'}
              size={14}
              color={isPositiveChange ? theme.income : theme.expense}
            />
            <ThemedText
              style={[
                styles.changeText,
                { color: isPositiveChange ? theme.income : theme.expense },
              ]}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIOD_OPTIONS.map((opt) => {
          const active = period === opt.key;
          return (
            <ThemedText
              key={opt.key}
              onPress={() => setPeriod(opt.key)}
              style={[
                styles.periodBtn,
                {
                  backgroundColor: active ? theme.tint : 'transparent',
                  color: active ? '#fff' : theme.textSecondary,
                },
              ]}>
              {opt.label}
            </ThemedText>
          );
        })}
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          height={180}
          width={CHART_WIDTH}
          spacing={chartData.length > 1 ? (CHART_WIDTH - 60) / (chartData.length - 1) : 0}
          thickness={2.5}
          color={lineColor}
          hideRules={false}
          rulesType="dashed"
          rulesColor={gridColor}
          rulesThickness={0.5}
          dashWidth={4}
          dashGap={4}
          initialSpacing={20}
          endSpacing={20}
          yAxisColor="transparent"
          xAxisColor={gridColor}
          yAxisTextStyle={{ color: isDark ? '#999' : '#666', fontSize: 9 }}
          xAxisLabelTextStyle={{ color: isDark ? '#999' : '#666', fontSize: 9 }}
          maxValue={maxBalance * 1.15}
          noOfSections={4}
          curved
          areaChart
          startFillColor={lineColor}
          endFillColor={isDark ? '#4f46e510' : '#4f46e508'}
          startOpacity={0.3}
          endOpacity={0.05}
          hideDataPoints={chartData.length > 15}
          dataPointsColor={lineColor}
          dataPointsRadius={3}
          focusEnabled
          showStripOnFocus
          stripColor={gridColor}
          stripWidth={1}
          showTextOnFocus
          unFocusOnPressOut
          focusedDataPointColor={lineColor}
          focusedDataPointRadius={5}
          delayBeforeUnFocus={2000}
          textShiftY={-14}
          textShiftX={-15}
          textFontSize={10}
          textColor={theme.text}
          yAxisTextNumberOfLines={1}
          yAxisLabelWidth={50}
          formatYLabel={(value) => formatCompact(parseFloat(value))}
          pointerConfig={{
            pointerStripColor: gridColor,
            pointerStripWidth: 1,
            pointerColor: lineColor,
            radius: 5,
            pointerLabelWidth: 120,
            pointerLabelHeight: 40,
            pointerLabelComponent: (items: any) => {
              const val = items?.[0]?.value ?? 0;
              return (
                <View
                  style={[
                    styles.tooltip,
                    {
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      borderColor: theme.border,
                    },
                  ]}>
                  <ThemedText style={styles.tooltipText}>
                    {formatCurrency(val)}
                  </ThemedText>
                </View>
              );
            },
          }}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  changeContainer: {
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
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
  tooltip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  tooltipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
