import { useApp } from '@/contexts/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Alert, StyleSheet, View } from 'react-native';

export function CenterTabButton(props: BottomTabBarButtonProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const { selectedCardId, cards, setTransactionModalVisible, setEditingTransaction } = useApp();

  const handlePress = () => {
    if (cards.length === 0 || !selectedCardId) {
      Alert.alert(
        'Sin tarjeta',
        'Por favor, crea una tarjeta primero antes de agregar transacciones.',
        [{ text: 'OK' }]
      );
      return;
    }
    setEditingTransaction(null);
    setTransactionModalVisible(true);
  };

  return (
    <PlatformPressable
      {...props}
      style={[styles.button, props.style]}
      onPress={handlePress}>
      <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3701e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDark: {
    backgroundColor: '#f3701e',
  },
});

