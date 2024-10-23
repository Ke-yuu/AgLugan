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
      rideList.innerHTML = ''; // Clear any existing ride information before adding new ones

      // Loop through the available rides and display them
      data.rides.forEach(ride => {
        const listItem = document.createElement('li');
        const banner = document.createElement('div');
        banner.classList.add('ride-banner');

        if (ride.status === 'full') {
          listItem.classList.add('full-seats');
          banner.classList.add('banner-full');
          banner.innerText = 'Full';
        } else if (ride.status === 'waiting') {
          listItem.classList.add('few-seats');
          banner.classList.add('banner-few');
          banner.innerText = 'Few Seats Left';
        } else {
          listItem.classList.add('available-seats');
          banner.classList.add('banner-available');
          banner.innerText = 'Available';
        }

        listItem.innerHTML = `
          <div class="ride-info">
            Route: ${ride.start_location} to ${ride.end_location}
          </div>
          <div>Fare: ₱${ride.fare}</div>
          <div>Waiting Time: ${ride.waiting_time} mins</div>
        `;

        listItem.appendChild(banner);
        rideList.appendChild(listItem);
      });

      // Display Payment History
      const paymentHistory = document.getElementById('ride-history');
      paymentHistory.innerHTML = ''; // Clear existing content

      // Loop through the payment history and display it, including the ride_id
      data.payments.forEach(payment => {
        const listItem = document.createElement('li');
        listItem.classList.add('ride-history-item');
        listItem.innerHTML = `
          Ride ID: ${payment.ride_id} - Amount: ₱${payment.amount} - Payment Method: ${payment.payment_method} - Status: ${payment.status}
        `;
        paymentHistory.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please try again later.');
    });

  // Queue System
  let queuePosition = null;
  const joinQueueBtn = document.getElementById('join-queue-btn');
  const queuePositionDisplay = document.getElementById('queue-position');
  const waitTimeDisplay = document.getElementById('wait-time');

  joinQueueBtn.addEventListener('click', function () {
    if (!queuePosition) {
      queuePosition = Math.floor(Math.random() * 10) + 1; // Random queue position between 1 and 10
      const estimatedWaitTime = `${queuePosition * 5} mins`; // Estimate wait time (5 mins per position)
      queuePositionDisplay.innerText = queuePosition;
      waitTimeDisplay.innerText = estimatedWaitTime;

      joinQueueBtn.disabled = true;
      joinQueueBtn.classList.add('disabled-btn');
      joinQueueBtn.innerText = "Joined Queue";
    }
  });

  // Logout Functionality
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', function () {
    alert('You have been logged out.');
    window.location.href = '../index.html'; // Redirect to login page
  });
});
// JavaScript to handle modal behavior
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeModalBtn = document.getElementById('closeModalBtn');

profileBtn.addEventListener('click', () => {
    profileModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => {
    profileModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == profileModal) {
        profileModal.style.display = 'none';
    }
});
