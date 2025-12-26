import type { Transaction } from '@/components/add-transaction-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCategoryInfo } from '@/utils/categories';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TransactionListProps {
  transactions: Transaction[];
  balanceCard?: ReactNode | null;
  onEditTransaction?: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  balanceCard,
  onEditTransaction,
}: TransactionListProps) {
  const theme = useColorScheme() ?? 'light';

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aDate = (a as any).createdAt 
      ? new Date((a as any).createdAt).getTime()
      : (a.id && !isNaN(parseInt(a.id)) ? parseInt(a.id) : 0);
    const bDate = (b as any).createdAt 
      ? new Date((b as any).createdAt).getTime()
      : (b.id && !isNaN(parseInt(b.id)) ? parseInt(b.id) : 0);
    
    return aDate - bDate;
  });

  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      {balanceCard}
      {balanceCard && transactions.length > 0 && (
        <ThemedText type="subtitle" style={styles.title}>
          Transacciones
        </ThemedText>
      )}
    </View>
  );

  const ListEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <Ionicons
        name={balanceCard ? "receipt-outline" : "card-outline"}
        size={48}
        color={theme === 'light' ? '#9CA3AF' : '#6B7280'}
      />
      <ThemedText style={styles.emptyText}>
        {balanceCard ? 'No hay transacciones' : 'Selecciona o crea una tarjeta'}
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        {balanceCard
          ? 'Presiona el botón + para agregar una'
          : 'Usa el selector de tarjetas para comenzar'}
      </ThemedText>
    </ThemedView>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedTransactions}
        keyExtractor={(item, index) => `${item.title}-${index}-${item.amount}`}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onEdit={onEditTransaction}
          />
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
  const theme = useColorScheme() ?? 'light';
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? '#4ADE80' : '#F87171';
  const iconName = isIncome ? 'arrow-up-circle' : 'arrow-down-circle';
  const categoryInfo = getCategoryInfo(transaction.category);

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
            <View style={styles.categoryContainer}>
              <Ionicons
                name={categoryInfo.icon as any}
                size={14}
                color={categoryInfo.color}
              />
              <ThemedText style={[styles.itemCategory, { color: categoryInfo.color }]}>
                {transaction.category}
              </ThemedText>
            </View>
            {transaction.description ? (
              <>
                <ThemedText style={styles.itemSeparator}>•</ThemedText>
                <ThemedText style={styles.itemDescription} numberOfLines={1}>
                  {transaction.description}
                </ThemedText>
              </>
            ) : null}
          </View>
          {(() => {
            let dateTime: string = '';
            if ((transaction as any).createdAt) {
              // La fecha viene en UTC, convertir a zona horaria local
              const utcDate = new Date((transaction as any).createdAt);
              if (!isNaN(utcDate.getTime())) {
                // Usar toLocaleString para obtener la fecha en la zona horaria local
                const day = utcDate.getDate();
                const month = utcDate.toLocaleDateString('es-EC', { month: 'short' });
                const year = utcDate.getFullYear();
                const hours = utcDate.getHours().toString().padStart(2, '0');
                const minutes = utcDate.getMinutes().toString().padStart(2, '0');
                dateTime = `${day} ${month} ${year} • ${hours}:${minutes}`;
              }
            } else if (transaction.id && !isNaN(parseInt(transaction.id))) {
              const date = new Date(parseInt(transaction.id));
              if (!isNaN(date.getTime())) {
                const day = date.getDate();
                const month = date.toLocaleDateString('es-EC', { month: 'short' });
                const year = date.getFullYear();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                dateTime = `${day} ${month} ${year} • ${hours}:${minutes}`;
              }
            }
            
            return dateTime ? (
              <ThemedText style={styles.itemDateTime}>
                {dateTime}
              </ThemedText>
            ) : null;
          })()}
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
        {onEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(transaction)}
            activeOpacity={0.7}>
            <Ionicons
              name="create-outline"
              size={18}
              color={theme === 'light' ? '#666' : '#9CA3AF'}
            />
          </TouchableOpacity>
        )}
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
    gap: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '600',
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
  itemDateTime: {
    fontSize: 11,
    opacity: 0.5,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
});

