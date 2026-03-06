import { useState, useEffect, useCallback } from 'react';
import { getPendingVotes } from '@/lib/offlineVoteStore';
import { onSyncUpdate, startBackgroundSync, syncPendingVotes } from '@/lib/syncManager';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Start background sync
    startBackgroundSync();

    // Listen for sync updates
    const unsub = onSyncUpdate((count) => setPendingCount(count));

    // Initial count
    getPendingVotes().then((v) => setPendingCount(v.length));

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      unsub();
    };
  }, []);

  const manualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncPendingVotes();
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { isOnline, pendingCount, isSyncing, manualSync };
}
