import type { Transaction } from '@/components/add-transaction-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface TransactionListProps {
  transactions: Transaction[];
  balanceCard?: ReactNode;
}

export function TransactionList({ transactions, balanceCard }: TransactionListProps) {
  const theme = useColorScheme() ?? 'light';

  // Ordenar transacciones: más recientes primero
  const sortedTransactions = [...transactions].reverse();

  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      {balanceCard}
      {transactions.length > 0 && (
        <ThemedText type="subtitle" style={styles.title}>
          Transacciones
        </ThemedText>
      )}
    </View>
  );

  const ListEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <Ionicons
        name="receipt-outline"
        size={48}
        color={theme === 'light' ? '#9CA3AF' : '#6B7280'}
      />
      <ThemedText style={styles.emptyText}>No hay transacciones</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Presiona el botón + para agregar una
      </ThemedText>
    </ThemedView>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedTransactions}
        keyExtractor={(item, index) => `${item.title}-${index}-${item.amount}`}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
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
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const theme = useColorScheme() ?? 'light';
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? '#4ADE80' : '#F87171';
  const iconName = isIncome ? 'arrow-up-circle' : 'arrow-down-circle';

  return (
    <ThemedView
      style={[
        styles.item,
        theme === 'dark' && styles.itemDark,
      ]}>
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.iconContainer,
            isIncome ? styles.iconContainerIncome : styles.iconContainerExpense,
          ]}>
          <Ionicons name={iconName} size={20} color={isIncome ? '#4ADE80' : '#F87171'} />
        </View>
        <View style={styles.itemInfo}>
          <ThemedText type="defaultSemiBold" style={styles.itemTitle}>
            {transaction.title}
          </ThemedText>
          <View style={styles.itemMeta}>
            <ThemedText style={styles.itemCategory}>{transaction.category}</ThemedText>
            {transaction.description ? (
              <>
                <ThemedText style={styles.itemSeparator}>•</ThemedText>
                <ThemedText style={styles.itemDescription} numberOfLines={1}>
                  {transaction.description}
                </ThemedText>
              </>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.itemAmount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}$
          {transaction.amount.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Espacio para el botón flotante y tab bar
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.5,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemDark: {
    backgroundColor: '#1F1F1F',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerIncome: {
    backgroundColor: '#D1FAE5',
  },
  iconContainerExpense: {
    backgroundColor: '#FEE2E2',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemCategory: {
    fontSize: 12,
    opacity: 0.6,
  },
  itemSeparator: {
    fontSize: 12,
    opacity: 0.4,
    marginHorizontal: 6,
  },
  itemDescription: {
    fontSize: 12,
    opacity: 0.6,
    flex: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});

