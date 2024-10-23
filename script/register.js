document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const phone_number = document.getElementById('phone_number').value;
        const user_type = document.getElementById('user_type').value;  // 'passenger'

        // Prepare form data for submission
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone_number', phone_number);
        formData.append('user_type', user_type);  // This will always be "passenger"

        // Send form data to PHP script using fetch API
        fetch('../php/register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Registration failed');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                alert('Registration successful!');
                // Redirect to passenger dashboard
                window.location.href = '../html/passenger-dashboard.html';
            } else {
                alert("Registration failed: " + data.message);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert(error.message);
        });
    });
});
