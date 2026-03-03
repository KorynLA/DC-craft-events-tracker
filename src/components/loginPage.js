import { useState } from 'react';
import { useNavigate } from 'react-router';
import './style/loginPage.css';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      // await Auth.federatedSignIn({ provider: 'Google' });
      await new Promise((r) => setTimeout(r, 1500));
      navigate('/about');
    } catch (err) {
      setError('Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">

        <h2 className="login-title">Sign In</h2>
        <p className="login-subtitle">
          Sign in or create an account to submit community events
        </p>

        {error && <div className="login-error">{error}</div>}

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          aria-label="Sign in with Google"
        >
          {isLoading ? (
            <span className="btn-spinner" />
          ) : (
            <svg className="google-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.1 29.53 1 24 1 14.82 1 7.07 6.48 3.56 14.22l7.1 5.52C12.47 13.36 17.77 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.68c-.55 2.96-2.2 5.47-4.68 7.16l7.18 5.57C43.34 37.52 46.52 31.5 46.52 24.5z"/>
              <path fill="#FBBC05" d="M10.66 28.26A14.56 14.56 0 0 1 9.5 24c0-1.48.25-2.91.66-4.26l-7.1-5.52A23.93 23.93 0 0 0 .5 24c0 3.87.93 7.53 2.56 10.78l7.6-6.52z"/>
              <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.18-5.57C28.6 37.88 26.41 38.5 24 38.5c-6.23 0-11.53-3.86-13.34-9.24l-7.6 6.52C6.57 43.07 14.63 47 24 47z"/>
            </svg>
          )}
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

      </div>
    </div>
  );
}