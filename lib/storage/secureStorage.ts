import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type StorageValue = string | null;

const memoryStore = new Map<string, string>();

async function getWebStorageItem(key: string): Promise<StorageValue> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Fall back to in-memory storage when localStorage is unavailable.
  }
  return memoryStore.get(key) ?? null;
}

async function setWebStorageItem(key: string, value: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Fall back to in-memory storage when localStorage is unavailable.
  }
  memoryStore.set(key, value);
}

async function removeWebStorageItem(key: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch {
    // Fall back to in-memory storage when localStorage is unavailable.
  }
  memoryStore.delete(key);
}

export const secureStorage = {
  async getItem(key: string): Promise<StorageValue> {
    if (Platform.OS === 'web') {
      return getWebStorageItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      return setWebStorageItem(key, value);
    }
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      return removeWebStorageItem(key);
    }
    return SecureStore.deleteItemAsync(key);
  },
};
