import { Script } from "./types";

// ─── IndexedDB (Local Storage) ──────────────────────────────

const DB_NAME = "play-reader";
const DB_VERSION = 2;
const SCRIPTS_STORE = "scripts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        const store = db.createObjectStore(SCRIPTS_STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("userId", "userId", { unique: false });
      }

      if (oldVersion < 2) {
        // Migration: add userId index if upgrading from v1
        if (db.objectStoreNames.contains(SCRIPTS_STORE)) {
          const tx = request.transaction;
          if (tx) {
            const store = tx.objectStore(SCRIPTS_STORE);
            if (!store.indexNames.contains("userId")) {
              store.createIndex("userId", "userId", { unique: false });
            }
          }
        }
      }
    };
  });
}

function tx(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode
): IDBObjectStore {
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

// ─── Local CRUD Operations ──────────────────────────────────

export async function saveScript(script: Script): Promise<void> {
  // Ensure new fields have defaults for migrated data
  const normalized: Script = {
    ...script,
    userId: script.userId || "local",
    syncedAt: script.syncedAt ?? null,
    isExpired: script.isExpired ?? false,
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, SCRIPTS_STORE, "readwrite");
    const request = store.put(normalized);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getScript(id: string): Promise<Script | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, SCRIPTS_STORE, "readonly");
    const request = store.get(id);
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        // Normalize migrated data
        result.userId = result.userId || "local";
        result.syncedAt = result.syncedAt ?? null;
        result.isExpired = result.isExpired ?? false;
      }
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllScripts(userId?: string): Promise<Script[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, SCRIPTS_STORE, "readonly");
    const request = store.getAll();
    request.onsuccess = () => {
      let results = request.result as Script[];
      // Normalize migrated data
      results = results.map((s) => ({
        ...s,
        userId: s.userId || "local",
        syncedAt: s.syncedAt ?? null,
        isExpired: s.isExpired ?? false,
      }));
      // Filter by userId if provided
      if (userId) {
        results = results.filter((s) => s.userId === userId || s.userId === "local");
      }
      // Sort newest first
      results.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteScript(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, SCRIPTS_STORE, "readwrite");
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ─── Sync Helpers (for future cloud integration) ────────────

export async function getUnsyncedScripts(userId: string): Promise<Script[]> {
  const all = await getAllScripts(userId);
  return all.filter((s) => s.syncedAt === null || s.updatedAt > (s.syncedAt || 0));
}

export async function markSynced(id: string): Promise<void> {
  const script = await getScript(id);
  if (script) {
    script.syncedAt = Date.now();
    await saveScript(script);
  }
}

export async function migrateLocalScriptsToUser(userId: string): Promise<void> {
  const all = await getAllScripts();
  const local = all.filter((s) => s.userId === "local");
  for (const script of local) {
    script.userId = userId;
    script.syncedAt = null; // needs sync
    await saveScript(script);
  }
}
