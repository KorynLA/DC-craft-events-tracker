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
      <h1 className="about-title">About The Craft Event Calendar</h1>
      
      <div className="about-section">
        <h2 className="about-section-title">Welcome to The Community Calendar</h2>
        <p className="about-text">
          This calendar application serves as a central hub for all craft related community events and activities. 
          Browse upcoming events  and submit your own events to share with the community.
        </p>
      </div>
      

      <div className="usage-section">
        <h2 className="usage-section-title">How to Use This Application</h2>
        <p className="usage-text">
          Navigate through the tabs above to access different features:
        </p>
        <ul className="usage-list">
          <li><strong>About:</strong> Learn about the purpose and features of this application</li>
          <li><strong>Calendar:</strong> View all upcoming craft events in a calendar format</li>
          <li><strong>Submit Event:</strong> Add your own craft event to the community calendar</li>
        </ul>
      </div>
      
      {/* Contact information section */}
      <div className="contact-section">
        <h2 className="contact-section-title">Contact Information</h2>
        <p className="contact-text">
          If you have any questions or need assistance with the calendar, please contact us at:
          <br />
          Email: korynwebsite@gmail.com
          <br />
        </p>
      </div>
    </div>
  );
}