// Handle form submission
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get form values
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Create a user object to store
    const user = {
        username: username,
        email: email,
        password: password,
        role: role
    };

    // Store the user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Simulate role-based redirection
    if (role === 'admin') {
        window.location.href = '../html/admin-dashboard.html';
    } else if (role === 'passenger') {
        window.location.href = '../html/passenger-dashboard.html';
    } else if (role === 'driver') {
        window.location.href = '../html/driver-dashboard.html';
    }
});
