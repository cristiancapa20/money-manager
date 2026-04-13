import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency';
import type { Category, Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type TypeFilter = 'ALL' | 'INCOME' | 'EXPENSE';

interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;
}

type DatePreset = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

interface TransactionListProps {
  transactions: Transaction[];
  balanceCard?: ReactNode | null;
  onEditTransaction?: (transaction: Transaction) => void;
}

function getDatePresetRange(preset: DatePreset): DateRange | null {
  if (preset === 'all' || preset === 'custom') return null;
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  if (preset === 'today') return { from: to, to };
  if (preset === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    return { from: d.toISOString().slice(0, 10), to };
  }
  if (preset === 'month') {
    return { from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`, to };
  }
  // year
  return { from: `${now.getFullYear()}-01-01`, to };
}

export function TransactionList({ transactions, balanceCard, onEditTransaction }: TransactionListProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme  = Colors[scheme];
  const { categories } = useApp();
  const { formatCurrency } = useCurrency();

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const hasActiveFilters = typeFilter !== 'ALL' || categoryFilter !== null || datePreset !== 'all';

  const filteredAndSorted = useMemo(() => {
    let filtered = transactions;

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((t) => t.categoryId === categoryFilter);
    }

    // Date filter
    const dateRange = datePreset === 'custom'
      ? (customFrom || customTo ? { from: customFrom, to: customTo } : null)
      : getDatePresetRange(datePreset);

    if (dateRange) {
      filtered = filtered.filter((t) => {
        const txDate = (t.date || t.createdAt).slice(0, 10);
        if (dateRange.from && txDate < dateRange.from) return false;
        if (dateRange.to && txDate > dateRange.to) return false;
        return true;
      });
    }

    return [...filtered].sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.date ? new Date(b.date).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [transactions, typeFilter, categoryFilter, datePreset, customFrom, customTo]);

  const clearFilters = () => {
    setTypeFilter('ALL');
    setCategoryFilter(null);
    setDatePreset('all');
    setCustomFrom('');
    setCustomTo('');
  };

  const listHeader = useMemo(
    () => (
      <View style={styles.headerContainer}>
        {balanceCard}
        {balanceCard && transactions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Transacciones</ThemedText>
              <View style={[styles.countBadge, { backgroundColor: theme.tintLight }]}>
                <Text style={[styles.countText, { color: theme.tint }]}>{filteredAndSorted.length}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={[
                  styles.filterToggle,
                  { backgroundColor: hasActiveFilters ? theme.tint : theme.tintLight },
                ]}
                onPress={() => setFiltersVisible((v) => !v)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="filter"
                  size={14}
                  color={hasActiveFilters ? '#fff' : theme.tint}
                />
                <Text style={[styles.filterToggleText, { color: hasActiveFilters ? '#fff' : theme.tint }]}>
                  Filtros
                </Text>
              </TouchableOpacity>
            </View>

            {filtersVisible && (
              <FilterPanel
                theme={theme}
                scheme={scheme}
                categories={categories}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                datePreset={datePreset}
                setDatePreset={setDatePreset}
                customFrom={customFrom}
                setCustomFrom={setCustomFrom}
                customTo={customTo}
                setCustomTo={setCustomTo}
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
              />
            )}
          </>
        )}
      </View>
    ),
    [balanceCard, transactions.length, filteredAndSorted.length, theme, hasActiveFilters, filtersVisible, categories, typeFilter, categoryFilter, datePreset, customFrom, customTo, scheme, clearFilters],
  );

  const ListEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrap, { backgroundColor: theme.tintLight }]}>
        <Ionicons
          name={balanceCard ? 'receipt-outline' : 'card-outline'}
          size={32}
          color={theme.tint}
        />
      </View>
      <ThemedText style={styles.emptyText}>
        {hasActiveFilters ? 'Sin resultados' : balanceCard ? 'Sin transacciones' : 'Ninguna cuenta seleccionada'}
      </ThemedText>
      <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
        {hasActiveFilters
          ? 'Intenta ajustar los filtros'
          : balanceCard
            ? 'Presiona + para agregar una'
            : 'Usa el selector de cuentas para comenzar'}
      </ThemedText>
    </ThemedView>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredAndSorted}
        keyExtractor={(item, index) => item.id ?? `tx-${index}-${item.amount}`}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} onEdit={onEditTransaction} />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

/* ─── Filter Panel ─────────────────────────────────────────────────────────── */

interface FilterPanelProps {
  theme: (typeof Colors)['light'];
  scheme: 'light' | 'dark';
  categories: Category[];
  typeFilter: TypeFilter;
  setTypeFilter: (v: TypeFilter) => void;
  categoryFilter: string | null;
  setCategoryFilter: (v: string | null) => void;
  datePreset: DatePreset;
  setDatePreset: (v: DatePreset) => void;
  customFrom: string;
  setCustomFrom: (v: string) => void;
  customTo: string;
  setCustomTo: (v: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

function FilterPanel({
  theme, scheme, categories,
  typeFilter, setTypeFilter,
  categoryFilter, setCategoryFilter,
  datePreset, setDatePreset,
  customFrom, setCustomFrom,
  customTo, setCustomTo,
  hasActiveFilters, clearFilters,
}: FilterPanelProps) {
  const typeOptions: { key: TypeFilter; label: string; icon: string }[] = [
    { key: 'ALL',     label: 'Todos',   icon: 'swap-horizontal' },
    { key: 'INCOME',  label: 'Ingreso', icon: 'trending-up' },
    { key: 'EXPENSE', label: 'Gasto',   icon: 'trending-down' },
  ];

  const dateOptions: { key: DatePreset; label: string }[] = [
    { key: 'all',    label: 'Todo' },
    { key: 'today',  label: 'Hoy' },
    { key: 'week',   label: 'Semana' },
    { key: 'month',  label: 'Mes' },
    { key: 'year',   label: 'Año' },
    { key: 'custom', label: 'Personalizado' },
  ];

  return (
    <View style={[styles.filterPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Type filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Tipo</Text>
        <View style={styles.chipRow}>
          {typeOptions.map((opt) => {
            const active = typeFilter === opt.key;
            const chipBg = active
              ? opt.key === 'INCOME' ? theme.incomeBg
              : opt.key === 'EXPENSE' ? theme.expenseBg
              : theme.tintLight
              : theme.divider;
            const chipColor = active
              ? opt.key === 'INCOME' ? theme.income
              : opt.key === 'EXPENSE' ? theme.expense
              : theme.tint
              : theme.textMuted;

            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.chip, { backgroundColor: chipBg }]}
                onPress={() => setTypeFilter(opt.key)}
                activeOpacity={0.7}
              >
                <Ionicons name={opt.icon as any} size={13} color={chipColor} />
                <Text style={[styles.chipText, { color: chipColor, fontWeight: active ? '700' : '500' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Category filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Categoría</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: !categoryFilter ? theme.tintLight : theme.divider }]}
            onPress={() => setCategoryFilter(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: !categoryFilter ? theme.tint : theme.textMuted, fontWeight: !categoryFilter ? '700' : '500' }]}>
              Todas
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, { backgroundColor: active ? cat.color + '22' : theme.divider }]}
                onPress={() => setCategoryFilter(active ? null : cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons name={cat.icon as any} size={13} color={active ? cat.color : theme.textMuted} />
                <Text
                  style={[styles.chipText, { color: active ? cat.color : theme.textMuted, fontWeight: active ? '700' : '500' }]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Date filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Fecha</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {dateOptions.map((opt) => {
            const active = datePreset === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.chip, { backgroundColor: active ? theme.tintLight : theme.divider }]}
                onPress={() => setDatePreset(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: active ? theme.tint : theme.textMuted, fontWeight: active ? '700' : '500' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {datePreset === 'custom' && (
          <View style={styles.dateInputRow}>
            <View style={styles.dateInputWrap}>
              <Text style={[styles.dateInputLabel, { color: theme.textMuted }]}>Desde</Text>
              <TextInput
                style={[styles.dateInput, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={theme.textMuted}
                value={customFrom}
                onChangeText={setCustomFrom}
                maxLength={10}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.dateInputWrap}>
              <Text style={[styles.dateInputLabel, { color: theme.textMuted }]}>Hasta</Text>
              <TextInput
                style={[styles.dateInput, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={theme.textMuted}
                value={customTo}
                onChangeText={setCustomTo}
                maxLength={10}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        )}
      </View>

      {/* Clear filters */}
      {hasActiveFilters && (
        <TouchableOpacity style={[styles.clearBtn, { borderColor: theme.border }]} onPress={clearFilters} activeOpacity={0.7}>
          <Ionicons name="close-circle-outline" size={14} color={theme.expense} />
          <Text style={[styles.clearBtnText, { color: theme.expense }]}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ─── Transaction Item ─────────────────────────────────────────────────────── */

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
}

function TransactionItem({ transaction, onEdit }: TransactionItemProps) {
  const scheme   = useColorScheme() ?? 'light';
  const theme    = Colors[scheme];
  const { formatCurrency } = useCurrency();
  const isIncome = transaction.type === 'INCOME';

  const catColor = transaction.categoryColor ?? '#6b7280';
  const catIcon  = transaction.categoryIcon  ?? 'ellipse-outline';
  const catName  = transaction.category      ?? 'Sin categoría';

  const rawDate = transaction.date
    ? new Date(transaction.date)
    : transaction.createdAt
    ? new Date(transaction.createdAt)
    : null;

  const dateParts = rawDate && !isNaN(rawDate.getTime()) ? {
    day:     rawDate.getDate().toString(),
    dayName: rawDate.toLocaleDateString('es-EC', { weekday: 'short' }).replace('.', '').toUpperCase(),
    month:   rawDate.toLocaleDateString('es-EC', { month: 'short' }).replace('.', '').toUpperCase(),
  } : null;

  return (
    <View style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>

      {dateParts && (
        <View style={[styles.datePanelOuter, { backgroundColor: theme.divider, borderRightColor: theme.border }]}>
          <Text style={[styles.dateDay,     { color: theme.text }]}>{dateParts.day}</Text>
          <Text style={[styles.dateDayName, { color: theme.textSecondary }]}>{dateParts.dayName}</Text>
          <Text style={[styles.dateMonth,   { color: theme.textMuted }]}>{dateParts.month}</Text>
        </View>
      )}

      <View style={styles.itemContent}>
        <View style={styles.itemTop}>
          <View style={[styles.categoryDot, { backgroundColor: catColor + '22' }]}>
            <Ionicons name={catIcon as any} size={18} color={catColor} />
          </View>

          <View style={styles.itemInfo}>
            <Text style={[styles.itemDesc, { color: theme.text }]} numberOfLines={1}>
              {transaction.description}
            </Text>
            <Text style={[styles.itemCategory, { color: scheme === 'dark' ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
              {catName}
            </Text>
          </View>

          <Text style={[styles.itemAmount, { color: isIncome ? theme.income : theme.expense }]}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
        </View>

        <View style={[styles.itemBottom, { borderTopColor: theme.divider }]}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: isIncome ? theme.incomeBg : theme.expenseBg }]}>
              <Ionicons
                name={isIncome ? 'trending-up' : 'trending-down'}
                size={11}
                color={isIncome ? theme.income : theme.expense}
              />
              <Text style={[styles.typeBadgeText, { color: isIncome ? theme.income : theme.expense }]}>
                {isIncome ? 'Ingreso' : 'Gasto'}
              </Text>
            </View>

            {transaction.managedViaLoans && (
              <View style={[styles.loanBadge, { backgroundColor: '#7c3aed18' }]}>
                <Ionicons name="link" size={11} color="#7c3aed" />
                <Text style={styles.loanBadgeText}>Préstamo</Text>
              </View>
            )}

            {transaction.managedViaSubscriptions && (
              <View style={[styles.subscriptionBadge, { backgroundColor: '#0891b218' }]}>
                <Ionicons name="repeat" size={11} color="#0891b2" />
                <Text style={styles.subscriptionBadgeText}>Automática</Text>
              </View>
            )}
          </View>

          {onEdit && !transaction.managedViaLoans && !transaction.managedViaSubscriptions && (
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: theme.tintLight }]}
              onPress={() => onEdit(transaction)}
              activeOpacity={0.7}>
              <Ionicons name="pencil-outline" size={14} color={theme.tint} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

/* ─── Styles ───────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container:       { flex: 1 },
  headerContainer: { paddingHorizontal: 20 },
  listContent:     { paddingHorizontal: 16, paddingBottom: 90 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  countBadge:   { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText:    { fontSize: 12, fontWeight: '700' },

  // Filter toggle button
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  filterToggleText: { fontSize: 12, fontWeight: '600' },

  // Filter panel
  filterPanel: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  filterSection: { gap: 6 },
  filterLabel:   { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  chipRow:    { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chipScroll: { gap: 6, paddingRight: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: { fontSize: 12 },

  // Date inputs
  dateInputRow:   { flexDirection: 'row', gap: 8, marginTop: 6 },
  dateInputWrap:  { flex: 1, gap: 2 },
  dateInputLabel: { fontSize: 10, fontWeight: '600' },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
  },

  // Clear button
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderTopWidth: 1,
    marginTop: 2,
  },
  clearBtnText: { fontSize: 12, fontWeight: '600' },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText:    { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  emptySubtext: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Transaction item
  item: {
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  datePanelOuter: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRightWidth: 1,
  },
  dateDay:     { fontSize: 20, fontWeight: '700', lineHeight: 22 },
  dateDayName: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  dateMonth:   { fontSize: 10, marginTop: 1 },

  itemContent: { flex: 1 },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 10,
  },

  categoryDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  itemInfo:     { flex: 1, gap: 2 },
  itemDesc:     { fontSize: 13, fontWeight: '600' },
  itemCategory: { fontSize: 11, fontWeight: '500' },
  itemAmount:   { fontSize: 14, fontWeight: '700', flexShrink: 0 },

  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopWidth: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  loanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  loanBadgeText: { fontSize: 11, fontWeight: '600', color: '#7c3aed' },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subscriptionBadgeText: { fontSize: 11, fontWeight: '600', color: '#0891b2' },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
