import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface PhotoShareJob {
  id: string;
  sessionId: string;
  colorBlob?: Blob;
  bwBlob?: Blob;
  createdAt: number;
  expiresAt: number;
  status: 'queued' | 'ready';
  error?: string;
}

interface PhotoboxDB extends DBSchema {
  shares: { key: string; value: PhotoShareJob };
  frames: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      updatedAt: number;
    };
  };
}

const DB_NAME = 'photobox_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<PhotoboxDB>> | null = null;

function getDb(): Promise<IDBPDatabase<PhotoboxDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PhotoboxDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('shares')) db.createObjectStore('shares', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('frames')) {
          db.createObjectStore('frames', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveFrameAsset(id: string, blob: Blob): Promise<void> {
  const db = await getDb();
  await db.put('frames', {
    id,
    blob,
    updatedAt: Date.now(),
  });
}

export async function getFrameAsset(id: string): Promise<Blob | null> {
  try {
    const db = await getDb();
    const item = await db.get('frames', id);
    return item ? item.blob : null;
  } catch (error) {
    console.warn('Error reading frame from IndexedDB:', error);
    return null;
  }
}

export async function deleteFrameAsset(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('frames', id);
}

export async function getAllCustomFrames(): Promise<Record<string, string>> {
  try {
    const db = await getDb();
    const items = await db.getAll('frames');
    const result: Record<string, string> = {};
    for (const item of items) {
      result[item.id] = URL.createObjectURL(item.blob);
    }
    return result;
  } catch (error) {
    console.warn('Error loading custom frames:', error);
    return {};
  }
}

export async function saveShareJob(job: PhotoShareJob): Promise<void> {
  await (await getDb()).put('shares', job);
}
export async function getShareJob(id: string): Promise<PhotoShareJob | undefined> {
  return (await getDb()).get('shares', id);
}
export async function getShareJobs(): Promise<PhotoShareJob[]> {
  return (await getDb()).getAll('shares');
}
export async function deleteShareJob(id: string): Promise<void> {
  await (await getDb()).delete('shares', id);
}
