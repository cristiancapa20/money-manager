import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || !confirmPassword) {
      setError('Completa todos los campos');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Ingresa un email válido');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await register(trimmedEmail, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message ?? 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          {/* Logo / título */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.tint }]}>
              <Ionicons name="wallet" size={36} color="#fff" />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>Costos</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Crea tu cuenta
            </Text>
          </View>

          {/* Formulario */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
              <View style={[styles.inputRow, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
                <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Contraseña */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Contraseña</Text>
              <View style={[styles.inputRow, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar contraseña */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Confirmar contraseña</Text>
              <View style={[styles.inputRow, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error && (
              <View style={[styles.errorBox, { backgroundColor: theme.expenseBg }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.expense} />
                <Text style={[styles.errorText, { color: theme.expense }]}>{error}</Text>
              </View>
            )}

            {/* Botón */}
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: theme.tint }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Crear cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link a login */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={[styles.footerLink, { color: theme.tint }]}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  field: { gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeButton: { padding: 4 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  registerButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
