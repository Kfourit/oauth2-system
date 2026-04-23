import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CallbackPage from '../pages/CallbackPage';
import * as authModule from '../services/auth';

// CallbackPage reads window.location.search directly (not useSearchParams).
const mockLocation = { href: 'http://localhost:3000/callback', search: '' };
vi.stubGlobal('location', mockLocation);

function renderCallback(search = '') {
  mockLocation.search = search;
  return render(
    <MemoryRouter initialEntries={[`/callback${search}`]}>
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CallbackPage', () => {
  beforeEach(() => {
    vi.spyOn(authModule, 'handleCallback').mockResolvedValue(undefined);
    mockLocation.search = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a loading message while processing', () => {
    vi.spyOn(authModule, 'handleCallback').mockReturnValue(new Promise(() => {}));
    renderCallback('?code=abc&state=xyz');
    expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();
  });

  it('navigates to /dashboard on successful callback', async () => {
    vi.spyOn(authModule, 'handleCallback').mockResolvedValue(undefined);
    renderCallback('?code=abc&state=xyz');

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  it('shows error message when handleCallback rejects', async () => {
    vi.spyOn(authModule, 'handleCallback').mockRejectedValue(
      new Error('State mismatch — possible CSRF attack')
    );
    renderCallback('?code=abc&state=xyz');

    await waitFor(() => {
      expect(screen.getByText(/state mismatch/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
  });

  it('shows error when the auth server returns an error param', async () => {
    renderCallback('?error=access_denied&error_description=User+denied+access');

    await waitFor(() => {
      expect(screen.getByText(/user denied access/i)).toBeInTheDocument();
    });
    expect(authModule.handleCallback).not.toHaveBeenCalled();
  });

  it('shows error when code or state is missing from the URL', async () => {
    renderCallback('?code=abc'); // no state param

    await waitFor(() => {
      expect(screen.getByText(/missing code or state/i)).toBeInTheDocument();
    });
    expect(authModule.handleCallback).not.toHaveBeenCalled();
  });
});
