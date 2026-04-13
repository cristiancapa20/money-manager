import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Pie, PolarChart } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';

const CHART_FONT = require('@/assets/fonts/Roboto-Medium.ttf');
import type { Transaction } from '@/types/transaction';

const FALLBACK_COLORS = [
  '#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  icon: string;
  percentage: number;
}

export function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { formatCurrency } = useCurrency();
  const font = useFont(CHART_FONT, 11);

  const { categories, totalExpenses } = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'EXPENSE');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);

    const grouped = new Map<string, { amount: number; color: string; icon: string }>();

    expenses.forEach((t) => {
      const key = t.category || 'Sin categoria';
      const existing = grouped.get(key);
      if (existing) {
        existing.amount += t.amount;
      } else {
        grouped.set(key, {
          amount: t.amount,
          color: t.categoryColor || '',
          icon: t.categoryIcon || 'help-circle',
        });
      }
    });

    const sorted = Array.from(grouped.entries())
      .map(([name, data], index): CategoryData => ({
        name,
        amount: data.amount,
        color: data.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
        icon: data.icon,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { categories: sorted, totalExpenses: total };
  }, [transactions]);

  if (categories.length === 0) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Gastos por Categoria
        </ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No hay gastos en este periodo
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const pieData = categories.map((cat) => ({
    label: cat.name,
    value: cat.amount,
    color: cat.color,
  }));

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <ThemedText type="subtitle" style={styles.title}>
        Gastos por Categoria
      </ThemedText>

      {/* Pie chart */}
      <View style={styles.chartWrapper}>
        <PolarChart
          data={pieData}
          labelKey="label"
          valueKey="value"
          colorKey="color"
          containerStyle={styles.polarContainer}
        >
          <Pie.Chart innerRadius="55%">
            {({ slice }) => (
              <Pie.Slice>
                <Pie.Label
                  font={font}
                  color={theme.text}
                  text={`${Math.round((slice.value / totalExpenses) * 100)}%`}
                  radiusOffset={0.6}
                />
              </Pie.Slice>
            )}
          </Pie.Chart>
        </PolarChart>
        <View style={styles.centerOverlay}>
          <ThemedText style={styles.centerAmount}>
            {formatCurrency(totalExpenses)}
          </ThemedText>
          <ThemedText style={[styles.centerSubtext, { color: theme.textSecondary }]}>
            Total
          </ThemedText>
        </View>
      </View>

      {/* Category list */}
      <View style={styles.list}>
        {categories.map((cat) => (
          <View key={cat.name} style={[styles.listItem, { borderBottomColor: theme.divider }]}>
            <View style={styles.listItemLeft}>
              <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={cat.color}
                style={styles.catIcon}
              />
              <ThemedText style={styles.catName} numberOfLines={1}>
                {cat.name}
              </ThemedText>
            </View>
            <View style={styles.listItemRight}>
              <ThemedText style={styles.catAmount}>
                {formatCurrency(cat.amount)}
              </ThemedText>
              <ThemedText style={[styles.catPercent, { color: theme.textSecondary }]}>
                {cat.percentage.toFixed(1)}%
              </ThemedText>
            </View>
          </View>
        ))}
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
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    height: 200,
  },
  polarContainer: {
    height: 200,
    width: 200,
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  centerSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  list: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catIcon: {
    marginLeft: 8,
  },
  catName: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  catAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  catPercent: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
});
