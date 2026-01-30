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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState({});
  const [filteredEvents, setFilteredEvents] = useState({}); 
  const [hoveredEvent, setHoveredEvent] = useState(null);

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
    return new Date(
      prevDate.getFullYear(),
      prevDate.getMonth() + 1,
      1
      );
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

  const filterEventsForCurrentMonth = () => {
    const processedEvents = {};
    // Iterate through all date keys in allEvents object
    Object.keys(allEvents).forEach((dateKey) => {
      const eventsArray = allEvents[dateKey];
      eventsArray.forEach((event) => {
        const [year, month, day] = event.date.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day);
        // Check if event belongs to the currently displayed month and year
        if (eventDate.getMonth() === currentDate.getMonth() && 
            eventDate.getFullYear() === currentDate.getFullYear()) {
          
          const day = eventDate.getDate();
          
          if (!processedEvents[day]) {
            processedEvents[day] = [];
          }
          
          processedEvents[day].push(event);
        }
      });
    });

    setFilteredEvents(processedEvents);
  };

  /**
   * Effect hook to fetch and generate events for the current month.
   * Currently uses mock data but designed to be easily replaced with
   * actual API calls in the future.
   */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_CALENDAR_URL)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const body = JSON.parse(data["body"]);

        const processedEvents = {};
        
        if (body.found_events && Array.isArray(body.found_events)) {
          
          body.found_events.forEach((event, index) => {
            const dateKey = event.date; 
            if (!processedEvents[dateKey]) {
              processedEvents[dateKey] = [];
            }

            processedEvents[dateKey].push(event);
            
          });
        } else {
          console.log('Condition failed - not processing events');
        }
        setAllEvents(processedEvents);
        
      } catch(error) {
        console.log("Error:", error);
      }
    };
    
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEventsForCurrentMonth();
  }, [currentDate, allEvents, filterEventsForCurrentMonth]); 


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
                  {filteredEvents[day] && filteredEvents[day].map((event, eventIndex) => (
                    <div 
                      key={eventIndex} 
                      className="event-item"
                      onMouseEnter={() => setHoveredEvent({ day, eventIndex, event })}
                      onMouseLeave={() => setHoveredEvent(null)}
                    >
                      <h3>{event.name}</h3>
                      
                      {/* Hover popup */}
                      {hoveredEvent && 
                       hoveredEvent.day === day && 
                       hoveredEvent.eventIndex === eventIndex && (
                        <div className="event-popup">
                          
                          {event.business && (
                            <p className="popup-business">
                              <strong>Organizer:</strong> {event.business}
                            </p>
                          )}
                          
                          {event.craft && (
                            <p className="popup-craft">
                              <strong>Craft:</strong> {event.craft}
                            </p>
                          )}
                          
                          {event.description && (
                            <p className="popup-description">
                              <strong>Description:</strong> {event.description}
                            </p>
                          )}
                          
                          {event.price !== null && event.price !== undefined && (
                            <p className="popup-price">
                              <strong>Price:</strong> ${event.price.toFixed(2)}
                            </p>
                          )}
                          
                          {event.location_name && (
                            <p className="popup-location">
                              <strong>Location:</strong> {event.location_name}
                            </p>
                          )}
                          
                          {event.address && event.address !== 'NAMER' && (
                            <p className="popup-address">
                              {event.address}
                              {event.city && `, ${event.city}`}
                              {event.state && `, ${event.state}`}
                              {event.zip && ` ${event.zip}`}
                            </p>
                          )}
                          
                          {event.kids && (
                            <p className="popup-kids">
                              <strong>Kid-Friendly</strong> Yes
                            </p>
                          )}
                          
                          {event.link && (
                            <a 
                              href={event.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="popup-link"
                            >
                              View Event Details
                            </a>
                          )}
                        </div>
                      )}
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