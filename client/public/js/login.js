document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const modal = document.getElementById('forgotPasswordModal');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const closeModal = document.getElementsByClassName('close')[0];
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const togglePasswordIcon = document.querySelector('#togglePassword');

    loginForm?.addEventListener('submit', async function (e) {
        e.preventDefault();
        errorMessage.style.display = 'none';
    
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
    
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';
    
            // Debug log
            console.log('Sending login request:', {
                username: formData.get('username'),
                password: formData.get('password')
            });
    
            const response = await fetch('http://192.168.1.19:3000/api/login', {
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

    // Modal handlers - Keeping existing implementation
    if (modal && forgotPasswordLink && closeModal) {
        forgotPasswordLink.onclick = (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        };

        closeModal.onclick = () => {
            modal.style.display = 'none';
            forgotPasswordForm?.reset();
        };

        window.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                forgotPasswordForm?.reset();
            }
        };
    }

    // Password visibility toggle - Keeping existing implementation
    togglePasswordIcon?.addEventListener('click', function () {
        const passwordField = document.querySelector('#password');
        if (passwordField) {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
        }
    });

    // Forgot password form handler - Updated with better error handling
    forgotPasswordForm?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('forgotEmail')?.value.trim();
        const forgotPasswordMessage = document.getElementById('forgotPasswordMessage');
        const submitButton = this.querySelector('button[type="submit"]');

        if (!email) {
            forgotPasswordMessage.innerText = 'Please enter your email address';
            forgotPasswordMessage.style.color = '#ff6666';
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });

            const data = await response.json();
            forgotPasswordMessage.innerText = data.message;
            forgotPasswordMessage.style.color = data.status === 'success' ? 'green' : '#ff6666';

            if (data.status === 'success') {
                this.reset();
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 3000);
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            forgotPasswordMessage.innerText = 'An error occurred. Please try again.';
            forgotPasswordMessage.style.color = '#ff6666';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Reset Password';
        }
    });
});