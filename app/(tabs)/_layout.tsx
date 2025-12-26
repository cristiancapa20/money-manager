import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { CenterTabButton } from '@/components/center-tab-button';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 25,
          backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
          paddingHorizontal: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          ...Platform.select({
            ios: {
              borderTopWidth: 0,
            },
            android: {
              borderTopWidth: 0,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name={focused ? 'house.fill' : 'house'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-transaction"
        options={{
          title: 'Agregar',
          tabBarButton: (props) => <CenterTabButton {...props} />,
          tabBarIcon: () => null,
          tabBarLabel: '',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Estadísticas',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name={focused ? 'chart.bar.fill' : 'chart.bar'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
