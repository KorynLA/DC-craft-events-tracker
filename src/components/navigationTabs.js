import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import './style/navigationTabs.css';

/**
 * NavigationTabs Component
 * 
 * A React functional component that provides tab-based navigation for the application.
 * Integrates with React Router to handle route changes and maintains visual state
 * synchronization between the current URL and active tab highlighting.
 * 
 * Features:
 * - Three main navigation tabs: About, Calendar, Submit Event
 * - Automatic active tab detection based on current route
 * - Click handlers for programmatic navigation
 * - Visual feedback for the currently active tab
 * 
 * @returns {JSX.Element} The rendered navigation tab interface
 */
export default function NavigationTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(
    document.cookie.split("; ").some(c => c === "logged_in=true")
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  /**
   * Determines which tab should be active based on the current URL path.
   * Uses route pattern matching to identify the appropriate tab.
   * 
   * @returns {string} The active tab identifier ('about', 'calendar', or 'submit-event')
   */
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/calendar')) {
      return 'calendar';
    } else if (path.includes('/submit-event')) {
      return 'submit-event';
    } else {
      // Default to 'about' for root path or unknown routes
      return 'about';
    }
  };
  
  // State to track the currently active tab for visual highlighting
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  /**
   * Handles tab click events by updating local state and navigating to the
   * corresponding route. Provides both visual feedback and URL synchronization.
   * 
   * @param {string} tab - The identifier of the clicked tab
   *                      ('about', 'calendar', or 'submit-event')
   */
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    switch (tab) {
      case 'calendar':
        navigate('/calendar');
        break;
      case 'submit-event':
        navigate('/submit-event');
        break;
      default:
        navigate('/');
    }
  };

  /**
   * Handles button click events by navigating to the login URL
   */
  const handleButtonLoginClick = () => {
    const loginUrl = process.env.REACT_APP_LOGIN_URL;
    try {
      new URL(loginUrl);
      window.location.assign(loginUrl);
    } catch (err) {
      console.error("Invalid login URL", err);
      alert("Login service is misconfigured.");
    }
    window.location.href = process.env.REACT_APP_LOGIN_URL;
    if (!loginUrl) {
      alert("Login is temporarily unavailable. Please try again later.");
      return;
    }
  };

  /**
   * Handles button click events by navigating to the login URL
   */
  const handleButtonLogoutClick = async () => {
    try {
      await fetch(process.env.REACT_APP_LOGOUT_URL, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed", err);
    }

    document.cookie = "logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    setLoggedIn(false);
    window.location.reload();
  };

  return (
    <div className="header ">
      <div className="logo"           
        onClick={() => handleTabClick('about')}
        role="button"
        tabIndex={0}
        aria-label="Navigate to About page">
        CreateDMV<span className="period">.</span>
      </div>
      <div className="nav-tabs">
        <div 
          className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => handleTabClick('calendar')}
          role="button"
          tabIndex={0}
          aria-label="Navigate to Calendar page"
        >
          Calendar
        </div>
        
        <div 
          className={`nav-tab ${activeTab === 'submit-event' ? 'active' : ''}`}
          onClick={() => handleTabClick('submit-event')}
          role="button"
          tabIndex={0}
          aria-label="Navigate to Submit Event page"
        >
          Submit
        </div>
      </div>
      <div className="header-actions">
      {isLoggedIn ? <button aria-label="Log out" className="login-btn" onClick={handleButtonLogoutClick}>Log Out</button> : <button aria-label="Log in" className="login-btn" onClick={handleButtonLoginClick}>Log In</button>}
        {isMobile && (
          <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen}>
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        )}
      </div>
      {isMobile && mobileMenuOpen && (
        <div className="mobile-menu">
        {['calendar', 'submit-event'].map(tab => (
          <div key={tab} className={`mobile-menu-item ${activeTab === tab ? 'active' : ''}`} onClick={() => handleTabClick(tab)} role="button" tabIndex={0}>
            {tab === 'submit-event' ? 'Submit' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>))}
        </div>
      )}
    </div>
  );
}