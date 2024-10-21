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
  listItem.innerHTML = `${ride.route} - ${ride.time} - Seats: ${ride.seats} - Jeepney #${ride.jeepneyNumber}`;
  if (ride.seats === 0) {
      listItem.style.backgroundColor = "#f8d7da";  // Red for no seats
  } else if (ride.seats <= 3) {
      listItem.style.backgroundColor = "#fff3cd";  // Yellow for few seats
  }
  rideList.appendChild(listItem);
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