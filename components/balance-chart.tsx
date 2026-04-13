import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import type { Card } from '@/types/card';
import type { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CartesianChart, Line, Area } from 'victory-native';
import { useFont, LinearGradient, vec } from '@shopify/react-native-skia';

const CHART_FONT = require('@/assets/fonts/Roboto-Medium.ttf');

const CHART_HEIGHT = 200;

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

interface BalanceDataPoint {
  index: number;
  balance: number;
  label: string;
}

export function BalanceChart({ transactions, cards }: BalanceChartProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { formatCurrency } = useCurrency();
  const [period, setPeriod] = useState<Period>('3M');
  const font = useFont(CHART_FONT, 10);

  const { chartData, currentBalance, changeAmount, changePercent } = useMemo(() => {
    if (transactions.length === 0) {
      return { chartData: [], currentBalance: 0, changeAmount: 0, changePercent: 0 };
    }

    const initialBalance = cards.reduce((sum, card) => sum + card.initialBalance, 0);
    const startDate = getStartDateForPeriod(period);

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
      return { chartData: [], currentBalance: 0, changeAmount: 0, changePercent: 0 };
    }

    let running = initialBalance;
    const fullSeries: { date: string; balance: number }[] = [];

    allDates.forEach((dateKey) => {
      const day = byDate.get(dateKey)!;
      running += day.income - day.expense;
      fullSeries.push({ date: dateKey, balance: running });
    });

    const filtered = startDate
      ? fullSeries.filter((p) => new Date(p.date) >= startDate)
      : fullSeries;

    if (filtered.length === 0) {
      return { chartData: [], currentBalance: 0, changeAmount: 0, changePercent: 0 };
    }

    const MAX_POINTS = 30;
    const sampled =
      filtered.length <= MAX_POINTS
        ? filtered
        : filtered.filter((_, i) => {
            const step = Math.ceil(filtered.length / MAX_POINTS);
            return i % step === 0 || i === filtered.length - 1;
          });

    const dataPoints: BalanceDataPoint[] = sampled.map((p, i) => {
      const d = new Date(p.date);
      const showLabel =
        sampled.length <= 7 ||
        i === 0 ||
        i === sampled.length - 1 ||
        i % Math.ceil(sampled.length / 5) === 0;

      return {
        index: i,
        balance: p.balance,
        label: showLabel ? `${d.getDate()}/${d.getMonth() + 1}` : '',
      };
    });

    const balances = dataPoints.map((d) => d.balance);
    const current = balances[balances.length - 1] ?? initialBalance;
    const start = balances[0] ?? initialBalance;
    const change = current - start;
    const pct = start !== 0 ? (change / Math.abs(start)) * 100 : 0;

    return {
      chartData: dataPoints,
      currentBalance: current,
      changeAmount: change,
      changePercent: pct,
    };
  }, [transactions, cards, period]);

  const lineColor = theme.tint;
  const isPositiveChange = changeAmount >= 0;

  if (chartData.length === 0) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Grafica de Balance
        </ThemedText>
        <View style={styles.emptyChart}>
          <Ionicons name="analytics-outline" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { marginTop: 12 }]}>
            No hay suficientes datos para mostrar la grafica
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <View>
          <ThemedText type="subtitle" style={styles.title}>
            Grafica de Balance
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
        <CartesianChart
          data={chartData}
          xKey="index"
          yKeys={['balance']}
          domainPadding={{ top: 20, bottom: 5 }}
          axisOptions={{
            font,
            tickCount: { x: 5, y: 4 },
            labelColor: theme.textMuted,
            lineColor: theme.border,
            formatXLabel: (val) => {
              const point = chartData.find((d) => d.index === val);
              return point?.label ?? '';
            },
          }}
        >
          {({ points, chartBounds }) => (
            <>
              <Area
                points={points.balance}
                y0={chartBounds.bottom}
                animate={{ type: 'spring' }}
                curveType="natural"
              >
                <LinearGradient
                  start={vec(0, chartBounds.top)}
                  end={vec(0, chartBounds.bottom)}
                  colors={[`${lineColor}40`, `${lineColor}05`]}
                />
              </Area>
              <Line
                points={points.balance}
                color={lineColor}
                strokeWidth={2.5}
                animate={{ type: 'spring' }}
                curveType="natural"
              />
            </>
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
    height: CHART_HEIGHT,
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
