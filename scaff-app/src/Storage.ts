// src/storage.ts
// Polyfill for the artifact `window.storage` API, backed by localStorage.

interface StorageResult {
  key: string;
  value: string;
  shared: boolean;
}

interface StorageListResult {
  keys: string[];
  prefix?: string;
  shared: boolean;
}

interface StorageAPI {
  get(key: string, shared?: boolean): Promise<StorageResult>;
  set(key: string, value: string, shared?: boolean): Promise<StorageResult>;
  delete(key: string, shared?: boolean): Promise<{ key: string; deleted: boolean; shared: boolean }>;
  list(prefix?: string, shared?: boolean): Promise<StorageListResult>;
}

declare global {
  interface Window {
    storage: StorageAPI;
  }
}

const PREFIX = "__scaff_";

export function installStorage(): void {
  if (window.storage) return; // already present (e.g. inside Claude artifact)

  window.storage = {
    async get(key: string, shared = false): Promise<StorageResult> {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) throw new Error(`Key not found: ${key}`);
      return { key, value: raw, shared };
    },

    async set(key: string, value: string, shared = false): Promise<StorageResult> {
      localStorage.setItem(PREFIX + key, value);
      return { key, value, shared };
    },

    async delete(key: string, shared = false) {
      const existed = localStorage.getItem(PREFIX + key) !== null;
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: existed, shared };
    },

    async list(prefix = "", shared = false): Promise<StorageListResult> {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(PREFIX + prefix)) {
          keys.push(k.slice(PREFIX.length));
        }
      }
      return { keys, prefix, shared };
    },
  };
}