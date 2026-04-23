import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from '../services/api';
import * as authModule from '../services/auth';

const mock = new MockAdapter(api);

describe('api axios instance', () => {
  beforeEach(() => {
    mock.reset();
    vi.spyOn(authModule, 'getAccessToken').mockReturnValue(null);
    vi.spyOn(authModule, 'refreshAccessToken').mockResolvedValue(undefined);
    vi.spyOn(authModule, 'logout').mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Request interceptor
  // ---------------------------------------------------------------------------
  describe('request interceptor', () => {
    it('adds Authorization header when a token is available', async () => {
      vi.spyOn(authModule, 'getAccessToken').mockReturnValue('bearer-tok');
      mock.onGet('/api/public/health').reply(200, { status: 'UP' });

      const res = await api.get('/api/public/health');

      expect(res.config.headers.Authorization).toBe('Bearer bearer-tok');
    });

    it('does not add Authorization header when there is no token', async () => {
      vi.spyOn(authModule, 'getAccessToken').mockReturnValue(null);
      mock.onGet('/api/public/health').reply(200, {});

      const res = await api.get('/api/public/health');

      expect(res.config.headers.Authorization).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // Response interceptor – 401 handling
  // ---------------------------------------------------------------------------
  describe('response interceptor', () => {
    it('calls refreshAccessToken on a 401 and retries with the new token', async () => {
      vi.spyOn(authModule, 'getAccessToken')
        .mockReturnValueOnce('expired-tok')
        .mockReturnValue('new-tok');

      mock
        .onGet('/api/me').replyOnce(401)
        .onGet('/api/me').reply(200, { subject: 'u1' });

      const res = await api.get('/api/me');

      expect(authModule.refreshAccessToken).toHaveBeenCalledOnce();
      expect(res.data).toEqual({ subject: 'u1' });
      expect(res.config.headers.Authorization).toBe('Bearer new-tok');
    });

    it('calls logout when there is no token after refresh', async () => {
      vi.spyOn(authModule, 'getAccessToken')
        .mockReturnValueOnce('expired-tok')
        .mockReturnValue(null);

      mock.onGet('/api/me').replyOnce(401);

      await expect(api.get('/api/me')).rejects.toThrow();

      expect(authModule.logout).toHaveBeenCalledOnce();
    });

    it('does not retry a second 401 to avoid infinite loops', async () => {
      vi.spyOn(authModule, 'getAccessToken').mockReturnValue('tok');

      mock.onGet('/api/data').reply(401);

      await expect(api.get('/api/data')).rejects.toThrow();

      expect(authModule.refreshAccessToken).toHaveBeenCalledOnce();
    });

    it('passes through non-401 errors without refreshing', async () => {
      vi.spyOn(authModule, 'getAccessToken').mockReturnValue('tok');
      mock.onGet('/api/data').reply(403);

      await expect(api.get('/api/data')).rejects.toThrow();

      expect(authModule.refreshAccessToken).not.toHaveBeenCalled();
    });
  });
});
