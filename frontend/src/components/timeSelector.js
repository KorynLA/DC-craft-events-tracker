import { useState } from 'react';
import './style/timeSelector.css';

/**
 * TimeSelector - A dropdown time picker component
 * 
 * Displays a clickable time input that opens a dropdown with 12-hour format time options.
 * Supports AM/PM selection with 30-minute intervals (1:00, 1:30, 2:00, etc.).
 * 
 * @example
 * const [time, setTime] = useState('');
 * <TimeSelector selectedTime={time} onTimeChange={setTime} />
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedTime - Currently selected time (e.g., "2:30 PM")
 * @param {Function} props.onTimeChange - Callback when time changes, receives new time string
 * @returns {JSX.Element} The rendered component
 */
export default function TimeSelector({ selectedTime, onTimeChange }) {
  const [showTimeOptions, setShowTimeOptions] = useState(false);
  const [timeFormat, setTimeFormat] = useState('AM');
  
  /**
   * Create time options from 1:00 to 12:30 in 30-minute intervals
   * @returns {string[]} Array of time strings like ["1:00", "1:30", "2:00", ...]
   */
  const generateTimeOptions = () => {
    const options = [];
    
    for (let hour = 1; hour <= 12; hour++) {
      options.push(`${hour}:00`);
      options.push(`${hour}:30`);
    }
    
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  /**
   * Handle time selection from dropdown
   * Combines selected time with current AM/PM format and closes dropdown
   */
  const handleTimeSelection = (time) => {
    const formattedTime = `${time} ${timeFormat}`;
    onTimeChange(formattedTime);
    setShowTimeOptions(false);
  };
  
  /**
   * Toggle between AM and PM format
   * Note: Currently unused in the component
   */
   /**
  const toggleTimeFormat = () => {
    setTimeFormat(timeFormat === 'AM' ? 'PM' : 'AM');
  };
  */
  
  // Display selected time or placeholder text
  const displayTime = selectedTime || 'Select Time';
  
  return (
    <div className="timeselector-wrapper">
      {/* Clickable time display - opens/closes dropdown */}
      <div 
        className="time-input-container"
        onClick={() => setShowTimeOptions(!showTimeOptions)}
      >
        <span className="time-input-text">{displayTime}</span>
        <span className="time-input-icon">🕒</span>
      </div>
      
      {/* Dropdown time selector */}
      {showTimeOptions && (
        <div className="time-selector-container">
          {/* AM/PM toggle buttons */}
          <div className="time-selector-header">
            <button 
              className={`format-toggle ${timeFormat === 'AM' ? 'active' : ''}`}
              onClick={() => setTimeFormat('AM')}
            >
              AM
            </button>
            <button 
              className={`format-toggle ${timeFormat === 'PM' ? 'active' : ''}`}
              onClick={() => setTimeFormat('PM')}
            >
              PM
            </button>
          </div>
          
          {/* Scrollable list of time options */}
          <div className="time-options-container">
            {timeOptions.map((time) => (
              <div 
                key={time}
                className={`time-option ${selectedTime === `${time} ${timeFormat}` ? 'selected-time' : ''}`}
                onClick={() => handleTimeSelection(time)}
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}