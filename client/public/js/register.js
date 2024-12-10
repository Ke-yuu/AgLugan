document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('registrationForm').addEventListener('submit', function (event) {
        event.preventDefault();

        // Get form values
        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const phone_number = document.getElementById('phone_number').value;
        const user_type = document.getElementById('user_type').value;

        // Validate email format
        const validEmailDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@slu.edu.ph'];
        if (!validEmailDomains.some(domain => email.endsWith(domain))) {
            alert('Invalid email address or domain address.');
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

        // Validate confirm password matches password
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please re-enter your password.');
            return;
        }

        // Check uniqueness of email, phone number, and username
        fetch('../../src/php/check_unique.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, phone_number: phone_number, username: username })
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
            if (data.username_exists) {
                alert('The username is already taken. Please choose a different one.');
                return;
            }

            // Prepare form data for submission
            const formData = new FormData();
            formData.append('name', name);
            formData.append('username', username);
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

document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePasswordIcon = document.querySelector('#togglePassword');
    const toggleConfirmPasswordIcon = document.querySelector('#toggleConfirmPassword');

    if (togglePasswordIcon) {
        togglePasswordIcon.addEventListener('click', function () {
            const passwordField = document.querySelector('#password');
            const passwordFieldType = passwordField.getAttribute('type');
            passwordField.setAttribute('type', passwordFieldType === 'password' ? 'text' : 'password');

            // Toggle icon style
            togglePasswordIcon.classList.toggle('fa-eye-slash');
            togglePasswordIcon.classList.toggle('fa-eye');
        });
    }

    if (toggleConfirmPasswordIcon) {
        toggleConfirmPasswordIcon.addEventListener('click', function () {
            const confirmPasswordField = document.querySelector('#confirm_password');
            const confirmPasswordFieldType = confirmPasswordField.getAttribute('type');
            confirmPasswordField.setAttribute('type', confirmPasswordFieldType === 'password' ? 'text' : 'password');

            // Toggle icon style
            toggleConfirmPasswordIcon.classList.toggle('fa-eye-slash');
            toggleConfirmPasswordIcon.classList.toggle('fa-eye');
        });
    }

    // Handle registration form submission
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault();
        // Your existing form validation and submission code...
    });
});