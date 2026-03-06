import browser from 'webextension-polyfill';
import { sendMessage } from '../utils/messaging';
import { Logger } from '../utils/logger';
import './popup.css';

const logger = new Logger('popup');

interface Status {
  enabled: boolean;
  bypassRateLimit: boolean;
  unlockSearch: boolean;
  unlockAgents: boolean;
}

async function renderPopup(): Promise<void> {
  const app = document.getElementById('app')!;
  const status = await sendMessage<Status>({ type: 'GET_STATUS' });
  const { version } = await sendMessage<{ version: string }>({ type: 'GET_VERSION' });

  app.innerHTML = `
    <div class="popup">
      <header class="popup__header">
        <div class="popup__logo">
          <img src="icons/icon48.png" alt="OpenClaw" width="24" height="24" />
          <span class="popup__title">GenSpark <strong>OpenClaw</strong></span>
        </div>
        <span class="popup__version">v${version}</span>
      </header>

      <div class="popup__status ${status.enabled ? 'popup__status--active' : 'popup__status--inactive'}">
        <div class="popup__status-dot"></div>
        <span>${status.enabled ? 'Active — All restrictions lifted' : 'Inactive'}</span>
      </div>

      <div class="popup__toggles">
        ${renderToggle('enabled', 'Master Switch', 'Enable / disable all patches', status.enabled)}
        ${renderToggle('bypassRateLimit', 'Bypass Rate Limits', 'Remove search & query caps', status.bypassRateLimit)}
        ${renderToggle('unlockSearch', 'Unlock Deep Search', 'Access advanced search features', status.unlockSearch)}
        ${renderToggle('unlockAgents', 'Unlock AI Agents', 'Enable premium agent capabilities', status.unlockAgents)}
      </div>

      <div class="popup__actions">
        <button id="btn-reload" class="popup__btn popup__btn--primary">
          ↺ Reload GenSpark tabs
        </button>
      </div>

      <footer class="popup__footer">
        <a href="https://github.com/openclaw/genspark.ai-openclaw" target="_blank">GitHub</a>
        <span>·</span>
        <a href="https://github.com/openclaw/genspark.ai-openclaw/issues" target="_blank">Report issue</a>
      </footer>
    </div>
  `;

  // Bind toggle events
  app.querySelectorAll<HTMLInputElement>('.toggle__input').forEach((input) => {
    input.addEventListener('change', async () => {
      await sendMessage({
        type: 'SET_OPTION',
        key: input.dataset.key!,
        value: input.checked,
      });
      logger.info(`Toggle ${input.dataset.key} = ${input.checked}`);
    });
  });

  // Bind reload button
  document.getElementById('btn-reload')?.addEventListener('click', async () => {
    const result = await sendMessage<{ reloaded: number }>({ type: 'RELOAD_GENSPARK' });
    const btn = document.getElementById('btn-reload')!;
    btn.textContent = `✓ Reloaded ${result.reloaded} tab(s)`;
    setTimeout(() => { btn.textContent = '↺ Reload GenSpark tabs'; }, 2000);
  });
}

function renderToggle(key: string, label: string, description: string, checked: boolean): string {
  return `
    <label class="toggle">
      <div class="toggle__info">
        <span class="toggle__label">${label}</span>
        <span class="toggle__desc">${description}</span>
      </div>
      <div class="toggle__switch">
        <input type="checkbox" class="toggle__input" data-key="${key}" ${checked ? 'checked' : ''} />
        <span class="toggle__slider"></span>
      </div>
    </label>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderPopup().catch((err) => logger.error('Popup render error:', err));
});
