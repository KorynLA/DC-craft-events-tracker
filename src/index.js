import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/**
 * Application Entry Point
 * 
 * This file initializes and renders the React application to the DOM.
 * Uses React 18's createRoot API for improved performance and concurrent features.
 * Also sets up web vitals reporting for performance monitoring.
 * 
 * @file Main entry point for the React application
 * @requires react - Core React library
 * @requires react-dom/client - React DOM rendering (React 18+)
 * @requires ./index.css - Global application styles
 * @requires ./App - Main application component
 * @requires ./reportWebVitals - Performance monitoring utility
 */

// Create the root element using React 18's createRoot API
// This enables concurrent features and better performance
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component to the root element
// StrictMode is removed for production - add <React.StrictMode> wrapper if needed for development
root.render(
    <App />
);

/**
 * Web Vitals Performance Monitoring
 * 
 * Measures and reports Core Web Vitals metrics to help monitor app performance.
 * Currently called without parameters (no logging).
 * 
 * To enable performance logging:
 * - reportWebVitals(console.log) - Log metrics to console
 * - reportWebVitals(sendToAnalytics) - Send to analytics service
 * 
 * Learn more: https://bit.ly/CRA-vitals
 */
reportWebVitals();