import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventSubmissionForm from '../eventSubmissionForm';

// ─── Mock child components ────────────────────────────────────────────────────

jest.mock('../datePicker', () => ({ selectedDate, onDateChange, disabled }) => (
  <input
    data-testid="date-picker"
    value={selectedDate}
    onChange={(e) => onDateChange(e.target.value)}
    disabled={disabled}
  />
));

jest.mock('../timeSelector', () => ({ selectedTime, onTimeChange, disabled }) => (
  <select
    data-testid="time-selector"
    value={selectedTime}
    onChange={(e) => onTimeChange(e.target.value)}
    disabled={disabled}
  >
    <option value="">Select time</option>
    <option value="10:00 AM">10:00 AM</option>
    <option value="2:00 PM">2:00 PM</option>
  </select>
));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Sets document.cookie to simulate a logged-in user */
const setLoggedIn = () => {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: 'logged_in=true',
  });
};

/** Clears the login cookie to simulate a logged-out user */
const setLoggedOut = () => {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });
};

/** Fills all required fields with valid values */
const fillRequiredFields = async (user) => {
  await user.type(screen.getByLabelText(/event name/i), 'Test Event');
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/business name/i), 'Test Org');
  await user.type(screen.getByLabelText(/location name/i), 'Test Venue');
  await user.type(screen.getByLabelText(/event link/i), 'https://example.com');
  fireEvent.change(screen.getByTestId('date-picker'), { target: { value: '2099-12-31' } });
  fireEvent.change(screen.getByTestId('time-selector'), { target: { value: '10:00 AM' } });
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
  );
  process.env.REACT_APP_CALENDAR_URL = 'https://api.example.com/events';
  process.env.REACT_APP_LOGIN_URL = 'https://auth.example.com/login';
});

// ─── Login Overlay ────────────────────────────────────────────────────────────

describe('Login overlay', () => {
  it('shows the login overlay when the user is NOT logged in', () => {
    setLoggedOut();
    render(<EventSubmissionForm />);
    expect(screen.getByText('Login to Submit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('does NOT show the login overlay when the user IS logged in', () => {
    setLoggedIn();
    render(<EventSubmissionForm />);
    expect(screen.queryByText('Login to Submit')).not.toBeInTheDocument();
  });

  it('navigates to the login URL when the Log In button is clicked', () => {
    setLoggedOut();
    const assignMock = jest.fn();
    delete window.location;
    window.location = { assign: assignMock };

    render(<EventSubmissionForm />);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(assignMock).toHaveBeenCalledWith('https://auth.example.com/login');
  });

  it('alerts when the login URL is misconfigured', () => {
    setLoggedOut();
    process.env.REACT_APP_LOGIN_URL = 'not-a-valid-url';
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<EventSubmissionForm />);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(alertMock).toHaveBeenCalledWith('Login service is misconfigured.');
  });
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('Rendering', () => {
  beforeEach(() => setLoggedIn());

  it('renders the form title', () => {
    render(<EventSubmissionForm />);
    expect(screen.getByText('New Event')).toBeInTheDocument();
  });

  it('renders all required field labels', () => {
    render(<EventSubmissionForm />);
    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event link/i)).toBeInTheDocument();
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    expect(screen.getByTestId('time-selector')).toBeInTheDocument();
  });

  it('renders optional fields', () => {
    render(<EventSubmissionForm />);
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/kid-friendly/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<EventSubmissionForm />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});

// ─── Validation — Required Fields ─────────────────────────────────────────────

describe('Validation: required fields', () => {
  beforeEach(() => setLoggedIn());

  it('shows errors for all required fields when submitting an empty form', async () => {
    render(<EventSubmissionForm />);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Business name is required')).toBeInTheDocument();
      expect(screen.getByText('Location name is required')).toBeInTheDocument();
      expect(screen.getByText('Event link is required')).toBeInTheDocument();
      expect(screen.getByText('Date is required')).toBeInTheDocument();
      expect(screen.getByText('Time for event is required')).toBeInTheDocument();
    });
  });

  it('does NOT call the API when required fields are missing', async () => {
    render(<EventSubmissionForm />);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() => expect(global.fetch).not.toHaveBeenCalled());
  });
});

// ─── Validation — Field-Level Rules ───────────────────────────────────────────

describe('Validation: field-level rules', () => {
  beforeEach(() => setLoggedIn());

  it('rejects an event name exceeding 140 characters', async () => {
    render(<EventSubmissionForm />);
    fireEvent.change(screen.getByLabelText(/event name/i), {
      target: { value: 'a'.repeat(141) },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() =>
      expect(screen.getByText('Name must be less than 140 characters')).toBeInTheDocument()
    );
  });

  it('rejects an invalid email format', async () => {
    render(<EventSubmissionForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'not-an-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() =>
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    );
  });

  it('rejects an email exceeding 100 characters', async () => {
    render(<EventSubmissionForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: `${'a'.repeat(95)}@b.com` },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() =>
      expect(screen.getByText('Email must be less than 100 characters')).toBeInTheDocument()
    );
  });

  it('rejects a business name exceeding 200 characters', async () => {
    render(<EventSubmissionForm />);
    fireEvent.change(screen.getByLabelText(/business name/i), {
      target: { value: 'b'.repeat(201) },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() =>
      expect(screen.getByText('Business name must be less than 200 characters')).toBeInTheDocument()
    );
  });

  it('rejects a location name exceeding 200 characters', async () => {
    render(<EventSubmissionForm />);
    fireEvent.change(screen.getByLabelText(/location name/i), {
      target: { value: 'l'.repeat(201) },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() =>
      expect(screen.getByText('Location name must be less than 200 characters')).toBeInTheDocument()
    );
  });

  it('rejects a URL missing the protocol', async () => {
    render(<EventSubmissionForm />);
    fireEvent.change(screen.getByLabelText(/event link/i), {
      target: { value: 'example.com/event' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() =>
      expect(
        screen.getByText('Please enter a valid URL (include http:// or https://)')
      ).toBeInTheDocument()
    );
  });

  it('rejects a negative price', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    await user.clear(screen.getByLabelText(/price/i));
    await user.type(screen.getByLabelText(/price/i), '-5');
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() =>
      expect(screen.getByText('Price cannot be negative')).toBeInTheDocument()
    );
  });

  it('rejects a non-numeric price', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    await user.type(screen.getByLabelText(/price/i), 'free');
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() =>
      expect(screen.getByText('Price must be a valid number')).toBeInTheDocument()
    );
  });

  it('rejects a description exceeding 500 characters', async () => {
    render(<EventSubmissionForm />);
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'd'.repeat(501) },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() =>
      expect(
        screen.getByText('Description must be less than 500 characters')
      ).toBeInTheDocument()
    );
  });
});

// ─── Validation — Error Clearing ──────────────────────────────────────────────

describe('Validation: errors clear on input', () => {
  beforeEach(() => setLoggedIn());

  it('clears the name error when the user starts typing', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() => expect(screen.getByText('Name is required')).toBeInTheDocument());

    await user.type(screen.getByLabelText(/event name/i), 'T');
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  it('clears the date error when a date is selected', async () => {
    render(<EventSubmissionForm />);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() => expect(screen.getByText('Date is required')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('date-picker'), {
      target: { value: '2099-01-01' },
    });
    expect(screen.queryByText('Date is required')).not.toBeInTheDocument();
  });

  it('clears the time error when a time is selected', async () => {
    render(<EventSubmissionForm />);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await waitFor(() => expect(screen.getByText('Time for event is required')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('time-selector'), {
      target: { value: '10:00 AM' },
    });
    expect(screen.queryByText('Time for event is required')).not.toBeInTheDocument();
  });
});

// ─── Character Counters ───────────────────────────────────────────────────────

describe('Character counters', () => {
  beforeEach(() => setLoggedIn());

  it('shows the live character count for event name', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await user.type(screen.getByLabelText(/event name/i), 'Hello');
    expect(screen.getByText('5/140 characters')).toBeInTheDocument();
  });

  it('shows the live character count for description', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await user.type(screen.getByLabelText(/description/i), 'Hi');
    expect(screen.getByText('2/500 characters')).toBeInTheDocument();
  });
});

// ─── Kids Checkbox ────────────────────────────────────────────────────────────

describe('Kid-Friendly checkboxes', () => {
  beforeEach(() => setLoggedIn());

  it('selects "Yes"', () => {
    render(<EventSubmissionForm />);
    const yesCheckbox = screen.getByRole('checkbox', { name: /yes/i });
    fireEvent.click(yesCheckbox);
    expect(yesCheckbox).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /no/i })).not.toBeChecked();
  });

  it('selects "No"', () => {
    render(<EventSubmissionForm />);
    const noCheckbox = screen.getByRole('checkbox', { name: /no/i });
    fireEvent.click(noCheckbox);
    expect(noCheckbox).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /yes/i })).not.toBeChecked();
  });

  it('deselects "Yes" when clicked a second time (toggle off)', () => {
    render(<EventSubmissionForm />);
    const yesCheckbox = screen.getByRole('checkbox', { name: /yes/i });
    fireEvent.click(yesCheckbox);
    fireEvent.click(yesCheckbox);
    expect(yesCheckbox).not.toBeChecked();
  });

  it('switches from "Yes" to "No"', () => {
    render(<EventSubmissionForm />);
    fireEvent.click(screen.getByRole('checkbox', { name: /yes/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /no/i }));
    expect(screen.getByRole('checkbox', { name: /yes/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /no/i })).toBeChecked();
  });
});

// ─── Successful Submission ────────────────────────────────────────────────────

describe('Successful form submission', () => {
  beforeEach(() => setLoggedIn());

  it('calls the API with sanitized data on valid submission', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('https://api.example.com/events');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body);
    expect(body.name).toBe('Test Event');
    expect(body.email).toBe('test@example.com');
    expect(body.organization).toBe('Test Org');
    expect(body.location).toBe('Test Venue');
    expect(body.link).toBe('https://example.com');
    expect(body.date).toBe('2099-12-31');
  });

  it('shows the success message after a successful submission', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() =>
      expect(screen.getByText('Event submitted successfully!')).toBeInTheDocument()
    );
  });

  it('resets all fields after a successful submission', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() =>
      expect(screen.getByText('Event submitted successfully!')).toBeInTheDocument()
    );
    expect(screen.getByLabelText(/event name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  it('auto-hides the success message after 3 seconds', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() =>
      expect(screen.getByText('Event submitted successfully!')).toBeInTheDocument()
    );

    act(() => jest.advanceTimersByTime(3000));

    await waitFor(() =>
      expect(screen.queryByText('Event submitted successfully!')).not.toBeInTheDocument()
    );
    jest.useRealTimers();
  });

  it('shows "Submitting…" and disables the button during API call', async () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
    );
  });
});

// ─── API Errors ───────────────────────────────────────────────────────────────

describe('API error handling', () => {
  beforeEach(() => setLoggedIn());

  it('shows a generic error message when the API returns a non-OK response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal Server Error' }),
      })
    );
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() =>
      expect(screen.getByText('Failed to submit event. Please try again.')).toBeInTheDocument()
    );
  });

  it('shows an error message when the network request throws', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() =>
      expect(screen.getByText('Failed to submit event. Please try again.')).toBeInTheDocument()
    );
  });

  it('clears the API error message when the user edits a field', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() =>
      expect(screen.getByText('Failed to submit event. Please try again.')).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText(/event name/i), '!');
    expect(
      screen.queryByText('Failed to submit event. Please try again.')
    ).not.toBeInTheDocument();
  });
});

// ─── Sanitization ─────────────────────────────────────────────────────────────

describe('Input sanitization', () => {
  beforeEach(() => setLoggedIn());

  it('escapes HTML characters in the event name before submission', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);

    fireEvent.change(screen.getByLabelText(/event name/i), {
      target: { value: '<script>alert("xss")</script>' },
    });
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/business name/i), 'Org');
    await user.type(screen.getByLabelText(/location name/i), 'Venue');
    await user.type(screen.getByLabelText(/event link/i), 'https://example.com');
    fireEvent.change(screen.getByTestId('date-picker'), { target: { value: '2099-12-31' } });
    fireEvent.change(screen.getByTestId('time-selector'), { target: { value: '10:00 AM' } });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('converts a 12-hour AM time to 24-hour format', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.time).toBe('10:00'); // 10:00 AM → 10:00
  });

  it('converts a 12-hour PM time to 24-hour format', async () => {
    const user = userEvent.setup();
    render(<EventSubmissionForm />);
    await fillRequiredFields(user);
    // Override the time with a PM value
    fireEvent.change(screen.getByTestId('time-selector'), { target: { value: '2:00 PM' } });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.time).toBe('14:00'); // 2:00 PM → 14:00
  });
});