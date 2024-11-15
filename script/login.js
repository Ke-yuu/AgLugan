document.addEventListener('DOMContentLoaded', function () {
    // Login form handling
    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const errorMessage = document.getElementById('error-message');

        fetch('../php/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.redirectUrl;
            } else {
                errorMessage.textContent = data.message;
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
    });

    // Modal Handling
    const modal = document.getElementById("forgotPasswordModal");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const closeModal = document.getElementsByClassName("close")[0];

    // Open the modal when the forgot password link is clicked
    forgotPasswordLink.onclick = function (event) {
        event.preventDefault();
        modal.style.display = "block";
    };

    // Close the modal when the "X" is clicked
    closeModal.onclick = function () {
        modal.style.display = "none";
    };

    // Close the modal when clicking anywhere outside of it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Forgot Password form handling
    document.getElementById('forgotPasswordForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;

        fetch('../php/forgot_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (data.status === 'success') {
                    document.getElementById('forgotPasswordMessage').innerText = data.message;
                    document.getElementById('forgotPasswordMessage').style.color = 'green';
                } else {
                    document.getElementById('forgotPasswordMessage').innerText = data.message;
                    document.getElementById('forgotPasswordMessage').style.color = '#ff6666';
                }
            } catch (e) {
                console.error('Unexpected response format:', text);
                document.getElementById('forgotPasswordMessage').innerText = 'An unexpected error occurred. Please try again later.';
                document.getElementById('forgotPasswordMessage').style.color = '#ff6666';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('forgotPasswordMessage').innerText = 'An error occurred. Please try again.';
            document.getElementById('forgotPasswordMessage').style.color = '#ff6666';
        });
    });

    // Password field show/hide handling
    const togglePasswordIcon = document.querySelector('#togglePassword');
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
});
