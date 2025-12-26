import { AddTransactionModal, type Transaction } from '@/components/add-transaction-modal';
import { BalanceCard } from '@/components/balance-card';
import { FloatingActionButton } from '@/components/floating-action-button';
import { ThemeSwitch } from '@/components/theme-switch';
import { ThemedView } from '@/components/themed-view';
import { TransactionList } from '@/components/transaction-list';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Calcular totales
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const handleAddTransaction = () => {
    setModalVisible(true);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction]);
    setModalVisible(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemeSwitch />
      </View>
      <TransactionList
        transactions={transactions}
        balanceCard={
          <BalanceCard balance={balance} income={income} expenses={expenses} />
        }
      />
      <FloatingActionButton onPress={handleAddTransaction} />
      <AddTransactionModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveTransaction}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
});
