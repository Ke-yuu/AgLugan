// Get the token from the URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
document.getElementById('token').value = token;

// Handle reset password form submission
document.getElementById('resetPasswordForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;

    fetch('../php/reset_password.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token, newPassword: newPassword })
    })
    .then(response => response.json())
    .then(data => {
        const messageElement = document.getElementById('message');
        if (data.status === 'success') {
            messageElement.style.color = 'green';
        } else {
            messageElement.style.color = '#ff6666';
        }
        messageElement.innerText = data.message;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').innerText = 'An error occurred. Please try again.';
    });
});
