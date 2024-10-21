const rides = {
  "bakakeng-to-city": [
    { time: "7:00 AM", seats: 5, waitTime: "10 mins", jeepneyNumber: "JPN-001" },
    { time: "8:30 AM", seats: 3, waitTime: "15 mins", jeepneyNumber: "JPN-002" },
    { time: "10:00 AM", seats: 0, waitTime: "30 mins", jeepneyNumber: "JPN-003" },
    { time: "12:00 PM", seats: 8, waitTime: "5 mins", jeepneyNumber: "JPN-004" },
  ],
  "city-to-bakakeng": [
    { time: "7:30 AM", seats: 4, waitTime: "8 mins", jeepneyNumber: "JPN-005" },
    { time: "9:00 AM", seats: 1, waitTime: "20 mins", jeepneyNumber: "JPN-006" },
    { time: "11:00 AM", seats: 0, waitTime: "35 mins", jeepneyNumber: "JPN-007" },
    { time: "1:00 PM", seats: 6, waitTime: "7 mins", jeepneyNumber: "JPN-008" },
  ],
};


function showRides() {
  const route = document.getElementById("route").value;
  const ridesList = document.getElementById("rides-list");
  ridesList.innerHTML = "";

  const availableRides = rides[route];

  if (availableRides.length === 0) {
    ridesList.innerHTML = "<li>No available rides.</li>";
    return;
  }

  availableRides.forEach((ride) => {
    const rideItem = document.createElement("li");
    
    const rideDetails = `
      <div>
        <span>Jeepney Number:</span> ${ride.jeepneyNumber}
      </div>
      <div>
        <span>Time:</span> ${ride.time}
      </div>
      <div>
        <span>Seats Available:</span> ${ride.seats}
      </div>
      <div>
        <span>Wait Time:</span> ${ride.waitTime}
      </div>
    `;

    rideItem.innerHTML = rideDetails;

    // Color-coding based on seat availability
    if (ride.seats === 0) {
      rideItem.style.backgroundColor = "#f8d7da";  // Red
    } else if (ride.seats <= 3) {
      rideItem.style.backgroundColor = "#fff3cd";  // Yellow
    } else {
      rideItem.style.backgroundColor = "#d4edda";  // Green
    }

    ridesList.appendChild(rideItem);
  });
}

function userExists() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const users = [
      { username: 'admin', password: '123' },
      { username: 'user2', password: 'password2' },
  ];

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
      
      window.location.href = 'landingPage.html'; 
  } else {
      
      document.getElementById('message').innerText = 'Invalid username or password!';
  }
}

