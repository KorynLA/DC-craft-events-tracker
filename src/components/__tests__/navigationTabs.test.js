import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import NavigationTabs from '../navigationTabs';

// Mock useNavigate so navigation doesn't throw in tests
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

/**
 * Helper to render NavigationTabs inside a MemoryRouter.
 * @param {string} initialPath - The route to simulate (default: '/')
 */
const renderNav = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavigationTabs />
    </MemoryRouter>
  );

// ─────────────────────────────────────────────────────────────────────────────
// TAB COUNT TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - tab count', () => {
  it('renders exactly 2 navigation tabs', () => {
    renderNav();
    const tabs = screen.getAllByRole('button', { name: /navigate to (calendar|submit event)/i });
    expect(tabs).toHaveLength(2);
  });

  it('renders exactly 3 interactive elements total (logo + 2 tabs)', () => {
    renderNav();
    const allButtons = screen.getAllByRole('button');
    expect(allButtons).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TAB NAME TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - tab names', () => {
  it('renders a "Calendar" tab', () => {
    renderNav();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('renders a "Submit" tab', () => {
    renderNav();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('tab names match the expected set exactly', () => {
    renderNav();
    const EXPECTED_TAB_NAMES = ['Calendar', 'Submit'];
    const tabs = screen.getAllByRole('button', { name: /navigate to (calendar|submit event)/i });
    const actualNames = tabs.map((tab) => tab.textContent.trim());
    expect(actualNames).toEqual(EXPECTED_TAB_NAMES);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE TAB TESTS (route-driven)
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - active tab by route', () => {
  it('does not mark any nav tab active on the root path', () => {
    renderNav('/');
    const calendarTab = screen.getByText('Calendar').closest('[role="button"]');
    const submitTab   = screen.getByText('Submit').closest('[role="button"]');
    expect(calendarTab).not.toHaveClass('active');
    expect(submitTab).not.toHaveClass('active');
  });

  it('marks "Calendar" tab active on /calendar', () => {
    renderNav('/calendar');
    const calendarTab = screen.getByText('Calendar').closest('[role="button"]');
    expect(calendarTab).toHaveClass('active');
  });

  it('does not mark "Submit" tab active on /calendar', () => {
    renderNav('/calendar');
    const submitTab = screen.getByText('Submit').closest('[role="button"]');
    expect(submitTab).not.toHaveClass('active');
  });

  it('marks "Submit" tab active on /submit-event', () => {
    renderNav('/submit-event');
    const submitTab = screen.getByText('Submit').closest('[role="button"]');
    expect(submitTab).toHaveClass('active');
  });

  it('does not mark "Calendar" tab active on /submit-event', () => {
    renderNav('/submit-event');
    const calendarTab = screen.getByText('Calendar').closest('[role="button"]');
    expect(calendarTab).not.toHaveClass('active');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ARIA / ACCESSIBILITY TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('NavigationTabs - accessibility', () => {
  it('every tab has an aria-label', () => {
    renderNav();
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-label');
    });
  });

  it('Calendar tab has correct aria-label', () => {
    renderNav();
    expect(screen.getByLabelText('Navigate to Calendar page')).toBeInTheDocument();
  });

  it('Submit tab has correct aria-label', () => {
    renderNav();
    expect(screen.getByLabelText('Navigate to Submit Event page')).toBeInTheDocument();
  });
});