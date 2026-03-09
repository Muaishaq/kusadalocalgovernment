import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

export function useNativeNetwork() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Network plugin on native
      Network.getStatus().then((status) => setIsOnline(status.connected));
      const handler = Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
      });
      return () => {
        handler.then((h) => h.remove());
      };
    } else {
      // Fallback to browser APIs
      setIsOnline(navigator.onLine);
      const goOnline = () => setIsOnline(true);
      const goOffline = () => setIsOnline(false);
      window.addEventListener('online', goOnline);
      window.addEventListener('offline', goOffline);
      return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
      };
    }
  }, []);

  return isOnline;
}
