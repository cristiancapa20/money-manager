import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { AddTransactionForm } from '@/components/add-transaction-form';
import { useApp } from '@/contexts/app-context';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AddTransactionScreen() {
  const { editingTransaction, setEditingTransaction } = useApp();
  const router = useRouter();

  useEffect(() => {
    return () => {
      // Limpiar la transacción en edición cuando se desmonte el componente
      setEditingTransaction(null);
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">
          {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
        </ThemedText>
      </View>
      <AddTransactionForm
        editingTransaction={editingTransaction}
        onSave={() => setEditingTransaction(null)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
});

