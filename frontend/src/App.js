import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationTabs from './components/navigationTabs';
import CalendarPage from './components/calendarPage';
import EventSubmissionForm from './components/eventSubmissionForm';
import AboutPage from './components/aboutPage';

/**
 * App - Main application component with routing
 * 
 * Sets up the primary navigation structure using React Router.
 * Provides a tabbed interface with three main pages: About, Calendar, and Event Submission.
 * Includes automatic redirect for unknown routes.
 * 
 * Routes:
 * - /about - About page (default route)
 * - /calendar - Calendar view page
 * - /submit-event - Event submission form
 * - /* - Any other path redirects to /about
 * 
 * @component
 * @example
 * // Typical usage as root component
 * import App from './App';
 * ReactDOM.render(<App />, document.getElementById('root'));
 * 
 * @returns {JSX.Element} The main application with routing
 */
export default function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Global navigation - appears on all pages */}
        <NavigationTabs />
        
        {/* Main content area - changes based on current route */}
        <div className="page-content">
          <Routes>
            {/* About page - landing/info page */}
            <Route path="/about" element={<AboutPage />} />
            
            {/* Calendar page - displays events in calendar format */}
            <Route path="/calendar" element={<CalendarPage />} />
            
            {/* Event submission page - form for creating new events */}
            <Route path="/submit-event" element={<EventSubmissionForm />} />
            
            {/* Catch-all route - redirects unknown paths to about page */}
            <Route path="*" element={<Navigate to="/about" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}