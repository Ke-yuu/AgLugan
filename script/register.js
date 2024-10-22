document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get form values
        const name = document.getElementById('name').value; // Make sure this matches the HTML
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const phone_number = document.getElementById('phone_number').value; // Added phone number
        const user_type = document.getElementById('user_type').value; // This captures the selected value


        // Debugging: Log values to console
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Phone Number:', phone_number); // Log phone number
        console.log('User Type:', user_type);

        // Prepare form data for submission
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone_number', phone_number); // Append phone number
        formData.append('user_type', user_type);

        // Send form data to PHP script using fetch API
        fetch('../php/register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                alert('Registration successful!');
                // Redirect based on role...
            } else {
                alert("Registration failed: " + data.message);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });
});
