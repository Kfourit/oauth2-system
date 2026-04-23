import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  startLogin,
  handleCallback,
  logout,
  getAccessToken,
  isLoggedIn,
} from '../services/auth';

// Replace window.location with a writable object so href assignment doesn't
// trigger real jsdom navigation.
const mockLocation = { href: '', search: '' };
vi.stubGlobal('location', mockLocation);

global.fetch = vi.fn();

describe('auth service', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
    mockLocation.href = '';
    mockLocation.search = '';
  });

  // ---------------------------------------------------------------------------
  // startLogin
  // ---------------------------------------------------------------------------
  describe('startLogin', () => {
    it('stores pkce_verifier and pkce_state in sessionStorage', async () => {
      await startLogin();
      expect(sessionStorage.getItem('pkce_verifier')).toBeTruthy();
      expect(sessionStorage.getItem('pkce_state')).toBeTruthy();
    });

    it('generates a unique state on each call', async () => {
      await startLogin();
      const first = sessionStorage.getItem('pkce_state');
      sessionStorage.clear();
      await startLogin();
      const second = sessionStorage.getItem('pkce_state');
      expect(first).not.toBe(second);
    });

    it('redirects to the auth server authorization endpoint', async () => {
      await startLogin();
      expect(mockLocation.href).toContain('http://localhost:9000/oauth2/authorize');
    });

    it('includes required PKCE and OAuth2 params in the redirect URL', async () => {
      await startLogin();
      expect(mockLocation.href).toContain('response_type=code');
      expect(mockLocation.href).toContain('client_id=test-client');
      expect(mockLocation.href).toContain('code_challenge_method=S256');
      expect(mockLocation.href).toContain('scope=openid');
    });

    it('state in URL matches the value stored in sessionStorage', async () => {
      await startLogin();
      const storedState = sessionStorage.getItem('pkce_state');
      expect(mockLocation.href).toContain(`state=${storedState}`);
    });
  });

  // ---------------------------------------------------------------------------
  // handleCallback
  // ---------------------------------------------------------------------------
  describe('handleCallback', () => {
    it('throws on state mismatch', async () => {
      sessionStorage.setItem('pkce_state', 'correct-state');
      sessionStorage.setItem('pkce_verifier', 'verifier');

      await expect(handleCallback('code123', 'wrong-state'))
        .rejects.toThrow('State mismatch');
    });

    it('throws when no state is stored in sessionStorage', async () => {
      await expect(handleCallback('code123', 'any-state'))
        .rejects.toThrow('State mismatch');
    });

    it('stores all tokens in localStorage on successful exchange', async () => {
      sessionStorage.setItem('pkce_state', 'my-state');
      sessionStorage.setItem('pkce_verifier', 'my-verifier');
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'access123',
          refresh_token: 'refresh456',
          id_token: 'id789',
        }),
      });

      await handleCallback('code123', 'my-state');

      expect(localStorage.getItem('access_token')).toBe('access123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh456');
      expect(localStorage.getItem('id_token')).toBe('id789');
    });

    it('clears pkce values from sessionStorage after successful exchange', async () => {
      sessionStorage.setItem('pkce_state', 'my-state');
      sessionStorage.setItem('pkce_verifier', 'my-verifier');
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'tok' }),
      });

      await handleCallback('code123', 'my-state');

      expect(sessionStorage.getItem('pkce_state')).toBeNull();
      expect(sessionStorage.getItem('pkce_verifier')).toBeNull();
    });

    it('throws with error_description when token exchange fails', async () => {
      sessionStorage.setItem('pkce_state', 'my-state');
      sessionStorage.setItem('pkce_verifier', 'my-verifier');
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'invalid_grant', error_description: 'Code expired' }),
      });

      await expect(handleCallback('code123', 'my-state'))
        .rejects.toThrow('Code expired');
    });

    it('throws with error code when error_description is absent', async () => {
      sessionStorage.setItem('pkce_state', 'my-state');
      sessionStorage.setItem('pkce_verifier', 'my-verifier');
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'server_error' }),
      });

      await expect(handleCallback('code123', 'my-state'))
        .rejects.toThrow('server_error');
    });
  });

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------
  describe('logout', () => {
    it('removes all token keys from localStorage', () => {
      localStorage.setItem('access_token', 'tok');
      localStorage.setItem('refresh_token', 'ref');
      localStorage.setItem('id_token', 'id');

      logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('id_token')).toBeNull();
    });

    it('redirects to the root path', () => {
      logout();
      expect(mockLocation.href).toBe('/');
    });
  });

  // ---------------------------------------------------------------------------
  // getAccessToken / isLoggedIn
  // ---------------------------------------------------------------------------
  describe('getAccessToken', () => {
    it('returns the stored access token', () => {
      localStorage.setItem('access_token', 'my-token');
      expect(getAccessToken()).toBe('my-token');
    });

    it('returns null when no token is stored', () => {
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('returns true when an access token exists', () => {
      localStorage.setItem('access_token', 'tok');
      expect(isLoggedIn()).toBe(true);
    });

    it('returns false when no access token exists', () => {
      expect(isLoggedIn()).toBe(false);
    });
  });
});
