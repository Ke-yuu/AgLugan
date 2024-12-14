document.addEventListener('DOMContentLoaded', function() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000`;

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        errorMessage.textContent = 'Invalid reset link. Please request a new password reset.';
        errorMessage.style.display = 'block';
        resetPasswordForm.style.display = 'none';
        return;
    }

    // Verify token validity first
    async function verifyToken() {
        try {
            const response = await fetch(`${BASE_URL}/api/verify-reset-token/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.status !== 'success') {
                errorMessage.textContent = 'This password reset link has expired or is invalid. Please request a new one.';
                errorMessage.style.display = 'block';
                resetPasswordForm.style.display = 'none';
            }
        } catch (error) {
            console.error('Token verification error:', error);
            errorMessage.textContent = 'Unable to verify reset link. Please try again or request a new one.';
            errorMessage.style.display = 'block';
            resetPasswordForm.style.display = 'none';
        }
    }

    // Verify token when page loads
    verifyToken();

    // Password visibility toggle handlers
    togglePassword?.addEventListener('click', function() {
        const passwordField = document.getElementById('newPassword');
        togglePasswordVisibility(passwordField, this);
    });

    toggleConfirmPassword?.addEventListener('click', function() {
        const confirmPasswordField = document.getElementById('confirmPassword');
        togglePasswordVisibility(confirmPasswordField, this);
    });

    function togglePasswordVisibility(passwordField, icon) {
        if (passwordField && icon) {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            icon.classList.toggle('fa-eye-slash');
            icon.classList.toggle('fa-eye');
        }
    }

    resetPasswordForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const submitButton = this.querySelector('button[type="submit"]');

        // Validate passwords
        if (newPassword !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.style.display = 'block';
            return;
        }

        if (!newPassword || newPassword.length < 8) {
            errorMessage.textContent = 'Password must be at least 8 characters long';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Resetting...';

            const response = await fetch(`${BASE_URL}/api/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword
                }),
                credentials: 'include'  // Added this for session handling
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                successMessage.textContent = 'Password reset successful. Redirecting to login...';
                successMessage.style.display = 'block';
                resetPasswordForm.reset();
                
                // Redirect to login page after successful reset
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                errorMessage.textContent = data.message || 'Failed to reset password. Please try again.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Reset password error:', error);
            errorMessage.textContent = 'An error occurred. Please try again or request a new reset link.';
            errorMessage.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Reset Password';
        }
    });
});