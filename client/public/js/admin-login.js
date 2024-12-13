document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const togglePasswordIcon = document.querySelector('#togglePassword');

    // Handle form submission
    loginForm?.addEventListener('submit', async function (e) {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();
        const submitButton = loginForm.querySelector('button[type="submit"]');

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        try {
            const response = await fetch('/api/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status === 'success') {
                window.location.href = data.redirectUrl; 
            } else {
                // Show error message
                errorMessage.textContent = data.message || 'Login failed.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        } finally {
            // Re-enable the submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });

    // Toggle password visibility
    togglePasswordIcon?.addEventListener('click', function () {
        const passwordField = document.querySelector('#password');
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });
});
