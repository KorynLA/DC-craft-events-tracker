import { useState } from 'react';
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
    // Update active tab state for immediate visual feedback
    setActiveTab(tab);
    
    // Navigate to the corresponding route
    switch (tab) {
      case 'about':
        navigate('/about');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'submit-event':
        navigate('/submit-event');
        break;
      default:
        // Fallback to root route for unknown tab identifiers
        navigate('/');
    }
  };

  return (
    <div className="nav-tabs-container">
      <div className="nav-tabs">
        {/* About Tab */}
        <div 
          className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => handleTabClick('about')}
          role="button"
          tabIndex={0}
          aria-label="Navigate to About page"
        >
          About
        </div>
        
        {/* Calendar Tab */}
        <div 
          className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => handleTabClick('calendar')}
          role="button"
          tabIndex={0}
          aria-label="Navigate to Calendar page"
        >
          Calendar
        </div>
        
        {/* Submit Event Tab */}
        <div 
          className={`nav-tab ${activeTab === 'submit-event' ? 'active' : ''}`}
          onClick={() => handleTabClick('submit-event')}
          role="button"
          tabIndex={0}
          aria-label="Navigate to Submit Event page"
        >
          Submit Event
        </div>
      </div>
    </div>
  );
}