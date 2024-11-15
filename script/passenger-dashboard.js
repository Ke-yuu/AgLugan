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
      console.log('Passenger Dashboard Data:', data);

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

        if (ride && ride.status) {
          const status = ride.status.toLowerCase();

          // Display only rides that are "loading"
          if (status === 'loading') {
            ridesAvailable = true;

            const listItem = document.createElement('li');
            listItem.classList.add('available-ride-item');
            listItem.dataset.rideId = ride.ride_id;  
            listItem.dataset.startLocation = ride.start_location;
            listItem.dataset.endLocation = ride.end_location;
            listItem.dataset.timeRange = ride.time_range;

            // Add tooltip using the title attribute
            listItem.title = 'Click to view Route';

            // Create ride details (excluding ride ID)
            const rideDetails = `
            <div style="padding: 15px; border-radius: 10px; background: #2e2e2e; box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5), -4px -4px 10px rgba(60, 60, 60, 0.2); color: #f8f8f8;">
              <p style="margin: 0; font-size: 1.1rem; font-weight: bold; color: #ff9100;">Destiation:</p>
              <p style="margin: 0; font-size: 1rem;">${ride.start_location} - ${ride.end_location}</p>

              <p style="margin: 0; font-size: 1.1rem; font-weight: bold; color: #ff9100;">Ride Schedule:</p>
              <p style="margin: 0; font-size: 1rem;">${ride.time_range}</p>
          
              <p style="margin: 0; font-size: 1.1rem; font-weight: bold; color: #ff9100;">Status:</p>
              <p style="margin: 0; font-size: 1rem; color: ${getStatusColor(status)}; font-weight: bold;">${ride.status}</p>
          
              <p style="margin: 0; font-size: 1.1rem; font-weight: bold; color: #ff9100;">Waiting Time:</p>
              <p style="margin: 0; font-size: 1rem;">${ride.waiting_time ? ride.waiting_time.split(".")[0] : "N/A"}</p>
            </div>
          `;
          
          listItem.innerHTML = rideDetails;

            // Attach event listener to open route modal when clicking on the ride item
            listItem.addEventListener('click', function () {
              openRouteModal(ride);
            });

            availableRidesList.appendChild(listItem);
          }
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

// Helper function to get status color based on ride status
function getStatusColor(status) {
  switch (status) {
    case 'loading':
      return '#28a745'; 
    case 'inactive':
      return 'red'; 
    default:
      return '#f8f8f8'; 
  }
}

// Function to display payment history
function displayPaymentHistory(data) {
  const paymentHistory = document.getElementById('ride-history');
  if (paymentHistory) {
    paymentHistory.innerHTML = '';

    if (data.payments && Array.isArray(data.payments) && data.payments.length > 0) {
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
    };
  }

  if (closeModalBtn) {
    closeModalBtn.onclick = function () {
      profileModal.style.display = "none";
    };
  }

  window.onclick = function (event) {
    if (event.target == profileModal) {
      profileModal.style.display = "none";
    }
  };
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
            if (name) {
              document.getElementById('passenger-name').innerText = name;
            }
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

      if (!currentPassword || !newPassword || !confirmPassword) {
        alert('All fields are required.');
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
            passwordForm.reset();
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
  }, 10000);
}

// Function to open route modal and display map for the ride
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
  routeModalContent.innerHTML = `
    <span class="close-btn" id="closeRouteModalBtn">&times;</span>
    <div id="map-container" style="height: 400px; margin-top: 10px;"></div>
    <button class="book-ride-btn" id="bookRideBtn">Book This Ride</button>
  `;

  // Hardcoded Coordinates for each location
  const locations = {
    "Holy Family Parish Church": [16.390942368673546, 120.59054011271213],
    "SLU Mary Heights": [16.385441539448166, 120.593292997368],
    "Igorot Garden": [16.413197650072124, 120.59454902620435]
  };

  // Get the coordinates for the start and end locations
  const startCoordinates = locations[ride.start_location];
  const endCoordinates = locations[ride.end_location];

  if (!startCoordinates || !endCoordinates) {
    console.error('Invalid start or end location for the ride');
    return;
  }

  // Initialize map using Leaflet
  const map = L.map('map-container').setView(startCoordinates, 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  // Add routing between the start and end locations using Leaflet Routing Machine
  L.Routing.control({
    waypoints: [
      L.latLng(startCoordinates[0], startCoordinates[1]),
      L.latLng(endCoordinates[0], endCoordinates[1])
    ],
    lineOptions: {
      styles: [{ color: 'blue', opacity: 0.6, weight: 4 }]
    },
    draggableWaypoints: false,
    addWaypoints: false,
    createMarker: function (i, waypoint, n) {
      // Create custom markers for start and end locations
      const markerText = i === 0 ? `Start Location: ${ride.start_location}` : `End Location: ${ride.end_location}`;
      return L.marker(waypoint.latLng).bindPopup(markerText);
    }
  }).addTo(map);

  // Close button handling
  const closeButton = document.getElementById('closeRouteModalBtn');
  if (closeButton) {
    closeButton.onclick = function () {
      modal.style.display = 'none';
    };
  } else {
    console.error('Close button not found in the DOM');
  }

// Attach book ride button handling
const bookRideBtn = document.getElementById('bookRideBtn');
if (bookRideBtn) {
  bookRideBtn.onclick = function () {
    const rideId = ride.ride_id; 
    if (rideId) {
      window.location.href = `../html/schedule.html?ride_id=${rideId}`;
    } else {
      console.error("Ride ID is not available");
    }
  };
} else {
  console.error('Book Ride button not found in the DOM');
}

  // Close the modal when clicking outside of the modal content
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}



