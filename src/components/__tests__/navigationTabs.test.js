import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import NavigationTabs from '../navigationTabs';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../style/navigationTabs.css', () => ({}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const setLoggedIn = (value) => {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: value ? 'logged_in=true' : '',
  });
};

const renderNav = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavigationTabs />
    </MemoryRouter>
  );

const setDesktop = () =>
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
const setMobile = () =>
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });

beforeEach(() => {
  mockNavigate.mockClear();
  setDesktop();
  setLoggedIn(false);
});

// ─────────────────────────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - rendering', () => {
  it('renders the logo text', () => {
    renderNav();
    expect(screen.getByText(/CreateDMV/i)).toBeInTheDocument();
  });

  it('renders the Calendar tab', () => {
    renderNav();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('renders the Submit tab', () => {
    renderNav();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders exactly 2 nav tabs', () => {
    renderNav();
    const tabs = screen.getAllByRole('button', { name: /navigate to (calendar|submit event)/i });
    expect(tabs).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE TAB — ROUTE DRIVEN
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - active tab by route', () => {
  it('does not mark any nav tab active on the root path', () => {
    renderNav('/');
    const calendarTab = screen.getByText('Calendar').closest('[role="button"]');
    const submitTab   = screen.getByText('Submit').closest('[role="button"]');
    expect(calendarTab).not.toHaveClass('active');
    expect(submitTab).not.toHaveClass('active');
  });

  it('marks Calendar tab active on /calendar', () => {
    renderNav('/calendar');
    expect(screen.getByText('Calendar').closest('[role="button"]')).toHaveClass('active');
  });

  it('does not mark Submit tab active on /calendar', () => {
    renderNav('/calendar');
    expect(screen.getByText('Submit').closest('[role="button"]')).not.toHaveClass('active');
  });

  it('marks Submit tab active on /submit-event', () => {
    renderNav('/submit-event');
    expect(screen.getByText('Submit').closest('[role="button"]')).toHaveClass('active');
  });

  it('does not mark Calendar tab active on /submit-event', () => {
    renderNav('/submit-event');
    expect(screen.getByText('Calendar').closest('[role="button"]')).not.toHaveClass('active');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION — CLICK HANDLERS
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - navigation on click', () => {
  it('navigates to /calendar when Calendar tab is clicked', () => {
    renderNav();
    fireEvent.click(screen.getByText('Calendar'));
    expect(mockNavigate).toHaveBeenCalledWith('/calendar');
  });

  it('navigates to /submit-event when Submit tab is clicked', () => {
    renderNav();
    fireEvent.click(screen.getByText('Submit'));
    expect(mockNavigate).toHaveBeenCalledWith('/submit-event');
  });

  it('navigates to / when logo is clicked', () => {
    renderNav('/calendar');
    fireEvent.click(screen.getByLabelText('Navigate to About page'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN / LOGOUT TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - login/logout toggle', () => {
  it('shows Log In button when user is not logged in', () => {
    setLoggedIn(false);
    renderNav();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('does not show Log Out button when user is not logged in', () => {
    setLoggedIn(false);
    renderNav();
    expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument();
  });

  it('shows Log Out button when user is logged in', () => {
    setLoggedIn(true);
    renderNav();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  it('does not show Log In button when user is logged in', () => {
    setLoggedIn(true);
    renderNav();
    expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument();
  });

  it('login button has the login-btn class', () => {
    setLoggedIn(false);
    renderNav();
    expect(screen.getByRole('button', { name: /log in/i })).toHaveClass('login-btn');
  });

  it('logout button has the login-btn class', () => {
    setLoggedIn(true);
    renderNav();
    expect(screen.getByRole('button', { name: /log out/i })).toHaveClass('login-btn');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - accessibility', () => {
  it('Calendar tab has correct aria-label', () => {
    renderNav();
    expect(screen.getByLabelText('Navigate to Calendar page')).toBeInTheDocument();
  });

  it('Submit tab has correct aria-label', () => {
    renderNav();
    expect(screen.getByLabelText('Navigate to Submit Event page')).toBeInTheDocument();
  });

  it('logo has correct aria-label', () => {
    renderNav();
    expect(screen.getByLabelText('Navigate to About page')).toBeInTheDocument();
  });

  it('nav tabs and logo all have aria-labels', () => {
    renderNav();
    const labeled = [
      'Navigate to About page',
      'Navigate to Calendar page',
      'Navigate to Submit Event page',
    ];
    labeled.forEach(label => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE — HAMBURGER MENU
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - mobile hamburger menu', () => {
  beforeEach(() => {
    setMobile();
  });

  it('renders the hamburger button on mobile', () => {
    renderNav();
    act(() => { window.dispatchEvent(new Event('resize')); });
    expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
  });

  it('mobile menu is not visible before hamburger is clicked', () => {
    renderNav();
    act(() => { window.dispatchEvent(new Event('resize')); });
    expect(document.querySelectorAll('.mobile-menu-item')).toHaveLength(0);
  });

  it('mobile menu opens when hamburger is clicked', () => {
    renderNav();
    act(() => { window.dispatchEvent(new Event('resize')); });
    fireEvent.click(screen.getByLabelText('Toggle navigation menu'));
    expect(document.querySelectorAll('.mobile-menu-item').length).toBeGreaterThan(0);
  });

  it('mobile menu closes after a menu item is clicked', () => {
    renderNav();
    act(() => { window.dispatchEvent(new Event('resize')); });
    fireEvent.click(screen.getByLabelText('Toggle navigation menu'));
    const mobileItems = document.querySelectorAll('.mobile-menu-item');
    fireEvent.click(mobileItems[0]);
    expect(document.querySelectorAll('.mobile-menu-item')).toHaveLength(0);
  });

  it('hamburger aria-expanded is false by default', () => {
    renderNav();
    act(() => { window.dispatchEvent(new Event('resize')); });
    expect(screen.getByLabelText('Toggle navigation menu')).toHaveAttribute('aria-expanded', 'false');
  });

  it('hamburger aria-expanded is true when menu is open', () => {
    renderNav();
    act(() => { window.dispatchEvent(new Event('resize')); });
    fireEvent.click(screen.getByLabelText('Toggle navigation menu'));
    expect(screen.getByLabelText('Toggle navigation menu')).toHaveAttribute('aria-expanded', 'true');
  });
});
// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - logout functionality', () => {
  beforeEach(() => {
    process.env.REACT_APP_LOGOUT_URL = 'https://mock-logout-url.com'; // add this
    setLoggedIn(true);
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
    delete window.location;
    window.location = { reload: jest.fn(), origin: 'https://localhost' };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

it('calls fetch with credentials include on logout', async () => {
  process.env.REACT_APP_LOGOUT_URL = 'https://mock-logout-url.com';
  renderNav();
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
  });
  expect(global.fetch).toHaveBeenCalledWith(
    'https://mock-logout-url.com',
    expect.objectContaining({ credentials: 'include' })
  );
});

it('calls fetch with the REACT_APP_LOGOUT_URL env variable', async () => {
  process.env.REACT_APP_LOGOUT_URL = 'https://mock-logout-url.com';
  renderNav();
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
  });
  expect(global.fetch).toHaveBeenCalledWith(
    'https://mock-logout-url.com',
    expect.anything()
  );
});

  it('clears the logged_in cookie on logout', async () => {
    renderNav();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    });
    expect(document.cookie).not.toContain('logged_in=true');
  });

  it('calls window.location.reload after logout', async () => {
    renderNav();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    });
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('still clears cookie and reloads even if fetch throws', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    renderNav();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    });
    expect(document.cookie).not.toContain('logged_in=true');
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('uses GET method for logout fetch', async () => {
    renderNav();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: 'GET' })
    );
  });
});