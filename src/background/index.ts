import browser from 'webextension-polyfill';
import { RequestInterceptor } from './interceptor';
import { StorageManager } from '../utils/storage';
import { Logger } from '../utils/logger';
import type { Message } from '../utils/types';

const logger = new Logger('background');
const storage = new StorageManager();
const interceptor = new RequestInterceptor();

/**
 * Initialize extension on install / update
 */
browser.runtime.onInstalled.addListener(async (details) => {
  logger.info(`GenSpark OpenClaw installed (reason: ${details.reason})`);

  await storage.set('enabled', true);
  await storage.set('bypassRateLimit', true);
  await storage.set('unlockSearch', true);
  await storage.set('unlockAgents', true);
  await storage.set('version', browser.runtime.getManifest().version);

  if (details.reason === 'install') {
    await browser.tabs.create({
      url: 'https://github.com/openclaw/genspark.ai-openclaw#getting-started',
    });
  }
});

/**
 * Handle messages from content scripts and popup
 */
browser.runtime.onMessage.addListener(async (message: Message) => {
  logger.debug('Received message:', message);

  switch (message.type) {
    case 'GET_STATUS':
      return {
        enabled: await storage.get<boolean>('enabled'),
        bypassRateLimit: await storage.get<boolean>('bypassRateLimit'),
        unlockSearch: await storage.get<boolean>('unlockSearch'),
        unlockAgents: await storage.get<boolean>('unlockAgents'),
      };

    case 'SET_OPTION':
      await storage.set(message.key, message.value);
      logger.info(`Option updated: ${message.key} = ${message.value}`);
      return { success: true };

    case 'RELOAD_GENSPARK':
      const tabs = await browser.tabs.query({ url: '*://*.genspark.ai/*' });
      for (const tab of tabs) {
        if (tab.id) await browser.tabs.reload(tab.id);
      }
      return { success: true, reloaded: tabs.length };

    case 'GET_VERSION':
      return { version: browser.runtime.getManifest().version };

    default:
      logger.warn('Unknown message type:', message.type);
      return { error: 'Unknown message type' };
  }
});

/**
 * Intercept and modify requests to genspark.ai
 */
browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => interceptor.modifyRequestHeaders(details),
  { urls: ['*://*.genspark.ai/*', '*://api.genspark.ai/*'] },
  ['blocking', 'requestHeaders']
);

browser.webRequest.onHeadersReceived.addListener(
  (details) => interceptor.modifyResponseHeaders(details),
  { urls: ['*://*.genspark.ai/*', '*://api.genspark.ai/*'] },
  ['blocking', 'responseHeaders']
);

logger.info('GenSpark OpenClaw background worker started');
