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
        closeModal: document.getElementById('closeIdModal'),
        closeMessageModal: document.getElementById('closeMessageModal')
    },
    modal: {
        idVerification: document.getElementById('idModal'),
        message: document.getElementById('messageModal')
    },
    messageModalContent: document.getElementById('messageModalContent')
};

// Configuration
const CONFIG = {
    validEmailDomains: ['@gmail.com', '@yahoo.com', '@hotmail.com', '@slu.edu.ph'],
    phoneRegex: /^9\d{9}$/,
    passwordRegex: /^(?=.*[0-9]).{8,}$/,
    endpoints: {
        verifyId: '/api/verify-id',
        register: '/api/register',
        checkUsername: '/api/check-username',
        checkEmail: '/api/check-email',
        checkPhone: '/api/check-phone',
        checkIdNumber: '/api/check-id'
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

    showModal: (message, isError = false) => {
        DOM.messageModalContent.textContent = message;
        DOM.messageModalContent.className = isError ? 'message-modal-content error' : 'message-modal-content success';
        DOM.modal.message.style.display = 'block';
    },

    hideModal: () => {
        DOM.modal.message.style.display = 'none';
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

    async checkFieldUniqueness(field, value, endpoint) {
        try {
            const data = await this.makeRequest(endpoint, { [field]: value });
            return data.status === 'success' && !data.exists;
        } catch (error) {
            console.error(`Error checking ${field} uniqueness:`, error);
            return false;
        }
    },

    async validateUniqueness(formData) {
        // Check username uniqueness
        const usernameUnique = await this.checkFieldUniqueness(
            'username', 
            formData.username, 
            CONFIG.endpoints.checkUsername
        );
        if (!usernameUnique) {
            this.showModal('Username already exists. Please choose a different username.', true);
            return false;
        }

        // Check email uniqueness
        const emailUnique = await this.checkFieldUniqueness(
            'email', 
            formData.email, 
            CONFIG.endpoints.checkEmail
        );
        if (!emailUnique) {
            this.showModal('Email is already registered. Please use a different email address.', true);
            return false;
        }

        // Check phone uniqueness
        const phoneUnique = await this.checkFieldUniqueness(
            'phone_number', 
            formData.phone_number, 
            CONFIG.endpoints.checkPhone
        );
        if (!phoneUnique) {
            this.showModal('Phone number is already registered. Please use a different number.', true);
            return false;
        }

        // Check ID number uniqueness
        const idUnique = await this.checkFieldUniqueness(
            'id_number', 
            formData.id_number, 
            CONFIG.endpoints.checkIdNumber
        );
        if (!idUnique) {
            this.showModal('ID Number is already registered. Please contact support if this is an error.', true);
            return false;
        }

        return true;
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
            return utils.showModal('ID Number is required.', true);
        }

        try {
            const data = await utils.makeRequest(CONFIG.endpoints.verifyId, {
                idNumber,
                userType: DOM.inputs.userType.value
            });

            if (data.status === 'success') {
                utils.showModal('ID number verified successfully!');
                DOM.inputs.hiddenIdNumber.value = idNumber;
                DOM.modal.idVerification.style.display = 'none';
                DOM.buttons.register.disabled = false;
            } else {
                utils.showModal(data.message || 'Verification failed.', true);
            }
        } catch (error) {
            utils.showModal('An error occurred during verification. Please try again.', true);
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

        // Basic validation
        if (!utils.validateEmail(formData.email)) {
            return utils.showModal('Please use a valid email domain (gmail.com, yahoo.com, hotmail.com, or slu.edu.ph)', true);
        }

        if (!utils.validatePhone(formData.phone_number)) {
            return utils.showModal('Please enter a valid phone number (e.g., 9984276714)', true);
        }

        if (!utils.validatePassword(formData.password)) {
            return utils.showModal('Password must be at least 8 characters long and contain at least one number', true);
        }

        if (formData.password !== formData.confirm_password) {
            return utils.showModal('Passwords do not match', true);
        }

        // Check uniqueness of all fields
        const isUnique = await utils.validateUniqueness(formData);
        if (!isUnique) {
            return; // Modal message already shown by validateUniqueness
        }

        try {
            const data = await utils.makeRequest(CONFIG.endpoints.register, formData);
            
            if (data.status === 'success') {
                utils.showModal('Registration successful!');
                setTimeout(() => {
                    window.location.href = '../html/login.html';
                }, 2000);
            } else {
                utils.showModal(`Registration failed: ${data.message}`, true);
            }
        } catch (error) {
            utils.showModal('Registration failed. Please try again.', true);
        }
    },

    handleUserTypeChange(event) {
        const userType = event.target.value;
        const requiresVerification = ['Student', 'Faculty/Staff'].includes(userType);
        
        DOM.modal.idVerification.style.display = requiresVerification ? 'block' : 'none';
        DOM.buttons.register.disabled = requiresVerification;
    },

    handleModalClose() {
        DOM.modal.idVerification.style.display = 'none';
    },

    handleMessageModalClose() {
        DOM.modal.message.style.display = 'none';
    },

    handleOutsideModalClick(event) {
        if (event.target === DOM.modal.idVerification) {
            DOM.modal.idVerification.style.display = 'none';
        }
        if (event.target === DOM.modal.message) {
            DOM.modal.message.style.display = 'none';
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
    DOM.buttons.closeMessageModal.addEventListener('click', handlers.handleMessageModalClose);
    window.addEventListener('click', handlers.handleOutsideModalClick);
});