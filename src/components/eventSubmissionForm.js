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
 * REQUIRED FIELDS:
 * - Name: max 140 characters
 * - Email: valid email format, max 100 characters
 * - Business: max 200 characters
 * - Location Name: max 200 characters
 * - Link: must be valid URL format
 * - Date: must be a future date (handled by DatePicker component)
 * - Time: selectable time slots (handled by TimeSelector component)
 * 
 * OPTIONAL FIELDS:
 * - Price: must be a valid number >= 0 if provided
 * - Kids: boolean (kid-friendly: yes/no), can be left unselected
 * - Description: max 500 characters if provided
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
    price: '',
    description: '',
    link: '',
    kids: null,
    location: '',
    date: '',
    time: '',
    organization: '',
    email: ''
  });
  
  // Validation error state - stores error messages for each field
  const [errors, setErrors] = useState({
    name: '',
    price: '',
    description: '',
    link: '',
    kids: '',
    location: '',
    date: '',
    time: '',
    organization: '',
    email: ''
  });

  // Success feedback state - controls display of submission confirmation
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Loading state for API submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API error state
  const [apiError, setApiError] = useState('');
  
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
    if (typeof input !== 'string') return input;
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .trim();
  };

  const sanitizeTime = (time) => {
    try {
      const [timeSection, modifier] = time.split(' ');
      let [hours, minutes] = timeSection.split(':').map(Number);

      if (modifier === 'PM' && hours !== 12) {
        hours += 12;
      }

      if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch(Exception) {
      return null
    }
  }

  const sanitizeDate = (date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    return date;
  }

  const sanitizeBoolean = (input) => {
    if (typeof input == "boolean") {
      return input;
    } 
    return null;
  }
  /**
   * Validates email format using regex pattern
   * 
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email format is valid
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validates URL format using regex pattern
   * 
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL format is valid
   */
  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Validates all form fields according to business rules and requirements.
   * 
   * Required fields: name, email, organization, location, date, time, link
   * Optional fields: price, description, kids
   * 
   * @param {Object} data - The form data object to validate
   * @returns {Object} Object containing error messages for each field (empty string = no error)
   */
  const validateForm = (data) => {
    const newErrors = {
      name: '',
      price: '',
      description: '',
      link: '',
      kids: '',
      location: '',
      date: '',
      time: '',
      organization: '',
      email: ''
    };

    // Validate event name field (REQUIRED)
    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (data.name.length > 140) {
      newErrors.name = 'Name must be less than 140 characters';
    }

    // Validate email field (REQUIRED)
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (data.email.length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    } else if (!isValidEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate organization field (REQUIRED)
    if (!data.organization.trim()) {
      newErrors.organization = 'Business name is required';
    } else if (data.organization.length > 200) {
      newErrors.organization = 'Business name must be less than 200 characters';
    }

    // Validate location name field (REQUIRED)
    if (!data.location.trim()) {
      newErrors.location = 'Location name is required';
    } else if (data.location.length > 200) {
      newErrors.location = 'Location name must be less than 200 characters';
    }

    // Validate link field (REQUIRED)
    if (!data.link.trim()) {
      newErrors.link = 'Event link is required';
    } else if (!isValidURL(data.link)) {
      newErrors.link = 'Please enter a valid URL (include http:// or https://)';
    }

    // Validate required date field (REQUIRED)
    if (!data.date) {
      newErrors.date = 'Date is required';
    }
    
    // Validate required time field (REQUIRED)
    if (!data.time) {
      newErrors.time = 'Time for event is required';
    }

    // Validate price field (OPTIONAL - only validate format if provided)
    if (data.price !== '' && data.price !== null && data.price !== undefined) {
      const priceNum = parseFloat(data.price);
      if (isNaN(priceNum)) {
        newErrors.price = 'Price must be a valid number';
      } else if (priceNum < 0) {
        newErrors.price = 'Price cannot be negative';
      }
    }

    // Validate event description field (OPTIONAL - only validate length if provided)
    if (data.description && data.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    return newErrors;
  };

  /**
   * Handles changes to text input fields.
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
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError('');
    }
  };

  /**
   * Handles changes to the kids-friendly checkbox.
   * Allows toggling between true, false, and null (unselected)
   * 
   * @param {boolean} value - The selected value (true for yes, false for no)
   */
  const handleKidsChange = (value) => {
    // If clicking the same checkbox again, unselect it (set to null)
    if (formData.kids === value) {
      setFormData({
        ...formData,
        kids: null
      });
    } else {
      setFormData({
        ...formData,
        kids: value
      });
    }
    
    // Clear validation error for kids field
    if (errors.kids) {
      setErrors({
        ...errors,
        kids: ''
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
      date: date
    });
    
    // Clear date validation error when user selects a date
    if (errors.date) {
      setErrors({
        ...errors,
        date: ''
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
      time: time
    });
    
    // Clear time validation error when user selects a time
    if (errors.time) {
      setErrors({
        ...errors,
        time: ''
      });
    }
  };

  /**
   * Handles form submission process including validation, sanitization, and API submission.
   * Prevents submission if validation fails and provides user feedback.
   * Sends validated data to backend API via POST request.
   */
  const handleSubmit = async () => {
    // Sanitize all text inputs before validation and submission
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      price: parseFloat(formData.price),
      description: sanitizeInput(formData.description),
      link: sanitizeInput(formData.link),
      kids: sanitizeBoolean(formData.kids),
      location: sanitizeInput(formData.location),
      date: sanitizeDate(formData.date),
      time: sanitizeTime(formData.time),
      organization: sanitizeInput(formData.organization),
      email: sanitizeInput(formData.email)
    };

    // Run validation on sanitized data
    const newErrors = validateForm({
      ...sanitizedData,
      price: formData.price // Keep original for validation
    });
    setErrors(newErrors);
    
    // Check if form passes validation (no error messages)
    const isValid = !Object.values(newErrors).some(error => error);
    
    if (isValid) {
      setIsSubmitting(true);
      setApiError('');
      console.log(sanitizedData);
      try {
        // Send POST request to backend API
        const response = await fetch(process.env.REACT_APP_CALENDAR_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sanitizedData)
        });
        
        if (!response.ok) {
          // Handle HTTP errors
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Form submitted successfully:', responseData);
        
        // Show success feedback to user
        setIsSubmitted(true);
        
        // Reset form to initial state after successful submission
        setFormData({
          name: '',
          price: '',
          description: '',
          link: '',
          kids: null,
          location: '',
          date: '',
          time: '',
          organization: '',
          email: ''
        });
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
        
      } catch (error) {
        console.error('Error submitting form:', error);
        setApiError('Failed to submit event. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
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
      
      {/* API Error message */}
      {apiError && (
        <div className="api-error-message">
          {apiError}
        </div>
      )}
      
      <div>
        {/* Event Name Input Section - REQUIRED */}
        <div className="form-section">
          <label 
            htmlFor="name" 
            className="form-label"
          >
            Event Name <span className="required-indicator">*</span>
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
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="error-message">{errors.name}</p>
          )}
          <p className="char-counter">
            {formData.name.length}/140 characters
          </p>
        </div>

        {/* Email Input Section - REQUIRED */}
        <div className="form-section">
          <label 
            htmlFor="email" 
            className="form-label"
          >
            Email <span className="required-indicator">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            maxLength={100}
            className="form-input"
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="error-message">{errors.email}</p>
          )}
          <p className="char-counter">
            {formData.email.length}/100 characters
          </p>
        </div>

        {/* organization Name Input Section - REQUIRED */}
        <div className="form-section">
          <label 
            htmlFor="organization" 
            className="form-label"
          >
            Business Name <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            maxLength={200}
            className="form-input"
            placeholder="Enter business name"
            disabled={isSubmitting}
          />
          {errors.organization && (
            <p className="error-message">{errors.organization}</p>
          )}
          <p className="char-counter">
            {formData.organization.length}/200 characters
          </p>
        </div>

        {/* Location Name Input Section - REQUIRED */}
        <div className="form-section">
          <label 
            htmlFor="location" 
            className="form-label"
          >
            Location Name <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            maxLength={200}
            className="form-input"
            placeholder="Enter location name"
            disabled={isSubmitting}
          />
          {errors.location && (
            <p className="error-message">{errors.location}</p>
          )}
          <p className="char-counter">
            {formData.location.length}/200 characters
          </p>
        </div>

        {/* Event Link Input Section - REQUIRED */}
        <div className="form-section">
          <label 
            htmlFor="link" 
            className="form-label"
          >
            Event Link <span className="required-indicator">*</span>
          </label>
          <input
            type="url"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="form-input"
            placeholder="https://example.com/event"
            disabled={isSubmitting}
          />
          {errors.link && (
            <p className="error-message">{errors.link}</p>
          )}
        </div>

        {/* Date and Time Selection Section - REQUIRED */}
        <div className="datetime-wrapper">
          {/* Date Picker Integration */}
          <div className="form-section">
            <label className="form-label">
              Date <span className="required-indicator">*</span>
            </label>
            <DatePicker 
              selectedDate={formData.date} 
              onDateChange={handleDateChange}
              disabled={isSubmitting}
            />
            {errors.date && (
              <p className="error-message">{errors.date}</p>
            )}
          </div>

          {/* Time Selector Integration */}
          <div className="form-section">
            <label className="form-label">
              Time <span className="required-indicator">*</span>
            </label>
            <TimeSelector 
              selectedTime={formData.time}
              onTimeChange={handleTimeChange}
              disabled={isSubmitting}
            />
            {errors.time && (
              <p className="error-message">{errors.time}</p>
            )}
          </div>
        </div>

        {/* Price Input Section - OPTIONAL */}
        <div className="form-section">
          <label 
            htmlFor="price" 
            className="form-label"
          >
            Price (Optional)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="form-input"
            placeholder="Enter price (e.g., 25.00)"
            disabled={isSubmitting}
          />
          {errors.price && (
            <p className="error-message">{errors.price}</p>
          )}
        </div>

        {/* Kid-Friendly Section - OPTIONAL */}
        <div className="form-section">
          <label className="form-label">
            Kid-Friendly (Optional)
          </label>
          <div className="kids-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="kids-yes"
                checked={formData.kids === true}
                onChange={() => handleKidsChange(true)}
                disabled={isSubmitting}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">Yes</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="kids-no"
                checked={formData.kids === false}
                onChange={() => handleKidsChange(false)}
                disabled={isSubmitting}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">No</span>
            </label>
          </div>
          {errors.kids && (
            <p className="error-message">{errors.kids}</p>
          )}
        </div>

        {/* Event Description Input Section - OPTIONAL */}
        <div className="form-section">
          <label 
            htmlFor="description" 
            className="form-label"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            className="form-textarea"
            placeholder="Briefly describe your event (max 500 characters)"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}