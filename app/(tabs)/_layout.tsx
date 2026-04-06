import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { CenterTabButton } from '@/components/center-tab-button';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  // Light → blanco; Dark → gris muy oscuro
  const barBg = isDark ? Palette.gray900 : Palette.white;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          height: 64,
          backgroundColor: barBg,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingBottom: 0,
          paddingHorizontal: 8,
          // Sombra sutil hacia arriba
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.25 : 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -10,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.tabIconSelected,
                }} />
              )}
              <Ionicons
                name={focused ? 'wallet' : 'wallet-outline'}
                size={23}
                color={focused ? theme.tabIconSelected : theme.tabIconDefault}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: 'Préstamos',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -10,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.tabIconSelected,
                }} />
              )}
              <Ionicons
                name={focused ? 'cash' : 'cash-outline'}
                size={23}
                color={focused ? theme.tabIconSelected : theme.tabIconDefault}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="add-transaction"
        options={{
          title: '',
          tabBarButton: (props) => <CenterTabButton {...props} barBg={barBg} />,
          tabBarIcon: () => null,
          tabBarLabel: '',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Estadísticas',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -10,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.tabIconSelected,
                }} />
              )}
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'}
                size={23}
                color={focused ? theme.tabIconSelected : theme.tabIconDefault}
              />
            </View>
          ),
        }}
      />
      {/* settings y categories ocultos del tab bar */}
      <Tabs.Screen
        name="settings"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="categories"
        options={{ href: null }}
      />
    </Tabs>
  );
}
