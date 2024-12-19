// DOM Elements
const DOM = {
    form: {
        registration: document.getElementById('registrationForm'),
        idForm: document.getElementById('idForm')
    },
    inputs: {
        name: document.getElementById('name'),
        username: document.getElementById('username'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone_number'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirm_password'),
        userType: document.getElementById('user_type'),
        idNumber: document.getElementById('idNumber'),
        hiddenIdNumber: document.getElementById('id_number')
    },
    buttons: {
        register: document.getElementById('registerButton'),
        togglePassword: document.getElementById('togglePassword'),
        toggleConfirmPassword: document.getElementById('toggleConfirmPassword'),
        closeModal: document.getElementById('closeIdModal')
    },
    modal: document.getElementById('idModal')
};

// Configuration
const CONFIG = {
    validEmailDomains: ['@gmail.com', '@yahoo.com', '@hotmail.com', '@slu.edu.ph'],
    phoneRegex: /^9\d{9}$/,
    passwordRegex: /^(?=.*[0-9]).{8,}$/,
    endpoints: {
        verifyId: '/api/verify-id',
        register: '/api/register'
    }
};

// Utility Functions
const utils = {
    togglePasswordVisibility: (inputId, iconId) => {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        
        const newType = input.type === 'password' ? 'text' : 'password';
        input.type = newType;
        
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    },

    showAlert: (message, isError = false) => {
        alert(message); // Could be replaced with a custom alert system
    },

    validateEmail: (email) => {
        return CONFIG.validEmailDomains.some(domain => email.endsWith(domain));
    },

    validatePhone: (phone) => {
        return CONFIG.phoneRegex.test(phone);
    },

    validatePassword: (password) => {
        return CONFIG.passwordRegex.test(password);
    },

    async makeRequest(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Request error:', error);
            throw new Error('Network error occurred');
        }
    }
};

// Event Handlers
const handlers = {
    async handleIdVerification(event) {
        event.preventDefault();
        const idNumber = DOM.inputs.idNumber.value.trim();

        if (!idNumber) {
            return utils.showAlert('ID Number is required.', true);
        }

        try {
            const data = await utils.makeRequest(CONFIG.endpoints.verifyId, {
                idNumber,
                userType: DOM.inputs.userType.value
            });

            if (data.status === 'success') {
                utils.showAlert('ID number verified successfully!');
                DOM.inputs.hiddenIdNumber.value = idNumber;
                DOM.modal.style.display = 'none';
                DOM.buttons.register.disabled = false;
            } else {
                utils.showAlert(data.message || 'Verification failed.', true);
            }
        } catch (error) {
            utils.showAlert('An error occurred during verification. Please try again.', true);
        }
    },

    async handleRegistration(event) {
        event.preventDefault();

        // Get form data
        const formData = {
            name: DOM.inputs.name.value.trim(),
            username: DOM.inputs.username.value.trim(),
            email: DOM.inputs.email.value.trim(),
            phone_number: DOM.inputs.phone.value.trim(),
            password: DOM.inputs.password.value,
            confirm_password: DOM.inputs.confirmPassword.value,
            user_type: DOM.inputs.userType.value,
            id_number: DOM.inputs.hiddenIdNumber.value.trim()
        };

        // Validation
        if (!utils.validateEmail(formData.email)) {
            return utils.showAlert('Please use a valid email domain (gmail.com, yahoo.com, hotmail.com, or slu.edu.ph)', true);
        }

        if (!utils.validatePhone(formData.phone_number)) {
            return utils.showAlert('Please enter a valid phone number (e.g., 9984276714)', true);
        }

        if (!utils.validatePassword(formData.password)) {
            return utils.showAlert('Password must be at least 8 characters long and contain at least one number', true);
        }

        if (formData.password !== formData.confirm_password) {
            return utils.showAlert('Passwords do not match', true);
        }

        try {
            const data = await utils.makeRequest(CONFIG.endpoints.register, formData);
            
            if (data.status === 'success') {
                utils.showAlert('Registration successful!');
                window.location.href = '../html/login.html';
            } else {
                utils.showAlert(`Registration failed: ${data.message}`, true);
            }
        } catch (error) {
            utils.showAlert('Registration failed. Please try again.', true);
        }
    },

    handleUserTypeChange(event) {
        const userType = event.target.value;
        const requiresVerification = ['Student', 'Faculty/Staff'].includes(userType);
        
        DOM.modal.style.display = requiresVerification ? 'block' : 'none';
        DOM.buttons.register.disabled = requiresVerification;
    },

    handleModalClose() {
        DOM.modal.style.display = 'none';
    },

    handleOutsideModalClick(event) {
        if (event.target === DOM.modal) {
            DOM.modal.style.display = 'none';
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Form submissions
    DOM.form.registration.addEventListener('submit', handlers.handleRegistration);
    DOM.form.idForm.addEventListener('submit', handlers.handleIdVerification);

    // Password toggles
    DOM.buttons.togglePassword.addEventListener('click', () => 
        utils.togglePasswordVisibility('password', 'togglePassword'));
    DOM.buttons.toggleConfirmPassword.addEventListener('click', () => 
        utils.togglePasswordVisibility('confirm_password', 'toggleConfirmPassword'));

    // Modal handling
    DOM.inputs.userType.addEventListener('change', handlers.handleUserTypeChange);
    DOM.buttons.closeModal.addEventListener('click', handlers.handleModalClose);
    window.addEventListener('click', handlers.handleOutsideModalClick);
});