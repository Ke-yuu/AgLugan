document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('registrationForm');
    const userTypeSelect = document.getElementById('user_type');
    const idModal = document.getElementById('idModal');
    const closeIdModal = document.getElementById('closeIdModal');
    const idForm = document.getElementById('idForm');
    const idNumberInput = document.getElementById('idNumber');
    const hiddenIdNumber = document.getElementById('id_number');
    const registerButton = document.getElementById('registerButton');
    const togglePasswordIcon = document.getElementById('togglePassword');
    const toggleConfirmPasswordIcon = document.getElementById('toggleConfirmPassword');

    let selectedUserType = null;

    // Toggle password visibility
    togglePasswordIcon?.addEventListener('click', function () {
        const passwordField = document.querySelector('#password');
        if (passwordField) {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
        }
    });

    toggleConfirmPasswordIcon?.addEventListener('click', function () {
        const confirmPasswordField = document.querySelector('#confirm_password');
        if (confirmPasswordField) {
            const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordField.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
        }
    });

    // Show modal when "Student" or "Faculty/Staff" is selected
    userTypeSelect.addEventListener('change', function () {
        selectedUserType = this.value;

        if (selectedUserType === 'Student' || selectedUserType === 'Faculty/Staff') {
            idModal.style.display = 'block'; 
            registerButton.disabled = true;
        } else {
            idModal.style.display = 'none'; 
            registerButton.disabled = false;
        }
    });

    // Close modal
    closeIdModal.addEventListener('click', function () {
        idModal.style.display = 'none';
    });

    // Handle ID form submission
    idForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const idNumber = idNumberInput.value.trim();

        if (!idNumber) {
            alert('ID Number is required.');
            return;
        }

        try {
            const response = await fetch('/api/verify-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idNumber, userType: selectedUserType }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                alert('ID number verified. You may now register.');
                hiddenIdNumber.value = idNumber; 
                idModal.style.display = 'none';
                registerButton.disabled = false;
            } else if (response.status === 409) {
                alert(data.message || 'ID number is already registered.');
            } else {
                alert(data.message || 'Verification failed.');
            }
        } catch (error) {
            console.error('Error verifying ID number:', error);
            alert('An error occurred while verifying your ID number. Please try again.');
        }
    });

    // Handle registration form submission
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
        const id_number = hiddenIdNumber.value.trim();

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

        // Submit registration
        try {
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, password, phone_number, user_type, id_number }),
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
