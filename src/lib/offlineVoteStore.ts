import { openDB, type IDBPDatabase } from 'idb';

export interface OfflineVote {
  id: string; // client-generated UUID for dedup
  election_id: string;
  polling_unit_id: string;
  party_id: string;
  votes_count: number;
  accredited_voters: number | null;
  invalid_votes: number | null;
  submitted_by: string;
  photo_proof_url: string | null;
  created_at: string;
  synced: boolean;
  sync_error: string | null;
}

const DB_NAME = 'kusada-votes-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending_votes';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('election_polling', ['election_id', 'polling_unit_id', 'party_id'], { unique: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveVoteOffline(vote: Omit<OfflineVote, 'synced' | 'sync_error'>): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, { ...vote, synced: false, sync_error: null });
}

export async function getPendingVotes(): Promise<OfflineVote[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return (all as OfflineVote[]).filter((v) => !v.synced);
}

export async function markVoteSynced(id: string): Promise<void> {
  const db = await getDB();
  const vote = await db.get(STORE_NAME, id);
  if (vote) {
    vote.synced = true;
    vote.sync_error = null;
    await db.put(STORE_NAME, vote);
  }
}

export async function markVoteSyncError(id: string, error: string): Promise<void> {
  const db = await getDB();
  const vote = await db.get(STORE_NAME, id);
  if (vote) {
    vote.sync_error = error;
    await db.put(STORE_NAME, vote);
  }
}

export async function getAllOfflineVotes(): Promise<OfflineVote[]> {
  const db = await getDB();
  return (await db.getAll(STORE_NAME)) as OfflineVote[];
}

export async function clearSyncedVotes(): Promise<void> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  const synced = (all as OfflineVote[]).filter((v) => v.synced);
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const vote of synced) {
    await tx.store.delete(vote.id);
  }
  await tx.done;
}
