/**
 * VerityCare AI - Local-First IndexedDB Persistence
 * Ensures all health chats, check-ins, and medical records stay strictly on the user's device
 * with zero cloud transmission unless the user explicitly opts in.
 */

import { DailyCheckIn, HealthChatMessage, AuthoritativeGuideline } from '../types/index.ts';

const DB_NAME = 'VerityCare_LocalDB';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported on this platform.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('chat_messages')) {
        db.createObjectStore('chat_messages', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('daily_checkins')) {
        const checkinStore = db.createObjectStore('daily_checkins', { keyPath: 'id' });
        checkinStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('offline_guidelines')) {
        db.createObjectStore('offline_guidelines', { keyPath: 'topic' });
      }

      if (!db.objectStoreNames.contains('user_settings')) {
        db.createObjectStore('user_settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Check-ins API
export async function saveDailyCheckIn(checkIn: DailyCheckIn): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('daily_checkins', 'readwrite');
    const store = tx.objectStore('daily_checkins');
    const req = store.put(checkIn);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCheckIns(): Promise<DailyCheckIn[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('daily_checkins', 'readonly');
    const store = tx.objectStore('daily_checkins');
    const req = store.getAll();
    req.onsuccess = () => {
      const list = (req.result || []) as DailyCheckIn[];
      list.sort((a, b) => b.timestamp - a.timestamp);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCheckIn(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('daily_checkins', 'readwrite');
    const store = tx.objectStore('daily_checkins');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Chat Messages API
export async function saveChatMessage(message: HealthChatMessage): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chat_messages', 'readwrite');
    const store = tx.objectStore('chat_messages');
    const req = store.put(message);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllChatMessages(): Promise<HealthChatMessage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chat_messages', 'readonly');
    const store = tx.objectStore('chat_messages');
    const req = store.getAll();
    req.onsuccess = () => {
      const list = (req.result || []) as HealthChatMessage[];
      list.sort((a, b) => a.timestamp - b.timestamp);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearChatMessages(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chat_messages', 'readwrite');
    const store = tx.objectStore('chat_messages');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Offline Guidelines API
export async function saveOfflineGuidelines(guidelines: AuthoritativeGuideline[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_guidelines', 'readwrite');
    const store = tx.objectStore('offline_guidelines');
    guidelines.forEach(g => store.put(g));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineGuidelines(): Promise<AuthoritativeGuideline[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_guidelines', 'readonly');
    const store = tx.objectStore('offline_guidelines');
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result || []) as AuthoritativeGuideline[]);
    req.onerror = () => reject(req.error);
  });
}

// Complete Local Purge
export async function purgeAllLocalData(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['chat_messages', 'daily_checkins', 'offline_guidelines'], 'readwrite');
    tx.objectStore('chat_messages').clear();
    tx.objectStore('daily_checkins').clear();
    tx.objectStore('offline_guidelines').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Export All Data as JSON
export async function exportAllLocalData(): Promise<string> {
  const messages = await getAllChatMessages();
  const checkins = await getAllCheckIns();
  const guidelines = await getOfflineGuidelines();

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    appName: 'VerityCare AI',
    version: '1.0.0',
    data: {
      chat_messages: messages,
      daily_checkins: checkins,
      offline_guidelines_count: guidelines.length
    }
  };

  return JSON.stringify(exportPayload, null, 2);
}
