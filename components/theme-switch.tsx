import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

export function ThemeSwitch() {
  const { colorScheme, setTheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const translateX = useRef(new Animated.Value(isDark ? 24 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isDark ? 24 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isDark]);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      style={styles.switch}
      onPress={toggleTheme}
      activeOpacity={0.7}>
      <View style={[styles.switchTrack, isDark && styles.switchTrackDark]}>
        <Animated.View
          style={[
            styles.switchThumb,
            isDark && styles.switchThumbDark,
            { transform: [{ translateX }] },
          ]}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={16}
            color={isDark ? '#4f46e5' : '#FFD700'}
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switch: {
    padding: 4,
  },
  switchTrack: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    padding: 2,
    position: 'relative',
  },
  switchTrackDark: {
    backgroundColor: '#4f46e5',
  },
  switchThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 2,
    left: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  switchThumbDark: {
    backgroundColor: '#FFFFFF',
  },
});

