import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export default function ResetPasswordScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!token) {
      setError('Token de recuperación no válido. Solicita un nuevo enlace.');
      return;
    }

    if (!password) {
      setError('Ingresa tu nueva contraseña');
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

      let res: Response;
      try {
        res = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
      } catch {
        setError('No se pudo conectar al servidor. Intenta de nuevo.');
        return;
      }

      if (res.status >= 500) {
        setError('Error del servidor. Intenta de nuevo más tarde.');
        return;
      }

      if (res.status === 400 || res.status === 410) {
        setError('El enlace ha expirado o no es válido. Solicita uno nuevo.');
        return;
      }

      if (!res.ok) {
        setError('No se pudo restablecer la contraseña. Intenta de nuevo.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
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
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.tint }]}>
              <Ionicons name="lock-open" size={36} color="#fff" />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>
              Nueva contraseña
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {success
                ? 'Tu contraseña ha sido actualizada'
                : 'Ingresa tu nueva contraseña'}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {success ? (
              <>
                <View style={[styles.successBox, { backgroundColor: theme.incomeBg }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={theme.income} />
                  <Text style={[styles.successText, { color: theme.income }]}>
                    Tu contraseña se restableció correctamente. Ya puedes iniciar sesión.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: theme.tint }]}
                  onPress={() => router.replace('/(auth)/login')}
                  activeOpacity={0.85}>
                  <Text style={styles.submitButtonText}>Ir al login</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Password field */}
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Nueva contraseña</Text>
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
                      autoCorrect={false}
                      autoFocus
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm password field */}
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
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={8}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
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

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: theme.tint }]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Restablecer contraseña</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Back to login */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backRow}>
              <Ionicons name="arrow-back" size={16} color={theme.tint} />
              <Text style={[styles.footerLink, { color: theme.tint }]}>Volver al login</Text>
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
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
  },
  successText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
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
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
