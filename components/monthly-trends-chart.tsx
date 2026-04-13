import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64;

const SHORT_MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

type MonthRange = 3 | 6 | 12;

const RANGE_OPTIONS: { key: MonthRange; label: string }[] = [
  { key: 3, label: '3M' },
  { key: 6, label: '6M' },
  { key: 12, label: '12M' },
];

interface MonthlyData {
  year: number;
  month: number;
  income: number;
  expense: number;
}

interface MonthlyTrendsChartProps {
  accountId: string;
}

export function MonthlyTrendsChart({ accountId }: MonthlyTrendsChartProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { formatCurrency, formatCompact } = useCurrency();
  const { user } = useAuth();
  const [range, setRange] = useState<MonthRange>(6);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !accountId) return;

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          months: String(range),
          accountId,
          userId: user.id,
        });
        const res = await fetch(`${API_URL}/api/stats/monthly?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          // API returns array of { year, month, income, expense } with amounts in centavos
          setMonthlyData(json);
        }
      } catch (e) {
        if (!cancelled) {
          setError('No se pudieron cargar las tendencias');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [range, accountId, user?.id]);

  const { chartData, maxValue } = useMemo(() => {
    let max = 0;
    const data: any[] = [];

    monthlyData.forEach((m, i) => {
      const income = m.income / 100;
      const expense = m.expense / 100;
      const dayMax = Math.max(income, expense);
      if (dayMax > max) max = dayMax;

      // Normalize month to 0-based index (API may return 1-12)
      const monthIdx = m.month >= 1 && m.month <= 12 ? m.month - 1 : m.month;
      const label =
        range <= 6
          ? SHORT_MONTH_NAMES[monthIdx]
          : `${SHORT_MONTH_NAMES[monthIdx]} ${String(m.year).slice(2)}`;

      // Income bar
      data.push({
        value: income,
        label,
        labelTextStyle: { color: theme.textMuted, fontSize: 9 },
        frontColor: theme.income,
        spacing: 2,
      });

      // Expense bar
      data.push({
        value: expense,
        frontColor: theme.expense,
        spacing: i < monthlyData.length - 1 ? 14 : 0,
      });
    });

    return { chartData: data, maxValue: max };
  }, [monthlyData, range, theme]);

  const { totalIncome, totalExpenses } = useMemo(() => {
    let income = 0;
    let expense = 0;
    monthlyData.forEach((m) => {
      income += m.income / 100;
      expense += m.expense / 100;
    });
    return { totalIncome: income, totalExpenses: expense };
  }, [monthlyData]);

  const hasData = monthlyData.some((m) => m.income > 0 || m.expense > 0);
  const barWidth = range <= 6 ? 10 : 6;

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <ThemedText type="subtitle" style={styles.title}>
        Tendencias Mensuales
      </ThemedText>

      {/* Range selector */}
      <View style={styles.rangeRow}>
        {RANGE_OPTIONS.map((opt) => {
          const active = range === opt.key;
          return (
            <ThemedText
              key={opt.key}
              onPress={() => setRange(opt.key)}
              style={[
                styles.rangeBtn,
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

      {loading ? (
        <View style={styles.emptyChart}>
          <ActivityIndicator size="small" color={theme.tint} />
        </View>
      ) : error ? (
        <View style={styles.emptyChart}>
          <Ionicons name="cloud-offline-outline" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { marginTop: 12 }]}>
            {error}
          </ThemedText>
        </View>
      ) : !hasData ? (
        <View style={styles.emptyChart}>
          <Ionicons name="trending-up-outline" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { marginTop: 12 }]}>
            No hay movimientos en este periodo
          </ThemedText>
        </View>
      ) : (
        <>
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
              barWidth={barWidth}
              noOfSections={4}
              maxValue={maxValue * 1.15 || 100}
              yAxisColor="transparent"
              xAxisColor={theme.border}
              yAxisTextStyle={{ color: theme.textMuted, fontSize: 9 }}
              xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 9 }}
              hideRules={false}
              rulesType="dashed"
              rulesColor={theme.border}
              rulesThickness={0.5}
              dashWidth={4}
              dashGap={4}
              initialSpacing={12}
              endSpacing={8}
              yAxisLabelWidth={50}
              formatYLabel={(value) => formatCompact(parseFloat(value))}
              isAnimated
            />
          </View>
        </>
      )}
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
  rangeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  rangeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
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
