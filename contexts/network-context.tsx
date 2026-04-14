import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface NetworkContextType {
  isOnline: boolean;
  /** Si NetInfo aun no respondio, isOnline es true por defecto para no bloquear */
  initialized: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    function applyState(state: NetInfoState) {
      // isInternetReachable puede ser null en iOS al arrancar — tratamos null como online
      const reachable = state.isInternetReachable;
      const online = Boolean(state.isConnected) && reachable !== false;
      setIsOnline(online);
      setInitialized(true);
    }

    NetInfo.fetch().then(applyState).catch(() => setInitialized(true));
    const unsub = NetInfo.addEventListener(applyState);
    return () => unsub();
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, initialized }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}
