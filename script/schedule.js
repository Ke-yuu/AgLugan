function showRides() {
  const route = document.getElementById("route").value;
  const ridesList = document.getElementById("rides-list");
  ridesList.innerHTML = "";

  // Fetch the ride data from the PHP script
  fetch(`../fetch_rides.php?route=${route}`)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        ridesList.innerHTML = "<li>No available rides.</li>";
        return;
      }

  availableRides.forEach((ride) => {
    const rideItem = document.createElement("li");
    
    const rideDetails = `
  <div class="ride-details">
    <div class="ride-info">
      <span class="label">Jeepney Number:</span> ${ride.jeepneyNumber}
    </div>
    <div class="ride-info">
      <span class="label">Time:</span> ${ride.time}
    </div>
    <div class="ride-info">
      <span class="label">Seats Available:</span> ${ride.seats}
    </div>
    <div class="ride-info">
      <span class="label">Wait Time:</span> ${ride.waitTime}
    </div>
    <button class="book-button" ${ride.seats === 0 ? 'disabled' : ''}>
      ${ride.seats > 0 ? 'Book Now' : 'Full'}
    </button>
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
    })
    .catch(error => {
      console.error('Error fetching rides:', error);
      ridesList.innerHTML = "<li>Error fetching available rides.</li>";
    });
}
