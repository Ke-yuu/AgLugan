document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const phone_number = document.getElementById('phone_number').value;
        const user_type = document.getElementById('user_type').value;

        // Validate email format
        const validEmailDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@slu.edu.ph'];
        if (!validEmailDomains.some(domain => email.endsWith(domain))) {
            alert('Invalid email address or domain address. ');
            return;
        }

        // Validate phone number format (starts with 9 and followed by 9 digits)
        const phoneRegex = /^9\d{9}$/;
        if (!phoneRegex.test(phone_number)) {
            alert('Please enter a valid phone number! (e.g. 9984276714).');
            return;
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert('Password must be at least 8 characters long and contain at least one number.');
            return;
        }

        // Check uniqueness of email and phone number
        fetch('../php/check_unique.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, phone_number: phone_number })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to check uniqueness');
            }
            return response.json();
        })
        .then(data => {
            if (data.email_exists) {
                alert('The email address is already registered.');
                return;
            }
            if (data.phone_exists) {
                alert('The phone number is already registered.');
                return;
            }

            // Prepare form data for submission
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('phone_number', phone_number);
            formData.append('user_type', user_type);

            // Send form data to PHP script using fetch API
            return fetch('../php/register.php', {
                method: 'POST',
                body: formData
            });
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Registration failed');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                alert('Registration successful!');
                window.location.href = '../html/login.html';
            } else {
                alert("Registration failed: " + data.message);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert(error.message);
        });
    });
});
