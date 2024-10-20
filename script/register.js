// Handle form submission
document.getElementById('registrationForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the form from submitting the usual way

  // Get form values
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  // Simulate role-based redirection
  if (role === 'admin') {
      window.location.href = 'admin-dashboard.html';
  } else if (role === 'passenger') {
      window.location.href = 'passenger-dashboard.html';
  } else if (role === 'driver') {
      window.location.href = 'driver-dashboard.html';
  }
});
