import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './style/calendarPage.css';

/**
 * CalendarPage Component
 * 
 * A React functional component that renders an interactive monthly calendar view.
 * Features month navigation, displays events for each day, and provides a grid
 * layout showing the full month with event indicators.
 * 
 * @returns {JSX.Element} The rendered calendar page with navigation controls,
 *                        month grid, and event displays
 */
export default function CalendarPage() {
  // State for tracking the currently displayed month/year
  const [currentDate, setCurrentDate] = useState(new Date());
  // State for storing events data, keyed by day number
  const [events, setEvents] = useState({});

  /**
   * Formats a date object into a readable month and year string
   * @param {Date} date - The date to format
   * @returns {string} Formatted string like "January 2024"
   */
  const getMonthYearString = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  /**
   * Navigates to the previous month and updates the calendar display
   */
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  /**
   * Navigates to the next month and updates the calendar display
   */
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  /**
   * Generates an array of calendar days for the current month view.
   * Includes null values for empty cells at the beginning of the month
   * to properly align days with their corresponding weekdays.
   * 
   * @returns {Array<number|null>} Array where null represents empty cells
   *                               and numbers represent day values
   */
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Calculate calendar boundaries
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // Day of week (0-6, Sunday=0)
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add actual day numbers for the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    
    return days;
  };

  /**
   * Effect hook to fetch and generate events for the current month.
   * Currently uses mock data but designed to be easily replaced with
   * actual API calls in the future.
   */
  useEffect(() => {
    const fetchEvents = () => {
      // TODO: Replace with actual API integration
      //const year = currentDate.getFullYear();
      //const month = currentDate.getMonth();
      
      const mockEvents = {};
      
      // Generate sample events for demonstration
      for (let i = 1; i <= 28; i++) {
        // Add events to select days (every 3rd or 7th day)
        if (i % 3 === 0 || i % 7 === 0) {
          const eventCount = Math.floor(Math.random() * 3) + 1;
          mockEvents[i] = [];
          
          // Create random event types for each day
          for (let j = 0; j < eventCount; j++) {
            const eventTypes = ['Meeting', 'Call', 'Deadline', 'Appointment', 'Reminder'];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            mockEvents[i].push(`${eventType} ${j+1}`);
          }
        }
      }
      
      setEvents(mockEvents);
    };
    
    fetchEvents();
  }, [currentDate]); // Re-fetch events when month changes

  const calendarDays = generateCalendarDays();
  
  return (
    <div className="calendar-container">
      {/* Navigation header with month controls */}
      <header className="calendar-header">
        <div className="month-navigation">
          <button 
            onClick={goToPreviousMonth}
            className="nav-button"
            aria-label="Go to previous month"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h1 className="month-title">
            {getMonthYearString(currentDate)}
          </h1>
          
          <button 
            onClick={goToNextMonth}
            className="nav-button"
            aria-label="Go to next month"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </header>
      
      {/* Main calendar grid layout */}
      <div className="calendar-grid">
        {/* Weekday column headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="day-header">
            {day}
          </div>
        ))}
        
        {/* Calendar day cells with events */}
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`calendar-day ${day ? '' : 'empty'}`}
          >
            {day && (
              <>
                {/* Day number display */}
                <div className="day-number">
                  {day}
                </div>
                {/* Events list for this day */}
                <div className="events-container">
                  {events[day] && events[day].map((event, eventIndex) => (
                    <div 
                      key={eventIndex} 
                      className="event-item"
                    >
                      {event}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}