document.addEventListener('DOMContentLoaded', () => {
    const businessHours = [
        { day: 'Monday', open: 8, close: 17 },
        { day: 'Tuesday', open: 8, close: 17 },
        { day: 'Wednesday', open: 8, close: 17 },
        { day: 'Thursday', open: 8, close: 17 },
        { day: 'Friday', open: 8, close: 17 },
        { day: 'Saturday', open: 8, close: 14 },
        { day: 'Sunday', open: 0, close: 0 } // Closed
    ];

    const fetchPSTTime = async () => {
        try {
            const response = await fetch('https://worldtimeapi.org/api/timezone/America/Los_Angeles');
            const data = await response.json();
            return new Date(data.datetime);
        } catch (error) {
            console.error('Error fetching time:', error);
            return new Date(); // Fallback to local time
        }
    };

    const updateBusinessHours = async () => {
        const pstNow = await fetchPSTTime();
        const currentDay = pstNow.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const currentHour = pstNow.getHours();
        const currentMinutes = pstNow.getMinutes();

        const hoursList = document.querySelectorAll('.contact-details ul li');

        businessHours.forEach((hours, index) => {
            const listItem = hoursList[index];
            let trafficLight = '';

            if (index === (currentDay === 0 ? 6 : currentDay - 1)) {
                // Update symbol for the current day
                if (hours.open === 0 && hours.close === 0) {
                    trafficLight = '<span class="legend-sign red"></span>'; // Closed
                } else if (currentHour < hours.open || currentHour >= hours.close) {
                    trafficLight = '<span class="legend-sign red"></span>'; // Closed
                } else if (currentHour === hours.close - 1 && currentMinutes >= 0) {
                    trafficLight = '<span class="legend-sign yellow"></span>'; // Closing Soon
                } else {
                    trafficLight = '<span class="legend-sign green"></span>'; // Open
                }
                // Prepend the traffic light symbol to the list item
                listItem.innerHTML = `${trafficLight} ${listItem.textContent}`;
            }
        });
    };

    // Insert the legend dynamically where you marked
    const legend = document.createElement('div');
    legend.classList.add('hours-legend');
    legend.innerHTML = `
        <p><span class="legend-sign green"></span> Open</p>
        <p><span class="legend-sign yellow"></span> Closing Soon</p>
        <p><span class="legend-sign red"></span> Closed</p>
    `;
    const hoursList = document.querySelector('.contact-details ul');
    hoursList.insertAdjacentElement('beforebegin', legend); // Insert legend above the hours list
    updateBusinessHours();
});

// FORM VALIDATION FOR CONTACTUS AND BUTTON STYLING
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    const phoneInput = document.querySelector('#phone');
    const messageInput = document.querySelector('#message');
    const submitButton = document.querySelector('.contact-form button');

    // Email validation (check for @ sign)
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Phone number formatting and validation
    const formatPhoneNumber = (phone) => {
        // Remove all non-numeric characters
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 0) return ''; // No input

        // Format dynamically based on length
        if (digits.length <= 3) return `(${digits}`;
        if (digits.length <= 6) return `(${digits.substring(0, 3)}) ${digits.substring(3)}`;
        return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
    };

    const validatePhoneNumber = (phone) => {
        const formattedPhone = formatPhoneNumber(phone);
        phoneInput.value = formattedPhone; // Ensure formatting happens on every validation
        return /^\(\d{3}\) \d{3}-\d{4}$/.test(formattedPhone); // Validate formatted phone
    };

    // Attach input listener for dynamic phone number formatting
    phoneInput.addEventListener('input', () => {
        phoneInput.value = formatPhoneNumber(phoneInput.value);
    });

    // Form validation logic
    const validateForm = () => {
        let isValid = true;

        // Name validation
        if (nameInput.value.trim() === '') {
            isValid = false;
        }

        // Either email or phone must be valid
        const emailValid = validateEmail(emailInput.value.trim());
        const phoneValid = validatePhoneNumber(phoneInput.value.trim());

        if (!emailValid && !phoneValid) {
            isValid = false;
        }

        // Message validation
        if (messageInput.value.trim() === '') {
            isValid = false;
        }

        return isValid;
    };

    // Dynamic Button Feedback
    const updateButtonState = (state) => {
        if (state === 'sending') {
            submitButton.style.backgroundColor = '#000';
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
        } else if (state === 'sent') {
            submitButton.style.backgroundColor = '#28a745'; // Green
            submitButton.textContent = 'Sent ✓';
            setTimeout(() => resetButton(), 3000);
        } else if (state === 'error') {
            submitButton.style.backgroundColor = '#ff0000'; // Red
            submitButton.textContent = 'Error ⚠︎';
            setTimeout(() => resetButton(), 3000);
        }
    };

    const resetButton = () => {
        submitButton.style.backgroundColor = ''; // Reset to default
        submitButton.textContent = 'Send';
        submitButton.disabled = false;
    };

    // Form submission handling
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Validate the form
        if (!validateForm()) {
            console.log('Form validation failed');
            updateButtonState('error'); // Show error if form validation fails
            return;
        }

        updateButtonState('sending');

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                console.log('Form submission successful');
                updateButtonState('sent'); // Show sent success
                form.reset(); // Clear the form
            } else {
                console.error('Form submission failed:', response.statusText);
                updateButtonState('error'); // Show error on failure
            }
        } catch (error) {
            console.error('Error during form submission:', error);
            updateButtonState('error'); // Show error on exception
        }
    });
});

