import { useState, useEffect } from 'react';
import './style/datePicker.css';

/**
 * DatePicker Component
 * 
 * A React functional component that provides an interactive date selection interface.
 * Features a clickable date input that expands to show a calendar with month/year navigation,
 * prevents past date selection, and supports both day and month view modes.
 * 
 * @param {Object} props - Component props
 * @param {string|Date} props.selectedDate - Initially selected date (optional)
 * @param {Function} props.onDateChange - Callback function called when date is selected,
 *                                        receives formatted date string (YYYY-MM-DD)
 * @returns {JSX.Element} The rendered date picker component
 */
export default function DatePicker({ selectedDate: initialDate, onDateChange }) {
  // State for controlling calendar visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  // State for the currently selected date
  const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : null);
  // State for the month/year being displayed in the calendar
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  // State for switching between day view and month selection view
  const [viewMode, setViewMode] = useState('days'); // 'days' or 'months'
  
  // Reference date for past date comparisons (set to midnight for accurate comparison)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /**
   * Effect to sync local state with prop changes
   * Updates selected date when parent component changes the initialDate prop
   */
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(new Date(initialDate));
    }
  }, [initialDate]);
  
  /**
   * Navigates to previous or next month in the calendar view
   * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
   */
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };
  
  /**
   * Navigates to previous or next year (used in month selection view)
   * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
   */
  const navigateYear = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(currentMonth.getFullYear() + direction);
    setCurrentMonth(newMonth);
  };
  
  /**
   * Handles date selection and notifies parent component
   * @param {Date} date - The selected date object
   */
  const selectDate = (date) => {
    setSelectedDate(date);
    // Convert to ISO format (YYYY-MM-DD) for consistent parent handling
    const formattedDate = date.toISOString().split('T')[0];
    onDateChange(formattedDate);
    setShowDatePicker(false);
  };
  
  /**
   * Handles month selection in month view mode
   * @param {number} monthIndex - Zero-based month index (0 = January)
   */
  const selectMonth = (monthIndex) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(monthIndex);
    setCurrentMonth(newDate);
    setViewMode('days');
  };
  
  /**
   * Generates calendar day objects for the current month view.
   * Includes empty cells for proper weekday alignment and metadata
   * for styling and interaction logic.
   * 
   * @returns {Array<Object>} Array of day objects with properties:
   *   - day: number|null - Day number or null for empty cells
   *   - date: Date - Full date object for the day
   *   - isCurrentMonth: boolean - Whether day belongs to current month
   *   - isPast: boolean - Whether day is in the past
   */
  const generateDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Calculate month boundaries
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add all days of the current month with metadata
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ 
        day, 
        date,
        isCurrentMonth: true,
        isPast: date < today
      });
    }
    
    return days;
  };
  
  // Extract display strings for current month/year
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  
  // Month names for month selection view
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  
  // Format selected date for display in the input field
  const formattedSelectedDate = selectedDate
    ? selectedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Pick a date';
    
  return (
    <div className="datepicker-wrapper">
      {/* Clickable date input field */}
      <div 
        className="date-input-container"
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        <span className="date-input-text">{formattedSelectedDate}</span>
        <span className="date-input-icon">📅</span>
      </div>
      
      {/* Expandable calendar interface */}
      {showDatePicker && (
        <div className="calendar-container">
          {viewMode === 'days' ? (
            <>
              {/* Month navigation header */}
              <div className="calendar-header">
                <button 
                  className="calendar-button"
                  onClick={() => navigateMonth(-1)}
                  aria-label="Previous month"
                >
                  &lt;
                </button>
                
                <button 
                  className="month-year-text"
                  onClick={() => setViewMode('months')}
                  aria-label="Select month"
                >
                  {monthName} {year}
                </button>
                
                <button 
                  className="calendar-button"
                  onClick={() => navigateMonth(1)}
                  aria-label="Next month"
                >
                  &gt;
                </button>
              </div>
              
              {/* Weekday column headers */}
              <div className="weekdays-container">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar day grid */}
              <div className="days-container">
                {generateDays().map((dayObj, index) => (
                  <div 
                    key={index}
                    className={`
                      day-cell
                      ${!dayObj.day ? 'invisible-day' : ''}
                      ${dayObj.isPast ? 'past-day' : ''}
                      ${selectedDate && dayObj.date && 
                        selectedDate.getDate() === dayObj.day && 
                        selectedDate.getMonth() === currentMonth.getMonth() && 
                        selectedDate.getFullYear() === currentMonth.getFullYear() 
                          ? 'selected-day' : ''}
                    `}
                    onClick={() => {
                      if (dayObj.day && !dayObj.isPast) {
                        selectDate(dayObj.date);
                      }
                    }}
                  >
                    {dayObj.day}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Year navigation header for month view */}
              <div className="calendar-header">
                <button 
                  className="calendar-button"
                  onClick={() => navigateYear(-1)}
                  aria-label="Previous year"
                >
                  &lt;
                </button>
                
                <span className="month-year-text">{year}</span>
                
                <button 
                  className="calendar-button"
                  onClick={() => navigateYear(1)}
                  aria-label="Next year"
                >
                  &gt;
                </button>
              </div>
              
              {/* Month selection grid */}
              <div className="months-container">
                {months.map((month, index) => {
                  const monthDate = new Date(year, index, 1);
                  const isPastMonth = monthDate < today && 
                    monthDate.getFullYear() === today.getFullYear() && 
                    monthDate.getMonth() < today.getMonth();
                  
                  return (
                    <button
                      key={month}
                      className={`
                        month-cell
                        ${isPastMonth ? 'past-month' : ''}
                        ${currentMonth.getMonth() === index ? 'current-month' : ''}
                      `}
                      disabled={isPastMonth}
                      onClick={() => !isPastMonth && selectMonth(index)}
                    >
                      {month.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}