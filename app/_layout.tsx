import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { OnboardingModal } from '@/components/onboarding-modal';
import { AppProvider } from '@/contexts/app-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { CurrencyProvider } from '@/contexts/currency-context';
import { AppThemeProvider } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ONBOARDING_KEY = 'costos_onboarding_complete';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Deep linking — redirige costos://reset-password?token=xxx
  useEffect(() => {
    function handleDeepLink(event: { url: string }) {
      const parsed = Linking.parse(event.url);
      if (parsed.path === 'reset-password' && parsed.queryParams?.token) {
        router.replace({
          pathname: '/(auth)/reset-password',
          params: { token: parsed.queryParams.token as string },
        });
      }
    }

    // Handle URL that opened the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Handle URL while app is open (warm start)
    const sub = Linking.addEventListener('url', handleDeepLink);
    return () => sub.remove();
  }, [router]);

  // Guardia de autenticación
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  // Verificar si el usuario necesita onboarding
  useEffect(() => {
    if (!user || isLoading) return;
    (async () => {
      const done = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${user.id}`);
      if (!done) setShowOnboarding(true);
    })();
  }, [user, isLoading]);

  const handleOnboardingComplete = useCallback(async () => {
    if (!user) return;
    await AsyncStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, '1');
    setShowOnboarding(false);
  }, [user]);

  if (isLoading) return null;

  // Colores de fondo según tema — evita el flash blanco en transiciones del Stack
  const bg = colorScheme === 'dark' ? '#0f172a' : '#f9fafb';

  return (
    <CurrencyProvider>
      <AppProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ contentStyle: { backgroundColor: bg } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="categories" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
          <OnboardingModal visible={showOnboarding} onComplete={handleOnboardingComplete} />
        </ThemeProvider>
      </AppProvider>
    </CurrencyProvider>
  );
}
