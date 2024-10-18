// Get the login button and the login popup
const loginBtn = document.getElementById('loginBtn');
const loginPopup = document.getElementById('loginPopup');

// You can also add functionality to close the popup if necessary
window.onclick = function(event) {
    if (event.target == loginPopup) {
        loginPopup.style.display = 'none';
    }
};

document.getElementById('loginBtn').addEventListener('click', function() {
  window.location.href = "login.html";  // This will redirect to the new login page.
});

document.querySelector('.login-btn').addEventListener('click', function(event) {
  event.preventDefault();
  // You can add login validation here
  alert('Logged in successfully!');
});

document.querySelector('.register-btn').addEventListener('click', function() {
  // Redirect or open registration form
  alert('Register button clicked!');
});

