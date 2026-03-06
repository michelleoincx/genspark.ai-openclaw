import { Logger } from '../utils/logger';

const logger = new Logger('paywall-observer');

const PAYWALL_SELECTORS = [
  '[class*="paywall"]',
  '[class*="rate-limit"]',
  '[class*="quota-exceeded"]',
  '[class*="upgrade-modal"]',
  '[class*="limit-reached"]',
  '[class*="subscription-wall"]',
  '[data-testid="paywall"]',
  '[data-testid="rate-limit-modal"]',
  '[data-testid="upgrade-prompt"]',
  '#rate-limit-overlay',
  '#paywall-overlay',
];

/**
 * Observes the DOM for paywall elements and removes them on detection.
 */
export class PaywallObserver {
  private observer: MutationObserver | null = null;

  start(): void {
    // Initial sweep
    this.sweep();

    // Watch for dynamically injected paywall elements
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          this.sweep();
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    logger.debug('Paywall observer started');
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
    logger.debug('Paywall observer stopped');
  }

  private sweep(): void {
    for (const selector of PAYWALL_SELECTORS) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        logger.info(`Removing paywall element: ${selector}`);
        el.remove();
      });
    }

    // Also re-enable any disabled inputs/buttons caused by rate limiting
    document.querySelectorAll<HTMLElement>('[data-limited="true"]').forEach((el) => {
      el.removeAttribute('data-limited');
      if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
        el.disabled = false;
      }
    });
  }
}
