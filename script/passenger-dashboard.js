// Placeholder passenger data
const passenger = {
  name: 'Juan Dela Cruz',
  email: 'juan.delacruz@example.com'
};

// Placeholder ride data
const availableRides = [
  { time: "7:00 AM", route: "Bakakeng to City", seats: 5, jeepneyNumber: "JPN-001" },
  { time: "9:00 AM", route: "City to Bakakeng", seats: 3, jeepneyNumber: "JPN-002" },
  { time: "11:00 AM", route: "Bakakeng to City", seats: 0, jeepneyNumber: "JPN-003" },
];

// Display Passenger Info
document.getElementById('passenger-name').innerText = passenger.name;
document.getElementById('passenger-email').innerText = passenger.email;

// Display Available Rides
const rideList = document.getElementById('ride-list');
availableRides.forEach(ride => {
  const listItem = document.createElement('li');

  // Create a div for the banner
  const banner = document.createElement('div');
  banner.classList.add('ride-banner');

  if (ride.seats === 0) {
    listItem.classList.add('full-seats');
    banner.classList.add('banner-full');
    banner.innerText = 'Full';
  } else if (ride.seats <= 3) {
    listItem.classList.add('few-seats');
    banner.classList.add('banner-few');
    banner.innerText = 'Few Seats Left';
  } else {
    listItem.classList.add('available-seats');
    banner.classList.add('banner-available');
    banner.innerText = 'Available';
  }

  listItem.innerHTML = `
    <div class="ride-info">${ride.route} - ${ride.time}</div>
    <div>Seats Available: ${ride.seats}</div>
    <div>Jeepney Number: ${ride.jeepneyNumber}</div>
  `;
  
  listItem.appendChild(banner); // Add the banner to the list item
  rideList.appendChild(listItem);
});


// Queue System
let queuePosition = null;
const joinQueueBtn = document.getElementById('join-queue-btn');
const queuePositionDisplay = document.getElementById('queue-position');
const waitTimeDisplay = document.getElementById('wait-time');

joinQueueBtn.addEventListener('click', function() {
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
logoutBtn.addEventListener('click', function() {
  alert('You have been logged out.');
  window.location.href = 'login.html'; // Redirect to login page
});
