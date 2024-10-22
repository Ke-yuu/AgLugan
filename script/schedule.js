function showRides() {
  console.log("string")

  var route = document.getElementById("route").value;

  // Make a GET request to the PHP script
  fetch(`../php/getRides.php?route=${route}`)
    .then(response => response.json())
    .then(data => {
      const ridesList = document.getElementById("rides-list");
      ridesList.innerHTML = "";

      if (data.error) {
        ridesList.innerHTML = `<li>${data.error}</li>`;
        return;
      }

      // Display each ride in the list
      data.forEach(ride => {
        ridesList.innerHTML += `<li>Ride ID: ${ride.ride_id}, Driver ID: ${ride.driver_id}, Status: ${ride.status}, Waiting Time: ${ride.waiting_time}</li>`;
      });
    })
    .catch(error => {
      console.error('Error fetching rides:', error);
    });
}