import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

import { CenterTabButton } from '@/components/center-tab-button';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 25,
          backgroundColor: theme.background,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 5,
          paddingHorizontal: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 10,
          ...Platform.select({
            ios:     { borderTopWidth: 0 },
            android: { borderTopWidth: 0 },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
                  top: -8,
                  width: 20,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: theme.tabIconSelected,
                }} />
              )}
              <Ionicons
                name={focused ? 'wallet' : 'wallet-outline'}
                size={focused ? 24 : 22}
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
          tabBarButton: (props) => <CenterTabButton {...props} />,
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
                  top: -8,
                  width: 20,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: theme.tabIconSelected,
                }} />
              )}
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'}
                size={focused ? 24 : 22}
                color={focused ? theme.tabIconSelected : theme.tabIconDefault}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  width: 20,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: theme.tabIconSelected,
                }} />
              )}
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={focused ? 24 : 22}
                color={focused ? theme.tabIconSelected : theme.tabIconDefault}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
