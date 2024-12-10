document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('registrationForm');

    registrationForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Get form values
        const name = document.getElementById('name').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const phone_number = document.getElementById('phone_number').value.trim();
        const user_type = document.getElementById('user_type').value;

        // Validation
        const validEmailDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@slu.edu.ph'];
        if (!validEmailDomains.some(domain => email.endsWith(domain))) {
            alert('Invalid email address or domain address.');
            return;
        }

        const phoneRegex = /^9\d{9}$/;
        if (!phoneRegex.test(phone_number)) {
            alert('Please enter a valid phone number! (e.g. 9984276714).');
            return;
        }

        const passwordRegex = /^(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert('Password must be at least 8 characters long and contain at least one number.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // Check uniqueness
        try {
            const uniqueResponse = await fetch('/api/check-unique', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone_number, username }),
            });

            if (!uniqueResponse.ok) throw new Error('Error checking uniqueness.');

            const uniqueData = await uniqueResponse.json();

            if (uniqueData.email_exists) return alert('The email address is already registered.');
            if (uniqueData.phone_exists) return alert('The phone number is already registered.');
            if (uniqueData.username_exists) return alert('The username is already taken.');

            // Submit registration
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, password, phone_number, user_type }),
            });

            if (!registerResponse.ok) {
                const errorData = await registerResponse.json();
                throw new Error(errorData.message || 'Registration failed.');
            }

            const registerData = await registerResponse.json();

            if (registerData.status === 'success') {
                alert('Registration successful!');
                window.location.href = '../html/login.html';
            } else {
                alert(`Registration failed: ${registerData.message}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.message);
        }
    });
});
