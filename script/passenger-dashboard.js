document.addEventListener('DOMContentLoaded', function () {
  // Fetch user and available rides data from the server
  fetch('../php/passenger-dashboard.php')
      .then(response => response.json())
      .then(data => {
          if (data.status === 'error') {
              alert(data.message);
              return;
          }

          // Display Passenger Info
          document.getElementById('passenger-name').innerText = data.user.name;
          document.getElementById('passenger-email').innerText = data.user.email;

          // Display Available Rides
          const rideList = document.getElementById('ride-list');
          rideList.innerHTML = '';  // Clear the existing list

          data.rides.forEach(ride => {
              const listItem = document.createElement('li');
              listItem.innerHTML = `${ride.start_location} to ${ride.end_location} - Status: ${ride.status} - Fare: ${ride.fare} PHP - Waiting Time: ${ride.waiting_time}`;
              rideList.appendChild(listItem);
          });
      })
      .catch(error => console.error('Error fetching data:', error));
});


// Queue System
let queuePosition = null;
const joinQueueBtn = document.getElementById('join-queue-btn');
const queuePositionDisplay = document.getElementById('queue-position');
const waitTimeDisplay = document.getElementById('wait-time');

joinQueueBtn.addEventListener('click', function() {
  if (!queuePosition) {
      queuePosition = Math.floor(Math.random() * 10) + 1; // Random queue position
      const estimatedWaitTime = `${queuePosition * 5} mins`; // Estimate wait time
      queuePositionDisplay.innerText = queuePosition;
      waitTimeDisplay.innerText = estimatedWaitTime;
      joinQueueBtn.disabled = true;
      joinQueueBtn.innerText = "Joined Queue";
  }
});

// Logout Functionality
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', function() {
  alert('You have been logged out.');
  window.location.href = 'login.html'; // Redirect to login page
});