import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './style/calendarPage.css';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState({});
  const [filteredEvents, setFilteredEvents] = useState({});
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [modalEvent, setModalEvent] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) setModalEvent(null);
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setModalEvent(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const getMonthYearString = (date) =>
    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate =>
      new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
    );
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_CALENDAR_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const body = JSON.parse(data['body']);
        const processedEvents = {};
        if (body.found_events && Array.isArray(body.found_events)) {
          body.found_events.forEach((event) => {
            const dateKey = event.date;
            if (!processedEvents[dateKey]) processedEvents[dateKey] = [];
            processedEvents[dateKey].push(event);
          });
        } else {
          console.log('Condition failed - not processing events');
        }
        setAllEvents(processedEvents);
      } catch (error) {
        console.log('Error:', error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const processedEvents = {};
    Object.keys(allEvents).forEach((dateKey) => {
      allEvents[dateKey].forEach((event) => {
        const [year, month, day] = event.date.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day);
        if (
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getFullYear() === currentDate.getFullYear()
        ) {
          const dayOfMonth = eventDate.getDate();
          if (!processedEvents[dayOfMonth]) processedEvents[dayOfMonth] = [];
          processedEvents[dayOfMonth].push(event);
        }
      });
    });
    setFilteredEvents(processedEvents);
  }, [currentDate, allEvents]);

  const calendarDays = generateCalendarDays();

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <div className="month-navigation">
          <button onClick={goToPreviousMonth} className="nav-button" aria-label="Go to previous month">
            <ChevronLeft size={24} />
          </button>
          <h1 className="month-title">{getMonthYearString(currentDate)}</h1>
          <button onClick={goToNextMonth} className="nav-button" aria-label="Go to next month">
            <ChevronRight size={24} />
          </button>
        </div>
      </header>

      <div className={isMobile ? 'calendar-grid-scroll-wrapper' : ''}>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="day-header">{day}</div>
          ))}

          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${day ? '' : 'empty'}`}
              style={!isMobile && hoveredEvent && hoveredEvent.day === day ? { zIndex: 10 } : {}}
            >
              {day && (
                <>
                  <div className="day-number">{day}</div>
                  <div className="events-container">
                    {filteredEvents[day] && filteredEvents[day].map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="event-item"
                        onMouseEnter={() => !isMobile && setHoveredEvent({ day, eventIndex, event })}
                        onMouseLeave={() => !isMobile && setHoveredEvent(null)}
                        onClick={() => isMobile && setModalEvent(event)}
                      >
                        <h3>{event.name}</h3>
                        {!isMobile &&
                          hoveredEvent &&
                          hoveredEvent.day === day &&
                          hoveredEvent.eventIndex === eventIndex && (
                            <div className="event-popup">
                              {event.time !== null && event.time !== undefined && (
                                <h3 className="popup-time"><strong>Time:</strong> {event.time.slice(0, 5)}</h3>
                              )}
                              {event.business && (
                                <p className="popup-business"><strong>Organizer:</strong> {event.business}</p>
                              )}
                              {event.craft && (
                                <p className="popup-craft"><strong>Craft:</strong> {event.craft}</p>
                              )}
                              {event.description && (
                                <p className="popup-description"><strong>Description:</strong> {event.description}</p>
                              )}
                              {event.price !== null && event.price !== undefined && (
                                <p className="popup-price"><strong>Price:</strong> ${event.price.toFixed(2)}</p>
                              )}
                              {event.location_name && (
                                <p className="popup-location"><strong>Location:</strong> {event.location_name}</p>
                              )}
                              {event.address && event.address !== 'NAMER' && (
                                <p className="popup-address">
                                  {event.city && ` ${event.city}`}
                                  {event.state && `, ${event.state}`}
                                  {event.zip && ` ${event.zip}`}
                                </p>
                              )}
                              {event.kids && (
                                <p className="popup-kids"><strong>Kid-Friendly:</strong> Yes</p>
                              )}
                              {event.link && (
                                <a href={event.link} target="_blank" rel="noopener noreferrer" className="popup-link">
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

      {modalEvent && (
        <div className="mobile-modal-overlay" onClick={handleOverlayClick}>
          <div className="mobile-modal-box" role="dialog" aria-modal="true">
            <button className="mobile-modal-close" onClick={() => setModalEvent(null)} aria-label="Close">
              ✕
            </button>
            <p className="mobile-modal-title">{modalEvent.name}</p>
            {modalEvent.time !== null && modalEvent.time !== undefined && (
              <h3><strong>Time:</strong> {modalEvent.time.slice(0, 5)}</h3>
            )}
            {modalEvent.business && (
              <p><strong>Organizer:</strong> {modalEvent.business}</p>
            )}
            {modalEvent.craft && (
              <p><strong>Craft:</strong> {modalEvent.craft}</p>
            )}
            {modalEvent.description && (
              <p><strong>Description:</strong> {modalEvent.description}</p>
            )}
            {modalEvent.price !== null && modalEvent.price !== undefined && (
              <p><strong>Price:</strong> ${modalEvent.price.toFixed(2)}</p>
            )}
            {modalEvent.location_name && (
              <p><strong>Location:</strong> {modalEvent.location_name}</p>
            )}
            {modalEvent.address && modalEvent.address !== 'NAMER' && (
              <p>
                {modalEvent.city && ` ${modalEvent.city}`}
                {modalEvent.state && `, ${modalEvent.state}`}
                {modalEvent.zip && ` ${modalEvent.zip}`}
              </p>
            )}
            {modalEvent.kids && (
              <p><strong>Kid-Friendly:</strong> Yes</p>
            )}
            {modalEvent.link && (
              <a href={modalEvent.link} target="_blank" rel="noopener noreferrer">
                View Event Details
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}