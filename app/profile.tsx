import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { CURRENCIES } from '@/contexts/currency-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const scheme  = useColorScheme() ?? 'light';
  const theme   = Colors[scheme];
  const { user, logout, updateProfile } = useAuth();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [displayName,       setDisplayName]       = useState(user?.displayName ?? '');
  const [avatarUri,         setAvatarUri]         = useState<string | null>(user?.avatarUri ?? null);
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency ?? 'MXN');
  const [saving,            setSaving]            = useState(false);
  const [editing,           setEditing]           = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setAvatarUri(user?.avatarUri ?? null);
    setPreferredCurrency(user?.preferredCurrency ?? 'MXN');
    setEditing(false);
  }, [user?.displayName, user?.avatarUri, user?.preferredCurrency]);

  /* ─── Foto ─── */
  /** Convierte el resultado del picker a una data URL base64 sincronizable con Turso */
  const asDataUrl = (asset: ImagePicker.ImagePickerAsset): string => {
    if (asset.base64) {
      // ImagePicker devuelve base64 sin prefijo — lo agregamos
      const mime = asset.mimeType ?? 'image/jpeg';
      return `data:${mime};base64,${asset.base64}`;
    }
    // Fallback: usar URI local si base64 no está disponible
    return asset.uri;
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,   // un poco menos de calidad para reducir tamaño base64
      base64: true,   // ← pedir base64 para poder sincronizar con Turso
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(asDataUrl(result.assets[0]));
      setEditing(true);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,   // ← pedir base64
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(asDataUrl(result.assets[0]));
      setEditing(true);
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert('Foto de perfil', 'Elige una opción', [
      { text: 'Galería',      onPress: handlePickPhoto },
      { text: 'Cámara',       onPress: handleTakePhoto },
      ...(avatarUri
        ? [{ text: 'Eliminar foto', style: 'destructive' as const, onPress: () => { setAvatarUri(null); setEditing(true); } }]
        : []),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  /* ─── Guardar ─── */
  const handleSave = async () => {
    if (!displayName.trim()) return;
    try {
      setSaving(true);
      await updateProfile(displayName.trim(), avatarUri, preferredCurrency);
      setEditing(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Logout ─── */
  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const initials = (user?.displayName || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayedName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        {/* Botón atrás — usa dismiss() para el efecto de pop correcto en Stack */}
        <TouchableOpacity
          onPress={() => router.dismiss()}
          style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Título */}
        <Text style={[styles.topTitle, { color: theme.text }]}>Mi perfil</Text>

        {/* Acciones derecha */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.iconPill, { backgroundColor: theme.expenseBg, borderColor: theme.expense }]}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={16} color={theme.expense} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero avatar ── */}
        <View style={styles.hero}>
          <TouchableOpacity style={styles.avatarWrap} onPress={handlePhotoOptions} activeOpacity={0.85}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: theme.tintLight }]}>
                <Text style={[styles.avatarInitials, { color: theme.tint }]}>{initials}</Text>
              </View>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: theme.tint }]}>
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.heroName, { color: theme.text }]}>{displayedName}</Text>
          <Text style={[styles.heroEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* ── Sección: datos personales ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>INFORMACIÓN PERSONAL</Text>

          <View style={[styles.fieldCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Nombre */}
            <View style={styles.fieldRow}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.tintLight }]}>
                <Ionicons name="person-outline" size={16} color={theme.tint} />
              </View>
              <View style={styles.fieldBody}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Nombre completo</Text>
                <TextInput
                  style={[styles.fieldInput, {
                    color: theme.text,
                    borderBottomColor: editing ? theme.tint : 'transparent',
                  }]}
                  value={displayName}
                  onChangeText={(v) => { setDisplayName(v); setEditing(true); }}
                  placeholder="Tu nombre"
                  placeholderTextColor={theme.textMuted}
                  returnKeyType="done"
                />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Email */}
            <View style={styles.fieldRow}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.tintLight }]}>
                <Ionicons name="mail-outline" size={16} color={theme.tint} />
              </View>
              <View style={styles.fieldBody}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Correo electrónico</Text>
                <Text style={[styles.fieldValue, { color: theme.text }]}>{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Categorías ── */}
        <TouchableOpacity
          style={[styles.navCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/(tabs)/categories')}
          activeOpacity={0.8}>
          <View style={[styles.navIcon, { backgroundColor: theme.tintLight }]}>
            <Ionicons name="pricetags-outline" size={18} color={theme.tint} />
          </View>
          <View style={styles.navBody}>
            <Text style={[styles.navTitle, { color: theme.text }]}>Categorias</Text>
            <Text style={[styles.navHint, { color: theme.textSecondary }]}>Gestionar categorias de gastos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        {/* ── Sección: preferencias ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PREFERENCIAS</Text>

          <View style={[styles.fieldCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.currencyLabel, { color: theme.textSecondary }]}>Moneda preferida</Text>
            <View style={styles.currencyGrid}>
              {CURRENCIES.map((c) => {
                const selected = preferredCurrency === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.currencyChip,
                      {
                        backgroundColor: selected ? theme.tint : theme.background,
                        borderColor: selected ? theme.tint : theme.border,
                      },
                    ]}
                    onPress={() => { setPreferredCurrency(c.code); setEditing(true); }}
                    activeOpacity={0.7}>
                    <Text style={[styles.currencyCode, { color: selected ? '#fff' : theme.text }]}>
                      {c.symbol} {c.code}
                    </Text>
                    <Text
                      style={[styles.currencyName, { color: selected ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}
                      numberOfLines={1}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Guardar cambios ── */}
        {editing && (
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.tint }]}
            onPress={handleSave}
            disabled={saving || !displayName.trim()}
            activeOpacity={0.85}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Guardar cambios</Text>}
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const AVATAR_SIZE = 120;

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  topTitle: { flex: 1, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Scroll */
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 20 },

  /* Hero */
  hero: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { fontSize: 44, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  heroName:  { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heroEmail: { fontSize: 14, fontWeight: '400' },

  /* Section */
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginLeft: 4 },

  /* Field card */
  fieldCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  fieldIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldBody: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 2,
    borderBottomWidth: 1.5,
  },
  fieldValue: { fontSize: 15, fontWeight: '500', paddingVertical: 2 },
  divider: { height: 1, marginHorizontal: 16 },

  /* Currency */
  currencyLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  currencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 90,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  currencyName: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },

  /* Nav cards */
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBody: { flex: 1, gap: 2 },
  navTitle: { fontSize: 14, fontWeight: '700' },
  navHint: { fontSize: 12 },

  /* Save */
  saveBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
