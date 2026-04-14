import { useApp } from '@/contexts/app-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Alert, StyleSheet, View } from 'react-native';

interface CenterTabButtonProps extends BottomTabBarButtonProps {
  barBg?: string;
}

export function CenterTabButton({ barBg, ...props }: CenterTabButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme  = Colors[scheme];
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
      <View style={[styles.ring, { borderColor: barBg ?? (scheme === 'dark' ? '#111827' : '#ffffff') }]}>
        <View style={[styles.circle, { backgroundColor: theme.tint }]}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </View>
      </View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    top: -24,
  },
  ring: {
    borderRadius: 18,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
});
