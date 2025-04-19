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
  