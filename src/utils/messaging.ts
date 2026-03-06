import browser from 'webextension-polyfill';

export async function sendMessage<T = unknown>(message: unknown): Promise<T> {
  return browser.runtime.sendMessage(message) as Promise<T>;
}
