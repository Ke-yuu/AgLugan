document.addEventListener('DOMContentLoaded', function () {
  // Disable browser cache for back button
  window.onload = function () {
    if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
      // Force the page to reload if the user navigates back
      window.location.reload();
    }
  };

  // Check session status on page load
  fetch('../php/check_session.php')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'logged_out') {
        // If not logged in, redirect to the login page
        window.location.href = '../html/login.html';
      }
    })
    .catch(error => {
      console.error('Error checking session:', error);
    });

  // Fetch passenger dashboard data
  fetch('../php/passenger-dashboard.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text(); // Get the response as text first
    })
    .then(text => {
      if (!text) {
        throw new Error('Empty response from server');
      }
      try {
        const data = JSON.parse(text); // Try parsing the text to JSON
        if (data.status === 'error') {
          alert(data.message);
          return;
        }

        // Display Passenger Info
        const passengerNameElement = document.getElementById('passenger-name');
        if (passengerNameElement && data.user) {
          passengerNameElement.innerText = data.user.name;
        }

        // Display Booked Rides with Schedule
        const bookedRidesList = document.getElementById('ride-booked');
        if (bookedRidesList) {
          bookedRidesList.innerHTML = ''; // Clear any existing content
          if (data.rides && data.rides.length > 0) {
            data.rides.forEach(ride => {
              console.log("Ride Data:", ride);
              const listItem = document.createElement('li');
              listItem.classList.add('booked-ride-item');
              listItem.innerHTML = `Ride ID: ${ride.ride_id} | From: ${ride.start_location} | To: ${ride.end_location}`;
              bookedRidesList.appendChild(listItem);
            });
          } else {
            console.log("No rides found for the user.");
            bookedRidesList.innerHTML = '<li>No booked rides found.</li>';
          }
        }

        // Display Payment History
        const paymentHistory = document.getElementById('ride-history');
        if (paymentHistory) {
          paymentHistory.innerHTML = ''; // Clear existing content

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
      } catch (error) {
        console.error('Error parsing JSON:', error);
        console.error('Received text:', text); // Log the raw response for debugging
        alert('Failed to load dashboard data. Please try again later.');
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
});
