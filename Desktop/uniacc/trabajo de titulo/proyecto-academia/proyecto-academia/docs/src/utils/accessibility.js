// src/utils/accessibility.js

/**
 * Utilidad para mejorar la accesibilidad de la aplicación.
 */

/**
 * Mueve el foco al primer elemento interactivo dentro de un contenedor.
 * @param {HTMLElement} container - Contenedor donde se buscarán elementos interactivos.
 */
export const focusFirstInteractiveElement = (container) => {
    if (!container) return;
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  };
  
  /**
   * Configura accesibilidad en un modal, moviendo el foco automáticamente.
   * @param {HTMLElement} modal - El elemento modal.
   */
  export const setupModalAccessibility = (modal) => {
    if (!modal) return;
  
    // Guardar el elemento que tenía el foco antes de abrir el modal.
    const previousFocus = document.activeElement;
  
    // Mover el foco al modal.
    focusFirstInteractiveElement(modal);
  
    // Retornar el foco al elemento previo al cerrar el modal.
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        modal.style.display = 'none'; // Simula el cierre del modal.
        if (previousFocus) previousFocus.focus();
      }
    });
  };
  
  /**
   * Configura accesibilidad en navegación mediante teclado.
   */
  export const enableKeyboardNavigation = () => {
    document.addEventListener('keydown', (event) => {
      const isTab = event.key === 'Tab';
      const isShiftTab = isTab && event.shiftKey;
  
      if (isTab || isShiftTab) {
        const focusableElements = document.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
  
        const focusedIndex = Array.prototype.indexOf.call(focusableElements, document.activeElement);
  
        if (isShiftTab && focusedIndex === 0) {
          // Mover al último elemento cuando se presiona Shift+Tab en el primero.
          focusableElements[focusableElements.length - 1].focus();
          event.preventDefault();
        } else if (isTab && focusedIndex === focusableElements.length - 1) {
          // Mover al primer elemento cuando se presiona Tab en el último.
          focusableElements[0].focus();
          event.preventDefault();
        }
      }
    });
  };
  
  /**
   * Establece atributos ARIA para accesibilidad en elementos dinámicos.
   * @param {HTMLElement} element - Elemento al que se aplicarán atributos ARIA.
   * @param {Object} attributes - Objeto con los atributos ARIA y sus valores.
   */
  export const setAriaAttributes = (element, attributes) => {
    if (!element || !attributes) return;
  
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(`aria-${key}`, attributes[key]);
    });
  };
  
  /**
   * Remueve atributos ARIA de un elemento.
   * @param {HTMLElement} element - Elemento del que se eliminarán los atributos ARIA.
   * @param {string[]} attributes - Lista de nombres de atributos ARIA a eliminar.
   */
  export const removeAriaAttributes = (element, attributes) => {
    if (!element || !attributes) return;
  
    attributes.forEach((key) => {
      element.removeAttribute(`aria-${key}`);
    });
  };

  /**
 * Accessibility utilities for the application
 */

/**
 * Announce a message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - Aria live setting: polite, assertive (default: polite)
 */
export const announce = (message, priority = 'polite') => {
  if (!message) return;
  
  let announcer = document.getElementById('screen-reader-announcer');
  
  // Create announcer element if it doesn't exist
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  
  // Update the priority if needed
  if (announcer.getAttribute('aria-live') !== priority) {
    announcer.setAttribute('aria-live', priority);
  }
  
  // Set the message
  announcer.textContent = message;
  
  // Clear the announcement after a delay
  setTimeout(() => {
    announcer.textContent = '';
  }, 3000);
};

/**
 * Focus trap for modals and dialogs
 * @param {HTMLElement} container - The container to trap focus in
 * @returns {object} Methods to control the focus trap
 */
export const createFocusTrap = (container) => {
  if (!container) return { activate: () => {}, deactivate: () => {} };
  
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  let active = false;
  let previousActiveElement = null;
  
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // If shift + tab and on first element, go to last element
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // If tab and on last element, go to first element
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  return {
    activate: () => {
      if (active) return;
      
      previousActiveElement = document.activeElement;
      
      if (firstElement) {
        firstElement.focus();
      }
      
      container.addEventListener('keydown', handleKeyDown);
      active = true;
    },
    deactivate: () => {
      if (!active) return;
      
      container.removeEventListener('keydown', handleKeyDown);
      
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
      
      active = false;
    }
  };
};

/**
 * Add ARIA attributes to an element based on its state
 * @param {HTMLElement} element - The element to update
 * @param {object} options - The ARIA attributes to set
 */
export const setAriaAttributes = (element, options = {}) => {
  if (!element) return;
  
  Object.entries(options).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      element.removeAttribute(`aria-${key}`);
    } else {
      element.setAttribute(`aria-${key}`, value.toString());
    }
  });
};

/**
 * Check if an element is visible to screen readers
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is accessible to screen readers
 */
export const isScreenReaderAccessible = (element) => {
  if (!element) return false;
  
  const computedStyle = window.getComputedStyle(element);
  
  // Elements with display:none or visibility:hidden are not accessible
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    return false;
  }
  
  // Check for aria-hidden attribute
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  
  return true;
};

/**
 * Generate alternative text for course image
 * @param {object} course - Course object
 * @returns {string} Alternative text
 */
export const generateCourseAltText = (course) => {
  if (!course) return 'Imagen de curso';
  
  let altText = `Imagen del curso "${course.title}"`;
  
  if (course.isFree) {
    altText += ' (Gratuito)';
  } else if (course.hasActiveDiscount) {
    altText += ` (Con ${course.discount}% de descuento)`;
  }
  
  return altText;
};

/**
 * Add keyboard support for click actions
 * @param {Event} event - Keyboard event
 * @param {function} callback - Function to call on activation
 */
export const handleKeyboardActivation = (event, callback) => {
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault();
    callback(event);
  }
};

// CSS class for hiding content visually but keeping it available for screen readers
export const srOnlyClass = 'sr-only';

// Helper utility to create sr-only text element
export const createSrOnlyText = (text) => {
  const span = document.createElement('span');
  span.className = srOnlyClass;
  span.innerText = text;
  return span;
};

// Add skip link functionality globally
export const initializeSkipLinks = () => {
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(skipLink.getAttribute('href'));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  }
};
