// Connect page form handling
document.addEventListener('DOMContentLoaded', function() {
    // Email links: mailto on phone (opens Gmail app), Gmail compose URL on PC (opens in browser)
    const EMAIL = 'prasadmkarthik@gmail.com';
    const GMAIL_COMPOSE_URL = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const emailHref = isMobile ? 'mailto:' + EMAIL : GMAIL_COMPOSE_URL;
    const emailLink = document.getElementById('email-link');
    const ctaEmailLink = document.getElementById('cta-email-link');
    if (emailLink) emailLink.href = emailHref;
    if (ctaEmailLink) ctaEmailLink.href = emailHref;

    const contactForm = document.getElementById('contactForm');
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton?.querySelector('.button-text');
    const buttonSpinner = submitButton?.querySelector('.button-spinner');
    const formStatus = document.getElementById('formStatus');
    
    // Get form fields
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    
    // Error message elements
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    
    // API endpoint
    const CONTACT_ENDPOINT = '/api/contact';
    
    // Clear error messages
    function clearErrors() {
        if (nameError) nameError.textContent = '';
        if (emailError) emailError.textContent = '';
        if (messageError) messageError.textContent = '';
        if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
            formStatus.style.display = 'none';
        }
    }
    
    // Show error message for a field
    function showFieldError(field, message) {
        const errorElement = {
            'name': nameError,
            'email': emailError,
            'message': messageError
        }[field];
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    // Show status message
    function showStatus(message, type = 'info') {
        if (!formStatus) return;
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
        
        // Scroll to status message
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Set loading state
    function setLoading(isLoading) {
        if (!submitButton) return;
        submitButton.disabled = isLoading;
        
        if (buttonText && buttonSpinner) {
            if (isLoading) {
                buttonText.textContent = 'Sending...';
                buttonSpinner.style.display = 'inline-block';
            } else {
                buttonText.textContent = 'Send';
                buttonSpinner.style.display = 'none';
            }
        }
    }
    
    // Validate form
    function validateForm() {
        let isValid = true;
        clearErrors();
        
        // Validate name
        if (!nameInput || !nameInput.value.trim()) {
            showFieldError('name', 'Name is required');
            isValid = false;
        } else if (nameInput.value.trim().length < 2) {
            showFieldError('name', 'Name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate email
        if (!emailInput || !emailInput.value.trim()) {
            showFieldError('email', 'Email is required');
            isValid = false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                showFieldError('email', 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Validate message
        if (!messageInput || !messageInput.value.trim()) {
            showFieldError('message', 'Message is required');
            isValid = false;
        } else if (messageInput.value.trim().length < 10) {
            showFieldError('message', 'Message must be at least 10 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Handle form submission
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearErrors();
            
            // Validate form
            if (!validateForm()) {
                showStatus('Please fix the errors above', 'error');
                return;
            }
            
            // Prepare form data
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectInput ? subjectInput.value.trim() : '',
                message: messageInput.value.trim()
            };
            
            // Set loading state
            setLoading(true);
            
            try {
                // Log submission attempt (if Logger is available)
                if (typeof Logger !== 'undefined' && Logger.info) {
                    Logger.info('Submitting contact form');
                }
                
                // Send request to API
                const response = await fetch(CONTACT_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send message. Please try again.');
                }
                
                // Success!
                showStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
                
                // Reset form
                contactForm.reset();
                clearErrors();
                
                // Log success (if Logger is available)
                if (typeof Logger !== 'undefined' && Logger.success) {
                    Logger.success('Contact form submitted successfully');
                }
                
                // Use error handler for success notification if available
                if (typeof errorHandler !== 'undefined' && errorHandler.showError) {
                    // Note: errorHandler.showError can be used for success too, or we can extend it
                    // For now, we'll just use the form status
                }
                
            } catch (error) {
                console.error('Contact form error:', error);
                
                // Show error message
                const errorMessage = error.message || 'Failed to send message. Please check your connection and try again.';
                showStatus(errorMessage, 'error');
                
                // Use error handler if available
                if (typeof errorHandler !== 'undefined' && errorHandler.showError) {
                    errorHandler.showError(
                        'Failed to Send Message',
                        errorMessage,
                        () => {
                            // Retry callback
                            contactForm.dispatchEvent(new Event('submit'));
                        }
                    );
                }
                
                // Log error (if Logger is available)
                if (typeof Logger !== 'undefined' && Logger.error) {
                    Logger.error('Contact form submission failed:', error);
                }
            } finally {
                // Reset loading state
                setLoading(false);
            }
        });
    }
    
    // Real-time validation on blur
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (nameInput.value.trim() && nameInput.value.trim().length < 2) {
                showFieldError('name', 'Name must be at least 2 characters');
            } else if (nameInput.value.trim()) {
                if (nameError) nameError.textContent = '';
            }
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (emailInput.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value.trim())) {
                    showFieldError('email', 'Please enter a valid email address');
                } else {
                    if (emailError) emailError.textContent = '';
                }
            }
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('blur', function() {
            if (messageInput.value.trim() && messageInput.value.trim().length < 10) {
                showFieldError('message', 'Message must be at least 10 characters');
            } else if (messageInput.value.trim()) {
                if (messageError) messageError.textContent = '';
            }
        });
    }
    
    // Log initialization (if Logger is available)
    if (typeof Logger !== 'undefined' && Logger.info) {
        Logger.info('Connect page form handler initialized');
    }
});
