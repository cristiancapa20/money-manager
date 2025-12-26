import { useTheme } from '@/contexts/theme-context';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  try {
    const { colorScheme } = useTheme();
    return colorScheme;
  } catch {
    // Si no hay ThemeProvider, usar el hook nativo
    return useRNColorScheme() ?? 'light';
  }
}
