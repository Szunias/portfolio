/**
 * Contact Form Handler with Web3Forms Integration
 * Provides functional contact form that sends emails directly
 */

(function() {
  'use strict';

  // Web3Forms configuration
  const WEB3FORMS_CONFIG = {
    accessKey: '63daf122-621e-405f-ac46-d4537bfba2a4',
    endpoint: 'https://api.web3forms.com/submit'
  };

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const statusEl = document.querySelector('.cf-status');

    if (!contactForm) return;

    // Attach form handler
    contactForm.addEventListener('submit', handleFormSubmit);

    // Add real-time validation
    addFormValidation();
  });

  function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const statusEl = document.querySelector('.cf-status');
    const submitBtn = document.getElementById('cf-send');
    const btnText = submitBtn.querySelector('.btn-text');

    // Get form data
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject') || 'Contact from Portfolio',
      message: formData.get('message')
    };

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    if (!isValidEmail(data.email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    if (btnText) {
      btnText.textContent = 'Sending...';
    } else {
      submitBtn.textContent = 'Sending...';
    }
    showStatus('Sending your message...', 'info');

    // Send via Web3Forms
    sendViaWeb3Forms(data, form, submitBtn);
  }

  function sendViaWeb3Forms(data, form, submitBtn) {
    // Prepare form data for Web3Forms
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_CONFIG.accessKey);
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    formData.append('from_name', data.name);
    formData.append('replyto', data.email);

    // Send to Web3Forms API
    fetch(WEB3FORMS_CONFIG.endpoint, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        showStatus('Message sent successfully! I\'ll respond soon.', 'success');
        form.reset();
        logMessage(data); // Store locally as backup
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    })
    .catch(error => {
      // Web3Forms Error occurred
      showStatus('An error occurred while sending. Please try again later.', 'error');
    })
    .finally(() => {
      submitBtn.disabled = false;
      const btnText = submitBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = 'Send Message';
      } else {
        submitBtn.textContent = 'Send';
      }
    });
  }

  function logMessage(data) {
    // Store message locally for backup/reference
    try {
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
      messages.push({
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      
      // Keep only last 50 messages
      if (messages.length > 50) {
        messages.splice(0, messages.length - 50);
      }
      
      localStorage.setItem('contact_messages', JSON.stringify(messages));
    } catch (e) {
      // Could not save message locally
    }
  }

  function addFormValidation() {
    const nameInput = document.getElementById('cf-name');
    const emailInput = document.getElementById('cf-email');
    const messageInput = document.getElementById('cf-message');

    if (nameInput) {
      nameInput.addEventListener('blur', function() {
        validateField(this, this.value.trim().length >= 2, 'Name must be at least 2 characters');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('blur', function() {
        validateField(this, isValidEmail(this.value), 'Please enter a valid email address');
      });
    }

    if (messageInput) {
      messageInput.addEventListener('blur', function() {
        validateField(this, this.value.trim().length >= 10, 'Message must be at least 10 characters');
      });
    }
  }

  function validateField(field, isValid, errorMessage) {
    const formGroup = field.closest('.form-group');
    const existingError = formGroup ? formGroup.querySelector('.field-error') : field.parentNode.querySelector('.field-error');

    if (existingError) {
      existingError.style.display = 'none';
      existingError.textContent = '';
    }

    if (!isValid && field.value.trim()) {
      field.classList.add('error');
      if (existingError) {
        existingError.textContent = errorMessage;
        existingError.style.display = 'block';
      } else {
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.textContent = errorMessage;
        const target = formGroup || field.parentNode;
        target.appendChild(errorEl);
      }
    } else {
      field.classList.remove('error');
    }
  }

  function showStatus(message, type = 'info') {
    const statusEl = document.querySelector('.cf-status');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `cf-status cf-status-${type}`;
    
    // Auto-hide success/error messages after 5 seconds
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'cf-status';
      }, 5000);
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Utility function to get stored messages (for debugging)
  window.getContactMessages = function() {
    try {
      return JSON.parse(localStorage.getItem('contact_messages') || '[]');
    } catch (e) {
      return [];
    }
  };

})();
