import AsyncStorage from '@react-native-async-storage/async-storage';
import * as bcrypt from 'bcryptjs';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { turso } from '@/database/turso';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  /**
   * Avatar de perfil. Puede ser:
   * - una data URL base64 ("data:image/jpeg;base64,...")  ← sincronizado con Turso
   * - un URI local de archivo  ← solo en el dispositivo (legado)
   * - null si no hay foto
   */
  avatarUri: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Actualiza displayName y avatar en Turso (y en caché local) */
  updateProfile: (displayName: string, avatarUri: string | null) => Promise<void>;
}

const STORAGE_KEY = 'costos_auth_user';
const AVATAR_KEY  = 'costos_avatar_uri';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión al arrancar
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: AuthUser = JSON.parse(stored);
          // Preferir el avatar en caché local (puede estar más actualizado)
          const cachedAvatar = await AsyncStorage.getItem(AVATAR_KEY + '_' + parsed.id);
          setUser({ ...parsed, avatarUri: cachedAvatar ?? parsed.avatarUri ?? null });
        }
      } catch {
        // sesión corrupta — ignorar
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Verificar si el email ya existe
    const existing = await turso.execute({
      sql: `SELECT id FROM "User" WHERE email = ? LIMIT 1`,
      args: [normalizedEmail],
    });
    if (existing.rows.length > 0) throw new Error('Ya existe una cuenta con ese email');

    // Crear usuario
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    await turso.execute({
      sql: `INSERT INTO "User" (id, email, "passwordHash") VALUES (?, ?, ?)`,
      args: [id, normalizedEmail, passwordHash],
    });

    // Iniciar sesión automáticamente
    const authUser: AuthUser = {
      id,
      email: normalizedEmail,
      displayName: null,
      avatarUri: null,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Leer también el campo `avatar` de Turso para sincronizarlo
    const result = await turso.execute({
      sql: `SELECT id, email, "passwordHash", "displayName", avatar FROM "User" WHERE email = ? LIMIT 1`,
      args: [email.trim().toLowerCase()],
    });

    if (result.rows.length === 0) throw new Error('Usuario no encontrado');

    const row   = result.rows[0];
    const hash  = String(row.passwordHash);
    const valid = await bcrypt.compare(password, hash);
    if (!valid) throw new Error('Contraseña incorrecta');

    const userId = String(row.id);

    // Prioridad: 1) caché local, 2) avatar guardado en Turso
    const cachedAvatar = await AsyncStorage.getItem(AVATAR_KEY + '_' + userId);
    const tursoAvatar  = row.avatar ? String(row.avatar) : null;
    const avatarUri    = cachedAvatar ?? tursoAvatar;

    // Si Turso tiene avatar pero no hay caché local, guardar en caché
    if (!cachedAvatar && tursoAvatar) {
      await AsyncStorage.setItem(AVATAR_KEY + '_' + userId, tursoAvatar);
    }

    const authUser: AuthUser = {
      id:          userId,
      email:       String(row.email),
      displayName: row.displayName ? String(row.displayName) : null,
      avatarUri,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (displayName: string, avatarUri: string | null) => {
    if (!user) return;

    // Actualizar displayName y avatar en Turso
    await turso.execute({
      sql: `UPDATE "User" SET "displayName" = ?, avatar = ? WHERE id = ?`,
      args: [displayName.trim(), avatarUri ?? null, user.id],
    });

    // Actualizar caché local del avatar
    if (avatarUri !== null) {
      await AsyncStorage.setItem(AVATAR_KEY + '_' + user.id, avatarUri);
    } else {
      await AsyncStorage.removeItem(AVATAR_KEY + '_' + user.id);
    }

    const updated: AuthUser = { ...user, displayName: displayName.trim(), avatarUri };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
