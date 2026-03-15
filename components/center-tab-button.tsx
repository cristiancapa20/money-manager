import { useApp } from '@/contexts/app-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Alert, StyleSheet, View } from 'react-native';

export function CenterTabButton(props: BottomTabBarButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { selectedCardId, cards, setTransactionModalVisible, setEditingTransaction } = useApp();

  const handlePress = () => {
    if (cards.length === 0 || !selectedCardId) {
      Alert.alert(
        'Sin cuenta',
        'Por favor, crea una cuenta primero antes de agregar transacciones.',
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
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.tint }]}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
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
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
});
