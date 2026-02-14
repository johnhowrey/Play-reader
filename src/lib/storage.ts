import { Script } from "./types";

const DB_NAME = "play-reader";
const DB_VERSION = 1;
const SCRIPTS_STORE = "scripts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SCRIPTS_STORE)) {
        const store = db.createObjectStore(SCRIPTS_STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
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

export async function saveScript(script: Script): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, SCRIPTS_STORE, "readwrite");
    const request = store.put(script);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getScript(id: string): Promise<Script | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, SCRIPTS_STORE, "readonly");
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllScripts(): Promise<Script[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, SCRIPTS_STORE, "readonly");
    const index = store.index("updatedAt");
    const request = index.getAll();
    request.onsuccess = () => {
      // Return newest first
      const results = request.result as Script[];
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
