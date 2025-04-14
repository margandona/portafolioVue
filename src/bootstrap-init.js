// Import jQuery and Bootstrap
import $ from 'jquery';

// Make jQuery globally available
window.$ = window.jQuery = $;

// Import Bootstrap
import 'bootstrap';

// Function to check if Bootstrap modal is available
export function checkBootstrapModal() {
  console.log('Checking Bootstrap modal functionality...');
  if (window.jQuery && typeof window.jQuery.fn.modal === 'function') {
    console.log('Bootstrap modal is available');
    return true;
  } else {
    console.error('Bootstrap modal is NOT available - loading from CDN');
    // Try to load Bootstrap from CDN
    loadBootstrapFromCDN();
    return false;
  }
}

// Load Bootstrap JS from CDN as a fallback
function loadBootstrapFromCDN() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js';
  script.integrity = 'sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  
  script.onload = () => {
    console.log('Bootstrap loaded from CDN successfully');
  };
  
  script.onerror = () => {
    console.error('Failed to load Bootstrap from CDN');
  };
}
