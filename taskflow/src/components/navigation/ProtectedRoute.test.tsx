import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../../stores/authStore';

// ProtectedRoute is the only thing standing between an unauthenticated
// visitor and the app's pages on the client side (the API is the real
// enforcement point, but a broken gate here would still be a bad UX/defense
// -in-depth regression). Mock the store so each test controls auth state
// directly instead of going through real login.
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as Mock;

function renderProtectedRoute(isAuthenticated: boolean) {
  mockUseAuthStore.mockImplementation((selector: (state: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated }),
  );

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Secret dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReset();
  });

  it('renders the protected content when authenticated', () => {
    renderProtectedRoute(true);

    expect(screen.getByText('Secret dashboard')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderProtectedRoute(false);

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret dashboard')).not.toBeInTheDocument();
  });
});
