import type { Level, RoomId } from "./types";

/**
 * Then vs Now: with "Keep my recordings" on, the first spoken step in each
 * room is kept, and so is the most recent one, so they can be played side
 * by side. Stored only on this device (IndexedDB), never uploaded, and
 * deletable in Me.
 */

export type Recording = { room: RoomId; slot: "first" | "latest"; at: string; situationId: string; level: Level; blob: Blob };
export type RoomRecordings = Partial<Record<"first" | "latest", Recording>>;

/** Which slot a new recording goes in: the first ever for the room, or the latest. */
export function slotFor(existing: RoomRecordings): "first" | "latest" {
  return existing.first ? "latest" : "first";
}

const DB = "courage-recordings";
const STORE = "recordings";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      }),
  );
}

export async function loadRecordings(): Promise<Partial<Record<RoomId, RoomRecordings>>> {
  if (typeof indexedDB === "undefined") return {};
  const all = await run<Recording[]>("readonly", (s) => s.getAll() as IDBRequest<Recording[]>).catch(() => [] as Recording[]);
  const out: Partial<Record<RoomId, RoomRecordings>> = {};
  for (const r of all) (out[r.room] ??= {})[r.slot] = r;
  return out;
}

export async function saveRecording(room: RoomId, rec: Omit<Recording, "room" | "slot">): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const existing = (await loadRecordings())[room] ?? {};
  const slot = slotFor(existing);
  await run("readwrite", (s) => s.put({ ...rec, room, slot }, `${room}:${slot}`)).catch(() => undefined);
}

export async function deleteRecordings(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  await run("readwrite", (s) => s.clear()).catch(() => undefined);
}
