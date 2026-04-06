import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TransactionListProps {
  transactions: Transaction[];
  balanceCard?: ReactNode | null;
  onEditTransaction?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, balanceCard, onEditTransaction }: TransactionListProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme  = Colors[scheme];

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : new Date(a.createdAt).getTime();
    const bTime = b.date ? new Date(b.date).getTime() : new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      {balanceCard}
      {balanceCard && transactions.length > 0 && (
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Transacciones</ThemedText>
          <View style={[styles.countBadge, { backgroundColor: theme.tintLight }]}>
            <Text style={[styles.countText, { color: theme.tint }]}>{transactions.length}</Text>
          </View>
        </View>
      )}
    </View>
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
        {balanceCard ? 'Sin transacciones' : 'Ninguna cuenta seleccionada'}
      </ThemedText>
      <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
        {balanceCard
          ? 'Presiona + para agregar una'
          : 'Usa el selector de cuentas para comenzar'}
      </ThemedText>
    </ThemedView>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedTransactions}
        keyExtractor={(item, index) => item.id ?? `tx-${index}-${item.amount}`}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} onEdit={onEditTransaction} />
        )}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
}

function TransactionItem({ transaction, onEdit }: TransactionItemProps) {
  const scheme   = useColorScheme() ?? 'light';
  const theme    = Colors[scheme];
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
            {isIncome ? '+' : '-'}${transaction.amount.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={[styles.itemBottom, { borderTopColor: theme.divider }]}>
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

          {onEdit && (
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
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
