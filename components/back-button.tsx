import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.back())}
      style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.border }]}
      activeOpacity={0.7}>
      <Ionicons name="arrow-back" size={20} color={theme.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
