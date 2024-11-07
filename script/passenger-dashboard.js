document.addEventListener('DOMContentLoaded', function () {
  // Disable browser cache for back button
  window.onload = function () {
    if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
      window.location.reload();
    }
  };

  // Check session status on page load
  fetch('../php/check_session.php')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'logged_out') {
        window.location.href = '../html/login.html';
      }
    })
    .catch(error => {
      console.error('Error checking session:', error);
    });

  // Fetch passenger dashboard data
  fetch('../php/passenger-dashboard.php')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'error') {
        alert(data.message);
        return;
      }

      // Display Passenger Info
      const passengerNameElement = document.getElementById('passenger-name');
      if (passengerNameElement && data.user) {
        passengerNameElement.innerText = data.user.name;
      }

      // Display Booked Rides
      const bookedRidesList = document.getElementById('ride-booked');
      if (bookedRidesList) {
        bookedRidesList.innerHTML = '';
        if (data.rides && data.rides.length > 0) {
          data.rides.forEach(ride => {
            const listItem = document.createElement('li');
            listItem.classList.add('booked-ride-item');
            listItem.innerHTML = `Ride ID: ${ride.ride_id} | From: ${ride.start_location} | To: ${ride.end_location}`;
            bookedRidesList.appendChild(listItem);
          });
        } else {
          bookedRidesList.innerHTML = '<li>No booked rides found.</li>';
        }
      }

      // Display Payment History
      const paymentHistory = document.getElementById('ride-history');
      if (paymentHistory) {
        paymentHistory.innerHTML = '';
        if (data.payments && data.payments.length > 0) {
          data.payments.forEach(payment => {
            const listItem = document.createElement('li');
            listItem.classList.add('ride-history-item');
            listItem.innerHTML = `
              Ride ID: ${payment.ride_id} - Amount: ₱${payment.amount} - Payment Method: ${payment.payment_method} - Status: ${payment.status}
            `;
            paymentHistory.appendChild(listItem);
          });
        } else {
          paymentHistory.innerHTML = '<li>No payment history found.</li>';
        }
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please try again later.');
    });

  // Logout Functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      fetch('../php/logout.php', {
        method: 'GET'
      }).then(response => {
        if (response.ok) {
          alert('You have been logged out.');
          window.location.href = '../html/login.html';
        } else {
          throw new Error('Failed to log out properly.');
        }
      }).catch(error => {
        console.error('Error during logout:', error);
        alert('An error occurred while trying to log out. Please try again.');
      });
    });
  }

  // Handle profile modal interactions
  const profileModal = document.getElementById("profileModal");
  const profileBtn = document.getElementById("profileBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");

  if (profileBtn) {
    profileBtn.onclick = function () {
      profileModal.style.display = "block";
    }
  }

  if (closeModalBtn) {
    closeModalBtn.onclick = function () {
      profileModal.style.display = "none";
    }
  }

  window.onclick = function (event) {
    if (event.target == profileModal) {
      profileModal.style.display = "none";
    }
  }

  // Update Profile Functionality
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('passenger-name-input').value;
      const email = document.getElementById('passenger-email-input').value;

      fetch('../php/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            alert('Profile updated successfully.');
            // Update the displayed name
            document.getElementById('passenger-name').innerText = name;
            // Close the modal after successful update
            profileModal.style.display = "none";
          } else {
            alert('Error: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error updating profile:', error);
          alert('An error occurred. Please try again.');
        });
    });
  }

  // Change Password Functionality
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
      }

      fetch('../php/change_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Password changed successfully.');
            changePasswordForm.reset();
            // Close the modal after successful password change
            profileModal.style.display = "none";
          } else {
            alert('Error: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error changing password:', error);
          alert('An error occurred. Please try again.');
        });
    });
  }

  // Terms and Conditions Modal Handling
  const termsModal = document.getElementById("terms-modal");
  const btnOpenGcash = document.getElementById("open-modal");
  const btnOpenMaya = document.getElementById("open-maya-modal");
  const spanCloseTerms = document.getElementsByClassName("close")[0];

  if (btnOpenGcash) {
    btnOpenGcash.onclick = function () {
      termsModal.style.display = "block";
    };
  }

  if (btnOpenMaya) {
    btnOpenMaya.onclick = function () {
      termsModal.style.display = "block";
    };
  }

  if (spanCloseTerms) {
    spanCloseTerms.onclick = function () {
      termsModal.style.display = "none";
    };
  }

  window.onclick = function (event) {
    if (event.target == termsModal) {
      termsModal.style.display = "none";
    }
  }
});
