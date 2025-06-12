import { render, screen } from '@testing-library/react';
import React from "react";
import AboutPage from '../AboutPage'; // Make sure this path is correct

describe('AboutPage Component', () => {
  
  describe('Page Structure and Layout', () => {
    it('renders the main container with correct class', () => {
      render(<AboutPage />);
      const container = document.querySelector('.about-container');
      expect(container).toBeInTheDocument();
    });

    it('renders all four main sections', () => {
      render(<AboutPage />);
      expect(document.querySelector('.about-title')).toBeInTheDocument();
      expect(document.querySelector('.about-section')).toBeInTheDocument();
      expect(document.querySelector('.usage-section')).toBeInTheDocument();
      expect(document.querySelector('.contact-section')).toBeInTheDocument();
    });
  });

  describe('Main Title Section', () => {
    it('renders the main page title as h1', () => {
      render(<AboutPage />);
      const title = screen.getByRole('heading', { level: 1, name: /About Our Craft Event Calendar/ });
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('about-title');
    });
  });

  describe('Welcome Section', () => {
    it('renders welcome section title as h2', () => {
      render(<AboutPage />);
      const welcomeTitle = screen.getByRole('heading', { level: 2, name: /Welcome to Our Community Calendar/ });
      expect(welcomeTitle).toBeInTheDocument();
      expect(welcomeTitle).toHaveClass('about-section-title');
    });

    it('renders welcome section description', () => {
      render(<AboutPage />);
      const description = screen.getByText(/This calendar application serves as a central hub/);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('about-text');
    });

    it('mentions craft events and community sharing in description', () => {
      render(<AboutPage />);
      expect(screen.getByText(/craft related community events and activities/)).toBeInTheDocument();
      expect(screen.getByText(/submit your own events to share with the community/)).toBeInTheDocument();
    });
  });

  describe('Usage Instructions Section', () => {
    it('renders usage section title as h2', () => {
      render(<AboutPage />);
      const usageTitle = screen.getByRole('heading', { level: 2, name: /How to Use This Application/ });
      expect(usageTitle).toBeInTheDocument();
      expect(usageTitle).toHaveClass('usage-section-title');
    });

    it('renders navigation instructions', () => {
      render(<AboutPage />);
      const instructions = screen.getByText(/Navigate through the tabs above to access different features/);
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveClass('usage-text');
    });

    it('renders usage list with correct class', () => {
      render(<AboutPage />);
      const list = document.querySelector('.usage-list');
      expect(list).toBeInTheDocument();
      expect(list.tagName).toBe('UL');
    });

    it('renders About tab description', () => {
      render(<AboutPage />);
      expect(screen.getByText('About:')).toBeInTheDocument();
      expect(screen.getByText(/Learn about the purpose and features of this application/)).toBeInTheDocument();
    });

    it('renders Calendar tab description', () => {
      render(<AboutPage />);
      expect(screen.getByText('Calendar:')).toBeInTheDocument();
      expect(screen.getByText(/View all upcoming craft events in a calendar format/)).toBeInTheDocument();
    });

    it('renders Submit Event tab description', () => {
      render(<AboutPage />);
      expect(screen.getByText('Submit Event:')).toBeInTheDocument();
      expect(screen.getByText(/Add your own craft event to the community calendar/)).toBeInTheDocument();
    });

    it('renders exactly three list items', () => {
      render(<AboutPage />);
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    it('uses strong tags for tab names', () => {
      render(<AboutPage />);
      const strongElements = document.querySelectorAll('.usage-list strong');
      expect(strongElements).toHaveLength(3);
      expect(strongElements[0]).toHaveTextContent('About:');
      expect(strongElements[1]).toHaveTextContent('Calendar:');
      expect(strongElements[2]).toHaveTextContent('Submit Event:');
    });
  });

  describe('Contact Information Section', () => {
    it('renders contact section title as h2', () => {
      render(<AboutPage />);
      const contactTitle = screen.getByRole('heading', { level: 2, name: /Contact Information/ });
      expect(contactTitle).toBeInTheDocument();
      expect(contactTitle).toHaveClass('contact-section-title');
    });

    it('renders contact instructions', () => {
      render(<AboutPage />);
      const contactText = screen.getByText(/If you have any questions or need assistance/);
      expect(contactText).toBeInTheDocument();
      expect(contactText).toHaveClass('contact-text');
    });

    it('uses line breaks in contact section', () => {
      render(<AboutPage />);
      const contactSection = document.querySelector('.contact-text');
      const brElements = contactSection.querySelectorAll('br');
      expect(brElements).toHaveLength(2);
    });
  });

  describe('CSS Class Application', () => {
    it('applies correct CSS classes to all elements', () => {
      render(<AboutPage />);
      
      // Container
      expect(document.querySelector('.about-container')).toBeInTheDocument();
      
      // Titles
      expect(document.querySelector('.about-title')).toBeInTheDocument();
      expect(document.querySelector('.about-section-title')).toBeInTheDocument();
      expect(document.querySelector('.usage-section-title')).toBeInTheDocument();
      expect(document.querySelector('.contact-section-title')).toBeInTheDocument();
      
      // Text elements
      expect(document.querySelector('.about-text')).toBeInTheDocument();
      expect(document.querySelector('.usage-text')).toBeInTheDocument();
      expect(document.querySelector('.contact-text')).toBeInTheDocument();
      
      // List
      expect(document.querySelector('.usage-list')).toBeInTheDocument();
    });
  });

    it('provides descriptive heading text', () => {
      render(<AboutPage />);
      expect(screen.getByRole('heading', { name: /About Our Craft Event Calendar/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Welcome to Our Community Calendar/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /How to Use This Application/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Contact Information/ })).toBeInTheDocument();
    });

    it('uses list structure', () => {
      render(<AboutPage />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
  });

  describe('Content Validation', () => {
    it('contains all expected text content', () => {
      render(<AboutPage />);
      
      // Key phrases that should be present
      const expectedPhrases = [
        'craft related community events',
        'Browse upcoming events',
        'submit your own events',
        'Navigate through the tabs above',
        'questions or need assistance'
      ];
      
      expectedPhrases.forEach(phrase => {
        expect(screen.getByText(new RegExp(phrase, 'i'))).toBeInTheDocument();
      });
  });
});