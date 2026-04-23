import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import * as authModule from '../services/auth';
import api from '../services/api';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.spyOn(authModule, 'isLoggedIn').mockReturnValue(true);
    vi.spyOn(authModule, 'logout').mockReturnValue(undefined);
    vi.spyOn(api, 'get').mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when the user is not logged in (redirects away)', () => {
    // DashboardPage calls navigate('/') and returns null when isLoggedIn() is false.
    vi.spyOn(authModule, 'isLoggedIn').mockReturnValue(false);
    const { container } = renderDashboard();
    // The component returns null so there is no content inside the router wrapper.
    expect(screen.queryByRole('heading', { name: /dashboard/i })).not.toBeInTheDocument();
    expect(container.querySelector('h1')).toBeNull();
  });

  it('renders all four endpoint buttons when logged in', () => {
    renderDashboard();

    expect(screen.getAllByRole('button', { name: /call/i })).toHaveLength(4);
    expect(screen.getByText(/api\/public\/health/i)).toBeInTheDocument();
    expect(screen.getByText(/api\/me/i)).toBeInTheDocument();
    expect(screen.getByText(/api\/data/i)).toBeInTheDocument();
    expect(screen.getByText(/api\/admin/i)).toBeInTheDocument();
  });

  it('renders the Logout button when logged in', () => {
    renderDashboard();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls logout when the Logout button is clicked', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: /logout/i }));

    expect(authModule.logout).toHaveBeenCalledOnce();
  });

  it('shows the API response after clicking a Call button', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'get').mockResolvedValue({ data: { status: 'UP' } });
    renderDashboard();

    await user.click(screen.getAllByRole('button', { name: /call/i })[0]);

    await waitFor(() => {
      expect(screen.getByText(/"status": "UP"/)).toBeInTheDocument();
    });
  });

  it('shows an error when the API call fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'get').mockRejectedValue({ message: 'Network Error', response: undefined });
    renderDashboard();

    await user.click(screen.getAllByRole('button', { name: /call/i })[1]);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
