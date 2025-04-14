// Check if Bootstrap and jQuery are properly loaded
console.log('Bootstrap check initialized');

// Check if jQuery is available
if (window.jQuery) {
  console.log('jQuery is available, version:', window.jQuery.fn.jquery);
} else {
  console.error('jQuery is NOT available - this will cause modal issues');
}

// Check if Bootstrap's JS is available through jQuery
if (window.jQuery && window.jQuery.fn.modal) {
  console.log('Bootstrap modal plugin is available');
} else {
  console.error('Bootstrap modal plugin is NOT available - modals will not work');
}

// Export a function to initialize Bootstrap components
export function initBootstrap() {
  console.log('Attempting to initialize Bootstrap components');
  
  if (window.jQuery && window.jQuery.fn.modal) {
    try {
      // Initialize all tooltips
      window.jQuery('[data-toggle="tooltip"]').tooltip();
      console.log('Tooltips initialized');
      
      // Initialize all modals
      window.jQuery('.modal').each(function() {
        try {
          window.jQuery(this).modal({
            show: false
          });
          console.log('Modal initialized:', this.id);
        } catch (error) {
          console.error('Error initializing modal:', this.id, error);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error during Bootstrap initialization:', error);
      return false;
    }
  } else {
    console.error('Cannot initialize Bootstrap components - dependencies missing');
    return false;
  }
}
