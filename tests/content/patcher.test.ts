import { DOMPatcher } from '../../src/content/patcher';

describe('DOMPatcher', () => {
  let patcher: DOMPatcher;

  beforeEach(() => {
    patcher = new DOMPatcher();
  });

  describe('patchApiPayload (private via any cast)', () => {
    it('removes rate limit error codes', () => {
      const payload = { error_code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' };
      // @ts-expect-error accessing private method for testing
      const result = patcher.patchApiPayload(payload, 'https://api.genspark.ai/search');
      expect(result).not.toHaveProperty('error_code');
      expect(result).toHaveProperty('success', true);
    });

    it('sets quota_remaining to high value', () => {
      const payload = { quota_remaining: 0, results: [] };
      // @ts-expect-error accessing private method for testing
      const result = patcher.patchApiPayload(payload, 'https://api.genspark.ai/query');
      expect((result as { quota_remaining: number }).quota_remaining).toBe(999999);
    });

    it('sets searches_remaining to high value', () => {
      const payload = { searches_remaining: 0 };
      // @ts-expect-error accessing private method for testing
      const result = patcher.patchApiPayload(payload, 'https://api.genspark.ai/search');
      expect((result as { searches_remaining: number }).searches_remaining).toBe(999999);
    });

    it('passes through unrelated payloads unchanged', () => {
      const payload = { results: ['a', 'b', 'c'], total: 3 };
      // @ts-expect-error accessing private method for testing
      const result = patcher.patchApiPayload(payload, 'https://api.genspark.ai/search');
      expect(result).toEqual(payload);
    });

    it('handles non-object payloads', () => {
      // @ts-expect-error accessing private method for testing
      expect(patcher.patchApiPayload('hello', '')).toBe('hello');
      // @ts-expect-error accessing private method for testing
      expect(patcher.patchApiPayload(null, '')).toBeNull();
    });
  });
});
