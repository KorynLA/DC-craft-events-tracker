import { render, screen, waitFor, act } from "@testing-library/react";
import AuthCallbackPage from "../AuthCallbackPage";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("../style/authCallbackPage.css", () => ({}));

// Freeze location so we can control the search string
const mockLocation = (search = "") => {
  delete window.location;
  window.location = { search, href: "" };
};

// Helper to mock a successful fetch response
const mockFetchSuccess = () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
};

// Helper to mock a failed fetch response (non-2xx)
const mockFetchFailure = () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false });
};

// Helper to mock a fetch network error
const mockFetchNetworkError = () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
};

// Silence expected console.error calls
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.useFakeTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("AuthCallbackPage", () => {

  // ── Loading state ────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows spinner and loading text on initial render", () => {
      mockLocation("?code=abc123");
      mockFetchSuccess();

      render(<AuthCallbackPage />);

      expect(screen.getByText("Signing you in...")).toBeInTheDocument();
      expect(document.querySelector(".callback-spinner")).toBeInTheDocument();
    });

    it("does not show success or error content while loading", () => {
      mockLocation("?code=abc123");
      mockFetchSuccess();

      render(<AuthCallbackPage />);

      expect(screen.queryByText("Successfully Logged In")).not.toBeInTheDocument();
      expect(screen.queryByText("There Was an Error")).not.toBeInTheDocument();
    });
  });

  // ── Success state ────────────────────────────────────────────────────────

  describe("success state", () => {
    it("shows success heading and body after successful fetch", async () => {
      mockLocation("?code=abc123&state=xyz");
      mockFetchSuccess();

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("Successfully Logged In")).toBeInTheDocument();
      });

      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      expect(document.querySelector(".callback-circle--success")).toBeInTheDocument();
    });

    it("calls fetch with correct options", async () => {
      mockLocation("?code=abc123&state=xyz");
      mockFetchSuccess();

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code: "abc123", state: "xyz" }),
        });
      });
    });

    it("redirects to '/' after 2 seconds on success", async () => {
      mockLocation("?code=abc123");
      mockFetchSuccess();

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("Successfully Logged In")).toBeInTheDocument();
      });

      act(() => jest.advanceTimersByTime(2000));

      expect(window.location.href).toBe("/");
    });

    it("does not redirect before 2 seconds have passed", async () => {
      mockLocation("?code=abc123");
      mockFetchSuccess();

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("Successfully Logged In")).toBeInTheDocument();
      });

      act(() => jest.advanceTimersByTime(1999));

      expect(window.location.href).not.toBe("/");
    });
  });

  // ── Error state ──────────────────────────────────────────────────────────

  describe("error state", () => {
    it("shows error heading when no code is present in the URL", async () => {
      mockLocation("");
      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("There Was an Error")).toBeInTheDocument();
      });

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(document.querySelector(".callback-circle--error")).toBeInTheDocument();
    });

    it("shows error state when fetch returns a non-ok response", async () => {
      mockLocation("?code=abc123");
      mockFetchFailure();

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("There Was an Error")).toBeInTheDocument();
      });
    });

    it("shows error state when fetch throws a network error", async () => {
      mockLocation("?code=abc123");
      mockFetchNetworkError();

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("There Was an Error")).toBeInTheDocument();
      });
    });

    it("logs the error to console on fetch failure", async () => {
      mockLocation("?code=abc123");
      mockFetchNetworkError();

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });

    it("does not redirect to '/' on error", async () => {
      mockLocation("?code=abc123");
      mockFetchFailure();

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("There Was an Error")).toBeInTheDocument();
      });

      act(() => jest.advanceTimersByTime(5000));

      expect(window.location.href).not.toBe("/");
    });
  });

  // ── State mutual exclusivity ─────────────────────────────────────────────

  describe("state exclusivity", () => {
    it("does not show loading content after success", async () => {
      mockLocation("?code=abc123");
      mockFetchSuccess();

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("Successfully Logged In")).toBeInTheDocument();
      });

      expect(screen.queryByText("Signing you in...")).not.toBeInTheDocument();
    });

    it("does not show loading content after error", async () => {
      mockLocation("");
      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("There Was an Error")).toBeInTheDocument();
      });

      expect(screen.queryByText("Signing you in...")).not.toBeInTheDocument();
    });

    it("does not show success content when in error state", async () => {
      mockLocation("");
      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText("There Was an Error")).toBeInTheDocument();
      });

      expect(screen.queryByText("Successfully Logged In")).not.toBeInTheDocument();
    });
  });

});