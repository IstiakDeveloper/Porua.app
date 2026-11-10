import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PoruaDBSchema extends DBSchema {
    student_id_cards: {
        key: number;
        value: {
            id: number;
            full_name: string;
            roll_number: string;
            class_name: string;
            section_name: string;
            guardian_phone?: string;
            photo_url?: string;
            qr_payload?: string;
            cached_at: number;
        };
    };
    timetables: {
        key: string;
        value: {
            key: string;
            title: string;
            data: unknown;
            cached_at: number;
        };
    };
    offline_queue: {
        key: number;
        value: {
            id?: number;
            action: string;
            endpoint: string;
            payload: unknown;
            timestamp: number;
            retries: number;
        };
        indexes: { 'by-timestamp': number };
    };
}

const DB_NAME = 'porua_pwa_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PoruaDBSchema>> | null = null;

function getDB() {
    if (!dbPromise && typeof window !== 'undefined') {
        dbPromise = openDB<PoruaDBSchema>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('student_id_cards')) {
                    db.createObjectStore('student_id_cards', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('timetables')) {
                    db.createObjectStore('timetables', { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains('offline_queue')) {
                    const queueStore = db.createObjectStore('offline_queue', {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    queueStore.createIndex('by-timestamp', 'timestamp');
                }
            },
        });
    }
    return dbPromise;
}

// 1. Student Digital ID Storage
export async function cacheStudentCard(card: PoruaDBSchema['student_id_cards']['value']) {
    const db = await getDB();
    if (!db) return;
    await db.put('student_id_cards', { ...card, cached_at: Date.now() });
}

export async function getCachedStudentCard(id: number) {
    const db = await getDB();
    if (!db) return null;
    return await db.get('student_id_cards', id);
}

// 2. Timetable & Exam Routine Storage
export async function cacheTimetable(key: string, title: string, data: unknown) {
    const db = await getDB();
    if (!db) return;
    await db.put('timetables', { key, title, data, cached_at: Date.now() });
}

export async function getCachedTimetable(key: string) {
    const db = await getDB();
    if (!db) return null;
    return await db.get('timetables', key);
}

// 3. Offline Queue for Teacher Attendance & Mutations
export async function enqueueOfflineSync(action: string, endpoint: string, payload: unknown) {
    const db = await getDB();
    if (!db) return;
    return await db.add('offline_queue', {
        action,
        endpoint,
        payload,
        timestamp: Date.now(),
        retries: 0,
    });
}

export async function getPendingOfflineSyncs() {
    const db = await getDB();
    if (!db) return [];
    return await db.getAllFromIndex('offline_queue', 'by-timestamp');
}

export async function removeOfflineSync(id: number) {
    const db = await getDB();
    if (!db) return;
    await db.delete('offline_queue', id);
}

