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

      // Display Available Rides
      const availableRidesList = document.getElementById('rides-list');
      if (availableRidesList) {
        availableRidesList.innerHTML = '';
        if (data.rides && data.rides.length > 0) {
          data.rides.forEach(ride => {
            const listItem = document.createElement('li');
            listItem.classList.add('available-ride-item');
            listItem.innerHTML = `
              Ride ID: ${ride.ride_id} | From: ${ride.start_location} | To: ${ride.end_location} | Time: ${ride.time_range}
            `;
            listItem.addEventListener('click', function () {
              window.location.href = '../html/schedule.html';
            });
            availableRidesList.appendChild(listItem);
          });
        } else {
          availableRidesList.innerHTML = '<li>No available rides found.</li>';
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
});
