import { Logger } from '../utils/logger';
import { sendMessage } from '../utils/messaging';
import { DOMPatcher } from './patcher';
import { PaywallObserver } from './paywall-observer';

const logger = new Logger('content');
const patcher = new DOMPatcher();
const paywallObserver = new PaywallObserver();

async function init(): Promise<void> {
  logger.info('GenSpark OpenClaw content script loaded');

  const status = await sendMessage({ type: 'GET_STATUS' });
  if (!status?.enabled) {
    logger.info('Extension disabled, skipping injection');
    return;
  }

  // Patch JS globals before page scripts run
  patcher.patchRateLimitAPIs();
  patcher.patchAuthChecks();
  patcher.patchFeatureFlags();

  // Observe DOM for paywall / limit modals and remove them
  paywallObserver.start();

  logger.info('All patches applied successfully');
}

// Run immediately (document_start)
init().catch((err) => {
  logger.error('Initialization failed:', err);
});
