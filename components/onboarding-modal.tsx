import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OnboardingStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: 'wallet-outline',
    title: 'Tus cuentas y tarjetas',
    description:
      'Agrega tus cuentas bancarias y tarjetas para llevar el control de tus finanzas en un solo lugar.',
    color: Palette.indigo500,
  },
  {
    icon: 'swap-vertical-outline',
    title: 'Registra tus movimientos',
    description:
      'Registra ingresos y gastos facilmente. Categoriza cada movimiento para entender a donde va tu dinero.',
    color: Palette.green600,
  },
  {
    icon: 'stats-chart-outline',
    title: 'Visualiza tu progreso',
    description:
      'Consulta graficas y estadisticas para tomar mejores decisiones financieras dia a dia.',
    color: Palette.amber600,
  },
];

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  const goToNext = () => {
    if (activeIndex < STEPS.length - 1) {
      const next = activeIndex + 1;
      scrollRef.current?.scrollTo({ x: next * screenWidth, animated: true });
      setActiveIndex(next);
    } else {
      onComplete();
    }
  };

  const goToStep = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setActiveIndex(index);
  };

  const isLastStep = activeIndex === STEPS.length - 1;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onComplete}>
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.background,
            paddingTop: insets.top,
          },
        ]}>
        {/* Skip */}
        {!isLastStep && (
          <TouchableOpacity
            style={[styles.skipBtn, { top: insets.top + 12 }]}
            onPress={onComplete}>
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>Omitir</Text>
          </TouchableOpacity>
        )}

        {/* Steps carousel */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onMomentumScrollEnd={onScroll}
          scrollEventThrottle={16}
          style={styles.carousel}>
          {STEPS.map((item, i) => (
            <View key={i} style={[styles.stepContainer, { width: screenWidth }]}>
              <View style={[styles.iconCircle, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={56} color={item.color} />
              </View>
              <Text style={[styles.stepTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Dots + button */}
        <View style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goToStep(i)}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === activeIndex ? theme.tint : theme.border,
                    width: i === activeIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.tint }]}
            onPress={goToNext}
            activeOpacity={0.8}>
            <Text style={styles.actionBtnText}>
              {isLastStep ? 'Comenzar' : 'Siguiente'}
            </Text>
            <Ionicons
              name={isLastStep ? 'checkmark' : 'arrow-forward'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  carousel: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  bottomArea: {
    paddingHorizontal: 24,
    gap: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
