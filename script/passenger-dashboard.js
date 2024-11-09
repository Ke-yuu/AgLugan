document.addEventListener('DOMContentLoaded', function () {
  // Disable browser cache for back button
  window.onload = function () {
    if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
      window.location.reload();
    }
  };

  // Check session status on page load
  checkSessionStatus();

  // Fetch passenger dashboard data
  fetchPassengerDashboardData();

  // Setup Logout Functionality
  setupLogout();

  // Handle profile modal interactions
  setupProfileModal();

  // Handle form submission for updating profile
  handleProfileUpdate();

  // Handle form submission for changing password
  handleChangePassword();

  // Start polling for ride status updates
  startRideStatusPolling();
});

// Function to check session status
function checkSessionStatus() {
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
}

// Function to fetch passenger dashboard data
function fetchPassengerDashboardData() {
  fetch('../php/passenger-dashboard.php')
    .then(response => response.json())
    .then(data => {
      console.log(data); 

      if (data.status === 'error') {
        alert(data.message);
        return;
      }

      displayPassengerInfo(data);
      displayAvailableRides(data);
      displayPaymentHistory(data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please try again later.');
    });
}

// Function to display passenger information
function displayPassengerInfo(data) {
  const passengerNameElement = document.getElementById('passenger-name');
  if (passengerNameElement && data.user) {
    passengerNameElement.innerText = data.user.name;
  }
}

// Function to display Available Rides
function displayAvailableRides(data) {
  const availableRidesList = document.getElementById('rides-list');

  if (availableRidesList) {
    availableRidesList.innerHTML = '';

    if (data.rides && data.rides.length > 0) {
      let ridesAvailable = false;

      data.rides.forEach(ride => {
        console.log('Ride Object:', ride);

        if (ride && ride.status && ride.status.toLowerCase() === 'available') {
          ridesAvailable = true;
          const listItem = document.createElement('li');
          listItem.classList.add('available-ride-item');
          listItem.dataset.rideId = ride.ride_id;
          listItem.dataset.startLocation = ride.start_location;
          listItem.dataset.endLocation = ride.end_location;

          // Add tooltip using the title attribute
          listItem.title = 'Click to view Route';

          listItem.innerHTML = `
            Ride ID: ${ride.ride_id} | From: ${ride.start_location} | To: ${ride.end_location} | Time: ${ride.time_range}
          `;
          availableRidesList.appendChild(listItem);
        }
      });

      if (!ridesAvailable) {
        availableRidesList.innerHTML = '<li>No available rides found.</li>';
      }
    } else {
      availableRidesList.innerHTML = '<li>No available rides found.</li>';
    }
  }
}


// Function to display payment history
function displayPaymentHistory(data) {
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
}

// Function to setup Logout Functionality
function setupLogout() {
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
}

// Function to setup Profile Modal interactions
function setupProfileModal() {
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
}

// Function to handle profile update submission
function handleProfileUpdate() {
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('passenger-name-input').value.trim();
      const email = document.getElementById('passenger-email-input').value.trim();

      // Prepare data to send (only send changed values)
      const requestData = {};
      if (name) requestData.name = name;
      if (email) requestData.email = email;

      if (!name && !email) {
        alert('Please provide a name or email to update.');
        return;
      }

      // Validate email domain if email is provided
      if (email) {
        const allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'slu.edu.ph'];
        const emailDomain = email.split('@')[1];
        if (!allowedDomains.includes(emailDomain)) {
          alert('Only gmail.com, hotmail.com, yahoo.com, and slu.edu.ph domains are allowed.');
          return;
        }
      }

      // Send update request to server
      fetch('../php/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Profile updated successfully.');
            document.getElementById("profileModal").style.display = 'none';
            // Update the displayed name if it was changed
            if (name) {
              document.getElementById('passenger-name').innerText = name;
            }
            // Clear the input fields after saving changes
            document.getElementById('passenger-name-input').value = '';
            document.getElementById('passenger-email-input').value = '';
          } else {
            alert(data.message);
          }
        })
        .catch(error => {
          console.error('Error updating profile:', error);
          alert('An error occurred while updating the profile. Please try again.');
        });
    });
  }
}

// Function to handle password change submission
function handleChangePassword() {
  const passwordForm = document.getElementById("changePasswordForm");
  const passwordModal = document.getElementById("profileModal"); 

  if (passwordForm) {
    passwordForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const currentPassword = document.getElementById('current-password').value.trim();
      const newPassword = document.getElementById('new-password').value.trim();
      const confirmPassword = document.getElementById('confirm-password').value.trim();

      // Validate fields
      if (!currentPassword) {
        alert('Current password is required.');
        return;
      }

      if (!newPassword) {
        alert('New password is required.');
        return;
      }

      if (!confirmPassword) {
        alert('Please confirm your new password.');
        return;
      }

      if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match.');
        return;
      }

      if (currentPassword === newPassword) {
        alert('New password cannot be the same as the current password.');
        return;
      }

      // Send change password request to server
      fetch('../php/change_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Password changed successfully.');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';

            if (passwordModal) {
              passwordModal.style.display = "none";
            }
          } else {
            alert(data.message);
          }
        })
        .catch(error => {
          console.error('Error changing password:', error);
          alert('An error occurred while changing the password. Please try again.');
        });
    });
  }
}

// Function to start polling for ride status updates every 10 seconds
function startRideStatusPolling() {
  setInterval(() => {
    fetchPassengerDashboardData(); 
  }, 30000); 
}

// Function to initialize the route modal and display map for the ride
function openRouteModal(ride) {
  const modal = document.getElementById('routeModal');
  const routeModalContent = document.getElementById('routeModalContent');

  if (!modal || !routeModalContent) {
    console.error('Modal elements not found in the DOM');
    return;
  }

  // Set modal to display
  modal.style.display = 'block';

  // Clear previous map content if any
  routeModalContent.innerHTML = `<span class="close-btn" id="closeRouteModalBtn">&times;</span><div id="map-container" style="height: 300px; margin-top: 10px;"></div>`;

  // Initialize map using Leaflet (or any map library)
  const map = L.map('map-container').setView([16.4023, 120.596], 13); 
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  // Add markers for start and end location
  const startMarker = L.marker([16.4023, 120.596]).addTo(map) 
    .bindPopup(`Start: ${ride.start_location}`).openPopup();
  const endMarker = L.marker([16.406, 120.598]).addTo(map) 
    .bindPopup(`End: ${ride.end_location}`);

  // Close button handling
  const closeButton = document.getElementById('closeRouteModalBtn');
  if (closeButton) {
    closeButton.onclick = function () {
      modal.style.display = 'none';
    };
  } else {
    console.error('Close button not found in the DOM');
  }

  // Close the modal when clicking outside of the modal content
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}
