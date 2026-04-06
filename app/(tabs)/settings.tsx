import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Ajustes</ThemedText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Perfil */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.tintLight }]}>
            <Ionicons name="person" size={28} color={theme.tint} />
          </View>
          <View style={styles.userInfo}>
            {user?.displayName ? (
              <Text style={[styles.userName, { color: theme.text }]}>{user.displayName}</Text>
            ) : null}
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
          </View>
        </View>

        {/* Categorías */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/(tabs)/categories')}
          activeOpacity={0.8}>
          <Ionicons name="pricetags-outline" size={20} color={theme.tint} />
          <View style={styles.flex1}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Categorías</Text>
            <Text style={[styles.cardHint, { color: theme.textSecondary }]}>
              Gestionar categorías de gastos
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Suscripciones */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/(tabs)/subscriptions')}
          activeOpacity={0.8}>
          <Ionicons name="repeat-outline" size={20} color={theme.tint} />
          <View style={styles.flex1}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Suscripciones</Text>
            <Text style={[styles.cardHint, { color: theme.textSecondary }]}>
              Gestionar pagos recurrentes
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Turso conectado */}
        <View style={[styles.card, { backgroundColor: theme.tintLight, borderColor: theme.tintBorder }]}>
          <Ionicons name="cloud-done" size={20} color={theme.tint} />
          <View style={styles.flex1}>
            <Text style={[styles.cardTitle, { color: theme.tint }]}>Turso conectado</Text>
            <Text style={[styles.cardHint, { color: theme.tint, opacity: 0.7 }]}>
              Datos sincronizados con finance-tracker
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.expenseBg, borderColor: theme.expense }]}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={theme.expense} />
          <Text style={[styles.logoutText, { color: theme.expense }]}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120, gap: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 16, fontWeight: '700' },
  userEmail: { fontSize: 14 },
  flex1: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardHint: { fontSize: 12, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '700' },
});
