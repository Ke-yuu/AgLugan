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

      data.forEach((ride) => {
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
            <span>Wait Time:</span> ${ride.waiting_time}
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
