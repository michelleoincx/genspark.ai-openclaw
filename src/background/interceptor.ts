import { Logger } from '../utils/logger';
import { StorageManager } from '../utils/storage';

const logger = new Logger('interceptor');
const storage = new StorageManager();

/**
 * Handles modification of HTTP requests/responses to genspark.ai
 * to remove rate limiting, paywalls and access restrictions.
 */
export class RequestInterceptor {
  /**
   * Spoof headers to look like a premium/authorized client
   */
  modifyRequestHeaders(
    details: browser.webRequest.OnBeforeSendHeadersDetailsType
  ): browser.webRequest.BlockingResponse {
    const headers = details.requestHeaders ?? [];

    // Remove tracking / fingerprinting headers
    const headersToRemove = new Set([
      'x-ratelimit-token',
      'x-usage-token',
      'x-plan-tier',
      'x-quota-remaining',
    ]);

    const filtered = headers.filter(
      (h) => !headersToRemove.has(h.name.toLowerCase())
    );

    // Inject bypass headers
    filtered.push(
      { name: 'X-Openclaw-Bypass', value: '1' },
      { name: 'X-Client-Version', value: 'web/latest' }
    );

    logger.debug(`Modified request headers for ${details.url}`);

    return { requestHeaders: filtered };
  }

  /**
   * Strip response headers that enforce rate limits or paywalls
   */
  modifyResponseHeaders(
    details: browser.webRequest.OnHeadersReceivedDetailsType
  ): browser.webRequest.BlockingResponse {
    const headers = details.responseHeaders ?? [];

    const headersToStrip = new Set([
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'retry-after',
    ]);

    const filtered = headers.filter(
      (h) => !headersToStrip.has(h.name.toLowerCase())
    );

    return { responseHeaders: filtered };
  }
}
