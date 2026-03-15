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
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = 'costos_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión al arrancar
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch {
        // sesión corrupta — ignorar
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await turso.execute({
      sql: `SELECT id, email, "passwordHash", "displayName" FROM "User" WHERE email = ? LIMIT 1`,
      args: [email.trim().toLowerCase()],
    });

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const row = result.rows[0];
    const hash = String(row.passwordHash);
    const valid = await bcrypt.compare(password, hash);

    if (!valid) {
      throw new Error('Contraseña incorrecta');
    }

    const authUser: AuthUser = {
      id: String(row.id),
      email: String(row.email),
      displayName: row.displayName ? String(row.displayName) : null,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
