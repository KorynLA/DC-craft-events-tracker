import { useState } from 'react';
import DatePicker from './datePicker'; 
import TimeSelector from './timeSelector';
import './style/eventSubmissionForm.css';

/**
 * EventSubmissionForm Component
 * 
 * A React functional component that provides a form interface for submitting new event data.
 * Features comprehensive validation, input sanitization, and user feedback mechanisms.
 * 
 * Form Requirements:
 * - Name: Required, max 140 characters
 * - Description: Required, max 500 characters (approximately one paragraph)
 * - Date: Required, must be a future date (handled by DatePicker component)
 * - Time: Required, selectable time slots (handled by TimeSelector component)
 * 
 * Security Features:
 * - Input sanitization to prevent XSS attacks
 * - Form validation to ensure data integrity
 * - Character limits to prevent buffer overflow attempts
 * 
 * @returns {JSX.Element} The rendered form component with validation and success feedback
 */
export default function EventSubmissionForm() {
  // Form data state - holds all input field values
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventTime: '',
    eventDate: ''
  });
  
  // Validation error state - stores error messages for each field
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    eventTime: '',
    eventDate: ''
  });

  // Success feedback state - controls display of submission confirmation
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  /**
   * Sanitizes user input to help prevent XSS attacks and injection vulnerabilities.
   * Escapes HTML characters and removes leading/trailing whitespace.
   * 
   * Note: This is basic frontend sanitization - server-side validation is still required
   * for complete security.
   * 
   * @param {string} input - The user input string to sanitize
   * @returns {string} The sanitized input with HTML entities escaped
   */
  const sanitizeInput = (input) => {
    return input
      .replace(/</g, '&lt;')      // Escape less-than symbols
      .replace(/>/g, '&gt;')      // Escape greater-than symbols
      .replace(/"/g, '&quot;')    // Escape double quotes
      .replace(/'/g, '&#039;')    // Escape single quotes
      .trim();                    // Remove leading/trailing whitespace
  };

  /**
   * Validates all form fields according to business rules and requirements.
   * Checks for required fields, character limits, and content appropriateness.
   * 
   * @param {Object} data - The form data object to validate
   * @param {string} data.name - Event name field
   * @param {string} data.description - Event description field
   * @param {string} data.eventDate - Event date field
   * @param {string} data.eventTime - Event time field
   * @returns {Object} Object containing error messages for each field (empty string = no error)
   */
  const validateForm = (data) => {
    const newErrors = {
      name: '',
      description: '',
      eventTime: '',
      eventDate: ''
    };

    // Validate event name field
    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (data.name.length > 140) {
      newErrors.name = 'Name must be less than 140 characters';
    }

    // Validate event description field
    if (!data.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (data.description.length > 500) {
      newErrors.description = 'Description must be less than a paragraph';
    }

    // Validate required date field
    if (!data.eventDate) {
      newErrors.eventDate = 'Date is required';
    }
    
    // Validate required time field
    if (!data.eventTime) {
      newErrors.eventTime = 'Time for event is required';
    }
    
    return newErrors;
  };

  /**
   * Handles changes to text input fields (name and description).
   * Updates form state and clears validation errors when user starts typing.
   * 
   * @param {Event} e - The input change event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data with new input value
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  /**
   * Handles date selection from the DatePicker component.
   * Updates form state and clears date validation errors.
   * 
   * @param {string} date - The selected date in YYYY-MM-DD format
   */
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      eventDate: date
    });
    
    // Clear date validation error when user selects a date
    if (errors.eventDate) {
      setErrors({
        ...errors,
        eventDate: ''
      });
    }
  };

  /**
   * Handles time selection from the TimeSelector component.
   * Updates form state and clears time validation errors.
   * 
   * @param {string} time - The selected time value
   */
  const handleTimeChange = (time) => {
    setFormData({
      ...formData,
      eventTime: time
    });
    
    // Clear time validation error when user selects a time
    if (errors.eventTime) {
      setErrors({
        ...errors,
        eventTime: ''
      });
    }
  };

  /**
   * Handles form submission process including validation, sanitization, and success feedback.
   * Prevents submission if validation fails and provides user feedback.
   * 
   * In a production environment, this would typically make an API call to save the event data.
   */
  const handleSubmit = () => {
    // Sanitize all text inputs before validation and submission
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      description: sanitizeInput(formData.description),
      eventTime: formData.eventTime,
      eventDate: formData.eventDate
    };
    
    // Run validation on sanitized data
    const newErrors = validateForm(sanitizedData);
    setErrors(newErrors);
    
    // Check if form passes validation (no error messages)
    const isValid = !Object.values(newErrors).some(error => error);
    
    if (isValid) {
      // TODO: Replace with actual API call in production
      console.log('Form submitted successfully:', sanitizedData);
      
      // Show success feedback to user
      setIsSubmitted(true);
      
      // Reset form to initial state after successful submission
      setFormData({
        name: '',
        description: '',
        eventTime: '',
        eventDate: ''
      });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }
  };

  return (
    <div className="event-form-container">
      <h2 className="form-title">New Event</h2>
      
      {/* Success confirmation message */}
      {isSubmitted && (
        <div className="success-message">
          Event submitted successfully!
        </div>
      )}
      
      <div>
        {/* Event Name Input Section */}
        <div className="form-section">
          <label 
            htmlFor="name" 
            className="form-label"
          >
            Name <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={140}
            className="form-input"
            placeholder="Enter event name (max 140 characters)"
          />
          {errors.name && (
            <p className="error-message">{errors.name}</p>
          )}
          <p className="char-counter">
            {formData.name.length}/140 characters
          </p>
        </div>

        {/* Date and Time Selection Section */}
        <div className="datetime-wrapper">
          {/* Date Picker Integration */}
          <div className="form-section">
            <label className="form-label">
              Date <span className="required-indicator">*</span>
            </label>
            <DatePicker 
              selectedDate={formData.eventDate} 
              onDateChange={handleDateChange}
            />
            {errors.eventDate && (
              <p className="error-message">{errors.eventDate}</p>
            )}
          </div>

          {/* Time Selector Integration */}
          <div className="form-section">
            <label className="form-label">
              Time <span className="required-indicator">*</span>
            </label>
            <TimeSelector 
              selectedTime={formData.eventTime}
              onTimeChange={handleTimeChange}
            />
            {errors.eventTime && (
              <p className="error-message">{errors.eventTime}</p>
            )}
          </div>
        </div>

        {/* Event Description Input Section */}
        <div className="form-section">
          <label 
            htmlFor="description" 
            className="form-label"
          >
            Description <span className="required-indicator">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="form-textarea"
            placeholder="Briefly describe your event (less than a paragraph)"
          />
          {errors.description && (
            <p className="error-message">{errors.description}</p>
          )}
          <p className="char-counter">
            {formData.description.length}/500 characters
          </p>
        </div>
        
        {/* Form Submission Section */}
        <div className="button-container">
          <button
            onClick={handleSubmit}
            className="submit-button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}