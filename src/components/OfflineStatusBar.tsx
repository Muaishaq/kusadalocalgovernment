import { Wifi, WifiOff, RefreshCw, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOfflineSync } from '@/hooks/useOfflineSync';

const OfflineStatusBar = () => {
  const { isOnline, pendingCount, isSyncing, manualSync } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg mb-4 ${
      isOnline
        ? 'bg-accent/30 border border-accent'
        : 'bg-destructive/10 border border-destructive/30'
    }`}>
      {isOnline ? (
        <Wifi className="h-4 w-4 text-primary" />
      ) : (
        <WifiOff className="h-4 w-4 text-destructive" />
      )}

      <span className="text-foreground font-medium">
        {isOnline ? 'Back online' : 'You are offline'}
      </span>

      {pendingCount > 0 && (
        <>
          <Badge variant="secondary" className="text-xs">
            <CloudUpload className="h-3 w-3 mr-1" />
            {pendingCount} pending
          </Badge>

          {isOnline && (
            <Button
              size="sm"
              variant="outline"
              onClick={manualSync}
              disabled={isSyncing}
              className="ml-auto h-7 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing…' : 'Sync Now'}
            </Button>
          )}
        </>
      )}

      {!isOnline && pendingCount === 0 && (
        <span className="text-muted-foreground">
          Votes will be saved locally until reconnected.
        </span>
      )}
    </div>
  );
};

export default OfflineStatusBar;
