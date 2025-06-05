import './style/aboutPage.css';

/**
 * AboutPage Component
 * 
 * A React functional component that renders an informational page about the 
 * community event calendar application. This page provides users with an 
 * overview of the application's purpose, usage instructions, and contact details.
 * 
 * @returns {JSX.Element} The rendered about page with sections for welcome,
 *                        usage instructions, and contact information
 */
export default function AboutPage() {
  return (
    <div className="about-container">
      {/* Main page title */}
      <h1 className="about-title">About Our Event Calendar</h1>
      
      {/* Welcome section - explains the application's purpose */}
      <div className="about-section">
        <h2 className="about-section-title">Welcome to Our Community Calendar</h2>
        <p className="about-text">
          This calendar application serves as a central hub for all community events and activities. 
          Browse upcoming events, find activities that interest you, and submit your own events 
          to share with the community.
        </p>
      </div>
      
      {/* Usage instructions section - explains navigation and features */}
      <div className="about-section">
        <h2 className="about-section-title">How to Use This Application</h2>
        <p className="about-text">
          Navigate through the tabs above to access different features:
        </p>
        {/* Feature list explaining each navigation tab */}
        <ul className="about-list">
          <li><strong>About:</strong> Learn about the purpose and features of this application</li>
          <li><strong>Calendar:</strong> View all upcoming events in a calendar format</li>
          <li><strong>Submit Event:</strong> Add your own event to the community calendar</li>
        </ul>
      </div>
      
      {/* Contact information section - provides support details */}
      <div className="about-section">
        <h2 className="about-section-title">Contact Information</h2>
        <p className="about-text">
          If you have any questions or need assistance with the calendar, please contact us at:
          <br />
          Email: support@communitycalendar.example.com
          <br />
          Phone: (555) 123-4567
        </p>
      </div>
    </div>
  );
}