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
  if (document.getElementById('profileForm')) {
    handleProfileUpdate();
  }

  // Handle form submission for changing password
  if (document.getElementById('changePasswordForm')) {
    handlePasswordUpdate();
  }

  // Setup modal close button
  setupDetailsModalClose();
});

// Check session status
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

      // Call function to display available rides
      displayAvailableRidesList(data);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
    });
}

// Display payment history
function displayPaymentHistory(payments) {
  const paymentHistoryTableBody = document.querySelector('#payment-history-table tbody');

  paymentHistoryTableBody.innerHTML = ''; // Clear existing rows

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
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="6" class="no-payment">No payment history found.</td>`;
    paymentHistoryTableBody.appendChild(row);
  }
}

// Display passenger information
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

// Display available rides
function displayAvailableRidesList(data) {
  const ridesList = document.getElementById('rides-list');

  ridesList.innerHTML = ''; // Clear existing rides list

  if (data.rides && data.rides.length > 0) {
    // Filter rides to only include those with status "In Queue"
    const availableRides = data.rides.filter((ride) => ride.status === 'In Queue');

    if (availableRides.length > 0) {
      availableRides.forEach((ride) => {
        const listItem = document.createElement('li');
        listItem.classList.add('ride-item', 'available-ride-item');

        // Add an event listener to open the modal when the card is clicked
        listItem.addEventListener('click', () => {
          showRouteModal(ride); 
        });

        // Populate the list item with ride data and icon
        listItem.innerHTML = `
          <div class="ride-info">
            <i class="fas fa-route" style="margin-right: 15px; color: #ff0000;"></i>
            <div>
              <div class="ride-info-header">${ride.start_location} - ${ride.end_location}</div>
              <div class="ride-details">
                <div><strong>Schedule:</strong> ${ride.time_range}</div>
                <div><strong>Status:</strong> <span class="ride-status">${ride.status}</span></div>
              </div>
            </div>
          </div>
        `;
        ridesList.appendChild(listItem);
      });
    } else {
      const noDataItem = document.createElement('li');
      noDataItem.classList.add('no-ride-item');
      noDataItem.innerHTML = `<p>No available rides at the current time.</p>`;
      ridesList.appendChild(noDataItem);
    }
  } else {
    const noDataItem = document.createElement('li');
    noDataItem.classList.add('no-ride-item');
    noDataItem.innerHTML = `<p>No rides available at the moment.</p>`;
    ridesList.appendChild(noDataItem);
  }
}

// Show ride details modal
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

// Close details modal
function setupDetailsModalClose() {
  const closeModalButton = document.getElementById('closeDetailsModal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
      document.getElementById('detailsModal').style.display = 'none';
    });
  }
}

// Profile modal setup with all handlers
function setupProfileModal() {
  const profileModal = document.getElementById('profileModal');
  const profileBtn = document.getElementById('profileBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const profilePictureInput = document.getElementById('profile-picture-input');
  const currentProfilePicture = document.getElementById('current-profile-picture');

  // Setup password visibility toggles
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const inputId = this.getAttribute('data-for');
      const input = document.getElementById(inputId);
      if (input.type === 'password') {
        input.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
      }
    });
  });

  // Profile picture change handler
  if (profilePictureInput) {
    profilePictureInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          currentProfilePicture.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

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

  window.addEventListener('click', (event) => {
    if (event.target === profileModal) {
      profileModal.style.display = 'none';
    }
  });
}

// Profile update handler
function handleProfileUpdate() {
  const profileForm = document.getElementById('profileForm');
  const profilePictureInput = document.getElementById('profile-picture-input');

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('passenger-name-input').value.trim());
    formData.append('email', document.getElementById('passenger-email-input').value.trim());

    if (profilePictureInput.files[0]) {
      formData.append('profile_picture', profilePictureInput.files[0]);
    }

    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('Profile updated successfully');
        document.getElementById('profileModal').style.display = 'none';
        // Update profile picture in the dashboard if it was changed
        if (data.profile_picture_url) {
          document.getElementById('current-profile-picture').src = 
            data.profile_picture_url + '?t=' + new Date().getTime();
        }
        location.reload();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile');
    }
  });
}

// Password update handler
function handlePasswordUpdate() {
  const passwordForm = document.getElementById('changePasswordForm');

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('Password changed successfully');
        passwordForm.reset();
        document.getElementById('profileModal').style.display = 'none';
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred while changing the password');
    }
  });
}

// Logout setup
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('/api/logout', { method: 'POST' })
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

const locations = {
  "SLU Mary Heights": [16.385431230475408, 120.59332518930958],
  "Holy Family Parish Church": [16.390849719238346, 120.59038991417202],
  "Igorot Garden": [16.413115332778087, 120.5944202827095],
};

let currentMap = null;
let currentRoutingControl = null;

function showRouteModal(route) {
    const routeModal = document.getElementById('routeModal');
    const rideIdDisplay = document.getElementById('rideIdDisplay');
    const startLocationDisplay = document.getElementById('startLocationDisplay');
    const endLocationDisplay = document.getElementById('endLocationDisplay');
    const mapContainer = document.getElementById('mapContainer');
    const closeBtn = document.getElementById('closeRouteModalBtn');

    // Cleanup function
    function cleanupMap() {
        if (currentRoutingControl) {
            currentMap.removeControl(currentRoutingControl);
            currentRoutingControl = null;
        }
        if (currentMap) {
            currentMap.remove();
            currentMap = null;
        }
        if (mapContainer) {
            mapContainer.innerHTML = '';
        }
    }

    // Clean up existing map
    cleanupMap();

    // Setup modal controls
    closeBtn.onclick = function() {
        routeModal.style.display = 'none';
        cleanupMap();
    }

    closeBtn.onclick = function() {
      routeModal.style.display = 'none';
      cleanupMap();
  };

    window.onclick = function(event) {
        if (event.target == routeModal) {
            routeModal.style.display = 'none';
            cleanupMap();
        }
    }
    const startCoords = locations[route.start_location];
    const endCoords = locations[route.end_location];

    if (startCoords && endCoords) {
        rideIdDisplay.textContent = route.ride_id || 'N/A';
        startLocationDisplay.textContent = route.start_location || 'N/A';
        endLocationDisplay.textContent = route.end_location || 'N/A';

        // Show modal first
        routeModal.style.display = 'block';

        // Small delay to ensure container is visible
        setTimeout(() => {
            try {
                // Initialize new map
                currentMap = L.map(mapContainer);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(currentMap);

                currentRoutingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(startCoords[0], startCoords[1]),
                        L.latLng(endCoords[0], endCoords[1])
                    ],
                    routeWhileDragging: false,
                    addWaypoints: false,
                    draggableWaypoints: false,
                    fitSelectedRoutes: true,
                    showAlternatives: false,
                    lineOptions: {
                        styles: [
                            {color: 'red', opacity: 0.8, weight: 4}
                        ]
                    },
                    createMarker: function(i, waypoint, n) {
                        const marker = L.marker(waypoint.latLng);
                        marker.bindPopup(i === 0 ? 'Start: ' + route.start_location : 'End: ' + route.end_location);
                        return marker;
                    }
                }).addTo(currentMap);

                currentRoutingControl.on('routesfound', function(e) {
                    const container = document.querySelector('.leaflet-routing-container');
                    if (container) {
                        container.style.display = 'none';
                    }
                    currentMap.fitBounds(L.latLngBounds(startCoords, endCoords), {
                        padding: [50, 50]
                    });
                });
            } catch (error) {
                console.error('Error initializing map:', error);
                cleanupMap();
            }
        }, 100);

    } else {
    
      console.error('Coordinates not found for the given route.');
    }
}


// Poll payment status every 30 seconds
setInterval(() => {
  fetch('/api/passenger-dashboard')
    .then(response => response.json())
    .then(data => {
      if (data.payments) {
        displayPaymentHistory(data.payments);
      }
    })
    .catch(error => console.error('Error polling payment status:', error));
}, 30000);

