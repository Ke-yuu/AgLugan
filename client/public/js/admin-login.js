document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const togglePasswordIcon = document.querySelector('#togglePassword');
    const BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000`;

    loginForm?.addEventListener('submit', async function (e) {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';

            // Debug log
            console.log('Sending admin login request:', {
                username: formData.get('username'),
                password: formData.get('password')
            });

            const response = await fetch(`${BASE_URL}/api/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.get('username')?.trim(),
                    password: formData.get('password')?.trim()
                }),
                credentials: 'include'
            });

            // Debug log
            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (data.status === 'success') {
                loginForm.reset();
                window.location.href = data.redirectUrl;
            } else {
                errorMessage.textContent = data.message || 'Login failed';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });

    // Password visibility toggle
    togglePasswordIcon?.addEventListener('click', function () {
        const passwordField = document.querySelector('#password');
        if (passwordField) {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
        }
    });
});