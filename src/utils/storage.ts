import browser from 'webextension-polyfill';

export class StorageManager {
  async get<T>(key: string): Promise<T | undefined> {
    const result = await browser.storage.local.get(key);
    return result[key] as T | undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    await browser.storage.local.set({ [key]: value });
  }

  async remove(key: string): Promise<void> {
    await browser.storage.local.remove(key);
  }

  async clear(): Promise<void> {
    await browser.storage.local.clear();
  }

  async getAll(): Promise<Record<string, unknown>> {
    return browser.storage.local.get(null);
  }
}
