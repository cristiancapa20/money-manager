import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { CenterTabButton } from '@/components/center-tab-button';
import { HapticTab } from '@/components/haptic-tab';
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
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "wallet" : "wallet-outline"} 
              size={focused ? 26 : 24} 
              color={focused ? color : (isDark ? '#666' : '#999')} 
            />
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
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "analytics" : "analytics-outline"} 
              size={focused ? 26 : 24} 
              color={focused ? color : (isDark ? '#666' : '#999')} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
