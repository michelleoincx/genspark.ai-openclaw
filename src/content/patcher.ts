import { Logger } from '../utils/logger';

const logger = new Logger('patcher');

/**
 * Patches JavaScript APIs and internal genspark.ai functions
 * to bypass rate limits, paywall checks, and feature gates.
 */
export class DOMPatcher {
  /**
   * Override fetch/XHR to intercept and modify API responses
   */
  patchRateLimitAPIs(): void {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);

      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('genspark.ai/api') || url.includes('api.genspark.ai')) {
        return this.processApiResponse(response, url);
      }

      return response;
    };

    logger.debug('Fetch API patched');
  }

  /**
   * Intercept and unlock feature flags
   */
  patchFeatureFlags(): void {
    // Override localStorage to spoof premium plan flags
    const originalGetItem = Storage.prototype.getItem;

    Storage.prototype.getItem = function (key: string): string | null {
      const premiumKeys: Record<string, string> = {
        'gs_plan': 'pro',
        'gs_tier': 'premium',
        'gs_rate_limit': '9999',
        'gs_searches_remaining': '9999',
        'gs_agent_access': 'true',
      };

      if (key in premiumKeys) {
        logger.debug(`Spoofing localStorage key: ${key}`);
        return premiumKeys[key];
      }

      return originalGetItem.call(this, key);
    };

    logger.debug('Feature flags patched');
  }

  /**
   * Override auth/plan checks to return "authenticated premium user"
   */
  patchAuthChecks(): void {
    // Inject script into page context to access internal JS variables
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        // Override any plan/tier checks
        Object.defineProperty(window, '__GENSPARK_PLAN__', {
          get: () => ({ tier: 'pro', unlimited: true, agentsEnabled: true }),
          configurable: true
        });

        // Intercept rate limit responses
        const _origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
          this._url = args[1];
          return _origOpen.apply(this, args);
        };
      })();
    `;

    document.documentElement.appendChild(script);
    script.remove();

    logger.debug('Auth checks patched');
  }

  private async processApiResponse(response: Response, url: string): Promise<Response> {
    // Clone response to read body
    const clone = response.clone();
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
      return response;
    }

    try {
      const data = await clone.json();
      const patched = this.patchApiPayload(data, url);

      return new Response(JSON.stringify(patched), {
        status: 200, // Force 200 even on 429s
        statusText: 'OK',
        headers: response.headers,
      });
    } catch {
      return response;
    }
  }

  private patchApiPayload(data: unknown, _url: string): unknown {
    if (typeof data !== 'object' || data === null) return data;

    const obj = data as Record<string, unknown>;

    // Remove error codes for rate limit / quota exceeded
    if (obj.error_code === 'RATE_LIMIT_EXCEEDED') {
      delete obj.error_code;
      obj.success = true;
    }

    if (obj.quota_remaining !== undefined) {
      obj.quota_remaining = 999999;
    }

    if (obj.searches_remaining !== undefined) {
      obj.searches_remaining = 999999;
    }

    return obj;
  }
}
