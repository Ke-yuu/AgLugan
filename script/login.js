document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting normally

    const formData = new FormData(this);
    const errorMessage = document.getElementById('error-message');

    fetch('../php/login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Redirect to the appropriate dashboard based on user type
            window.location.href = data.redirectUrl;
        } else {
            // Display the error message
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
