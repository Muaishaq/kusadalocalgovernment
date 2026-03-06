import { supabase } from '@/integrations/supabase/client';
import {
  getPendingVotes,
  markVoteSynced,
  markVoteSyncError,
  clearSyncedVotes,
  type OfflineVote,
} from './offlineVoteStore';

type SyncListener = (pending: number) => void;
const listeners = new Set<SyncListener>();
let syncInterval: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

export function onSyncUpdate(fn: SyncListener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyListeners(count: number) {
  listeners.forEach((fn) => fn(count));
}

async function syncSingleVote(vote: OfflineVote): Promise<boolean> {
  // Check for duplicate: same election + polling_unit + party by this user
  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('election_id', vote.election_id)
    .eq('polling_unit_id', vote.polling_unit_id)
    .eq('party_id', vote.party_id)
    .eq('submitted_by', vote.submitted_by)
    .maybeSingle();

  if (existing) {
    // Already exists — mark as synced (dedup)
    await markVoteSynced(vote.id);
    return true;
  }

  const { error } = await supabase.from('votes').insert({
    election_id: vote.election_id,
    polling_unit_id: vote.polling_unit_id,
    party_id: vote.party_id,
    votes_count: vote.votes_count,
    accredited_voters: vote.accredited_voters,
    invalid_votes: vote.invalid_votes,
    submitted_by: vote.submitted_by,
    photo_proof_url: vote.photo_proof_url,
  });

  if (error) {
    await markVoteSyncError(vote.id, error.message);
    return false;
  }

  await markVoteSynced(vote.id);
  return true;
}

export async function syncPendingVotes(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  if (!navigator.onLine) return { synced: 0, failed: 0 };

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const pending = await getPendingVotes();
    for (const vote of pending) {
      const ok = await syncSingleVote(vote);
      if (ok) synced++;
      else failed++;
    }

    // Clean up synced records
    await clearSyncedVotes();

    const remaining = await getPendingVotes();
    notifyListeners(remaining.length);
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

export function startBackgroundSync(intervalMs = 15000) {
  if (syncInterval) return;

  // Sync on reconnect
  window.addEventListener('online', () => {
    syncPendingVotes();
  });

  // Periodic sync
  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      syncPendingVotes();
    }
  }, intervalMs);

  // Initial sync attempt
  if (navigator.onLine) {
    syncPendingVotes();
  }
}

export function stopBackgroundSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
