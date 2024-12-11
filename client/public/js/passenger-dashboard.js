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

});

function checkSessionStatus() {
  fetch('/api/check-session')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'logged_out') {
        window.location.href = '/login';
      }
    })
    .catch(error => {
      console.error('Error checking session:', error);
    });
}

// Fetch passenger dashboard data
function fetchPassengerDashboardData() {
  // Assume an API endpoint that returns the necessary data (e.g., user info and available rides)
  fetch('/api/passenger-dashboard')
      .then(response => response.json())
      .then(data => {
          console.log('Passenger Dashboard Data:', data);

          // Store the fetched data
          passengerDashboardData = data;

          // Display passenger information
          if (data.user) {
              displayPassengerInfo(data);
          } else {
              console.error('User information is missing in the fetched data.');
          }

          // Display payment history
          if (data.payments) {
            displayPaymentHistory(data.payments);
          }          

          // Call function to display available rides in a list
          displayAvailableRidesList(passengerDashboardData);
      })
      .catch(error => {
          console.error('Error fetching dashboard data:', error);
      });
}

function displayPaymentHistory(payments) {
  const paymentHistoryTableBody = document.querySelector('#payment-history-table tbody');

  // Clear existing rows
  paymentHistoryTableBody.innerHTML = '';

  if (payments.length > 0) {
      payments.forEach(payment => {
          const row = document.createElement('tr');

          // Format payment amount and date
          const amount = parseFloat(payment.amount);
          const formattedAmount = isNaN(amount) ? 'N/A' : `₱${amount.toFixed(2)}`;
          const paymentDate = payment.payment_date
              ? new Date(payment.payment_date).toLocaleDateString()
              : 'Invalid Date';

          // Create status badge
          const statusBadge = `<span class="payment-status ${payment.status.toLowerCase()}">${payment.status}</span>`;

          // Add View Details button
          const actionButton = `<button class="action-btn" onclick="showDetailsModal(${payment.ride_id})">View Details</button>`;

          // Populate table row with payment data
          row.innerHTML = `
              <td>${payment.ride_id}</td>
              <td>${formattedAmount}</td>
              <td>${payment.payment_method}</td>
              <td>${statusBadge}</td>
              <td>${paymentDate}</td>
              <td>${actionButton}</td>
          `;

          paymentHistoryTableBody.appendChild(row);
      });
  } else {
      // Add a row indicating no payments found
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="6" class="no-payment">No payment history found.</td>`;
      paymentHistoryTableBody.appendChild(row);
  }
}

// Function to display passenger information
function displayPassengerInfo(data) {
  const passengerNameElement = document.getElementById('passenger-name');
  const currentProfilePicture = document.getElementById('current-profile-picture');

  if (passengerNameElement && data.user) {
      passengerNameElement.innerText = data.user.name || 'Unknown';
  } else {
      console.error('Passenger name or user data is missing.');
  }

  if (currentProfilePicture && data.user.profile_picture_url) {
      currentProfilePicture.src = data.user.profile_picture_url;
  } else {
      console.error('Profile picture element or URL is missing.');
  }
}

// Function to display available rides in a grid list
function displayAvailableRidesList(data) {
  const ridesList = document.getElementById('rides-list');

  // Clear any existing list content
  ridesList.innerHTML = '';

  // Loop through the available rides and create list items for each ride
  if (data.rides && data.rides.length > 0) {
      // Limit to the first 4 rides
      const firstFourRides = data.rides.slice(0, 4);

      firstFourRides.forEach(ride => {
          const listItem = document.createElement('li');
          listItem.classList.add('ride-item'); // Add a class for styling

          // Add an event listener to open the modal when the card is clicked
          listItem.addEventListener('click', () => {
              showRouteModal(ride); // Open modal with ride details
          });

          // Populate the list item with ride data
          listItem.innerHTML = `
              <div class="ride-info">
                <div class="ride-info-header">Destination:</div>
                <div class="ride-details">
                  <div><strong>From:</strong> ${ride.start_location}</div>
                  <div><strong>To:</strong> ${ride.end_location}</div>
                  <div><strong>Ride Schedule:</strong> ${ride.time_range}</div>
                  <div><strong>Status:</strong> <span class="ride-status">${ride.status}</span></div>
                  <div><strong>Waiting Time:</strong> ${ride.waiting_time}</div>
                </div>
              </div>
          `;
          ridesList.appendChild(listItem);
      });
  } else {
      const noDataItem = document.createElement('li');
      noDataItem.classList.add('no-ride-item');
      noDataItem.innerHTML = `<p>No available rides at the moment.</p>`;
      ridesList.appendChild(noDataItem);
  }
}

// Function to setup Profile Modasl interactions
function setupProfileModal() {
  const profileModal = document.getElementById('profileModal');
  const profileBtn = document.getElementById('profileBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      if (profileModal) {
        profileModal.style.display = 'block';
      }
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (profileModal) {
        profileModal.style.display = 'none';
      }
    });
  }

  // Close the modal when clicking outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target === profileModal) {
      profileModal.style.display = 'none';
    }
  });
}

// Function to handle profile update submission
function handleProfileUpdate() {
  const profileForm = document.getElementById('profileForm');
  const profilePictureInput = document.getElementById('profile-picture-input');
  const currentProfilePicture = document.getElementById('current-profile-picture');

  profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('passenger-name-input').value.trim();
      const email = document.getElementById('passenger-email-input').value.trim();
      const profilePictureFile = profilePictureInput.files[0];

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (profilePictureFile) {
          formData.append('profile_picture', profilePictureFile);
      }

      try {
          const response = await fetch('/api/update-profile', {
              method: 'POST',
              body: formData,
          });

          const data = await response.json();

          if (data.status === 'success') {
              alert('Profile updated successfully.');

              // Update profile picture if a new one is uploaded
              if (data.profile_picture_url && currentProfilePicture) {
                  currentProfilePicture.src = data.profile_picture_url + '?t=' + new Date().getTime();
              } else {
                  console.warn('Profile picture element not found.');
              }

              // Close the modal
              document.getElementById('profileModal').style.display = 'none';
              
                // Reload the page
                location.reload();

          } else {
              alert(data.message || 'Failed to update profile.');
          }
      } catch (error) {
          console.error('Error updating profile:', error);
          alert('An error occurred. Please try again.');
      }
  });
}

// Function to handle password change submission
function handleChangePassword() {
  const passwordForm = document.getElementById('changePasswordForm');
  const togglePasswordIcons = document.querySelectorAll('.toggle-password');
  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    

    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert('Password changed successfully.');
        passwordForm.reset();
        document.getElementById('profileModal').style.display = 'none';
              
        // Reload the page
        location.reload();
        window.location.href = '/login'; 
      } else {
        alert(data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred. Please try again.');
    }
  });
  togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', function () {
      const targetInputId = this.getAttribute('data-target');
      const passwordField = document.getElementById(targetInputId);
  
      if (passwordField) {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
      }
    });
  });
}

function showDetailsModal(rideId) {
  if (!rideId) {
      alert('Invalid Ride ID');
      return;
  }

  fetch(`/api/ride-details?ride_id=${rideId}`)
  .then(response => response.json())
  .then(data => {
      console.log('Ride Details Data:', data);

      if (data.status === 'success') {
          document.getElementById('modal-ride-id').textContent = data.ride.ride_id || 'N/A';
          document.getElementById('modal-route').textContent = data.ride.route || 'N/A';
          document.getElementById('modal-schedule').textContent = data.ride.schedule || 'N/A';
          document.getElementById('modal-plate-number').textContent = data.ride.plate_number || 'N/A';
          document.getElementById('modal-payment-amount').textContent = `₱${parseFloat(data.payment.amount).toFixed(2)}` || 'N/A';
          document.getElementById('modal-payment-method').textContent = data.payment.payment_method || 'N/A';
          document.getElementById('modal-payment-status').textContent = data.payment.status || 'N/A';
          document.getElementById('modal-payment-date').textContent = new Date(data.payment.payment_date).toLocaleDateString() || 'N/A';

          // Display the modal
          document.getElementById('detailsModal').style.display = 'block';
      } else {
          alert('Failed to fetch ride details.');
      }
  })
  .catch(error => {
      console.error('Error fetching ride details:', error);
      alert('An error occurred while fetching details.');
  });
}

// Close modal function
document.getElementById('closeDetailsModal').addEventListener('click', () => {
  document.getElementById('detailsModal').style.display = 'none';
});

// Close modal when clicking outside the modal content
window.addEventListener('click', event => {
  const modal = document.getElementById('detailsModal');
  if (event.target === modal) {
      modal.style.display = 'none';
  }
});

// Function to setup Logout Functionality
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      fetch('/api/logout', { 
        method: 'POST', 
      })
        .then(response => {
          if (response.ok) {
            alert('You have been logged out.');
            window.location.href = '/login'; 
          } else {
            throw new Error('Failed to log out properly.');
          }
        })
        .catch(error => {
          console.error('Error during logout:', error);
          alert('An error occurred while trying to log out. Please try again.');
        });
    });
  }
}

// Function to show the route modal when the "View Route" button is clicked
function showRouteModal(rideId) {
  console.log('Showing route for rideId:', rideId);  // Log the rideId passed

  // Find the ride object by ride_id in the passengerDashboardData
  const ride = passengerDashboardData.rides.find(r => r.ride_id === rideId);

  if (ride) {
      // Populate the modal with the ride data
      document.getElementById('routeModal').style.display = 'flex';  // Show the modal
      document.getElementById('rideIdDisplay').textContent = ride.ride_id;
      document.getElementById('startLocationDisplay').textContent = ride.start_location;
      document.getElementById('endLocationDisplay').textContent = ride.end_location;

      // Add route description if available
      if (ride.route) {
          document.getElementById('routeDescription').textContent = ride.route;
      }

      // Embed a Google map link (opens in a new tab)
      if (ride.start_location && ride.end_location) {
          const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ride.start_location)}&destination=${encodeURIComponent(ride.end_location)}`;
          document.getElementById('map').innerHTML = `<a href="${mapUrl}" target="_blank">Click here to view the route on Google Maps</a>`;
      } else {
          document.getElementById('map').innerHTML = '<p>No map available for this route.</p>';
      }
  } else {
      console.log('Ride not found for the given rideId');
  }
}

// Function to close the modal when the close button or outside the modal content is clicked
function closeModal() {
  document.getElementById('routeModal').style.display = 'none';  // Hide the modal
}

// Attach the event listener to close the modal when the close button is clicked
document.getElementById('closeModalBtn').addEventListener('click', closeModal);

// Close the modal when clicking anywhere outside the modal content
window.addEventListener('click', function(event) {
  if (event.target === document.getElementById('routeModal')) {
      closeModal();  // Close the modal if clicked outside the modal content
  }
});

// Function to poll for payment status updates
function pollPaymentStatus() {
  setInterval(() => {
      fetch('/api/passenger-dashboard')
          .then(response => response.json())
          .then(data => {
              if (data.payments) {
                  displayPaymentHistory(data.payments); 
              }
          })
          .catch(error => {
              console.error('Error polling payment status:', error);
          });
  }, 30000); // Poll every 5 seconds
}

// Start polling on page load
pollPaymentStatus();