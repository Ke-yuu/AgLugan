function showRides() {
  console.log("Fetching rides");

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

      // Display each ride in the list with a button for payment
      data.forEach(ride => {
        let rideElement = document.createElement('li');
        rideElement.classList.add('ride-item'); // Add a class for styling

        // Create a div for ride details
        let rideDetails = document.createElement('div');
        rideDetails.classList.add('ride-details');

        rideDetails.innerHTML = `
          <span class="ride-id">Ride ID: ${ride.ride_id}</span>
          <span class="driver-id">Driver ID: ${ride.driver_id || 'N/A'}</span>
          <span class="status">Status: ${ride.status}</span>
          <span class="waiting-time">Waiting Time: ${ride.waiting_time}</span>
        `;

        // Create the payment button
        let paymentButton = document.createElement('button');
        paymentButton.innerText = 'Go to Payment';
        paymentButton.classList.add('payment-button');
        paymentButton.onclick = function() {
          window.location.href = `../html/paymentPage.html?ride_id=${ride.ride_id}`; // Redirect to payment page with ride_id
        };

        // Append the ride details and payment button to the ride item
        rideElement.appendChild(rideDetails);
        rideElement.appendChild(paymentButton);

        // Append the ride element to the rides list
        ridesList.appendChild(rideElement);
      });
    })
    .catch(error => {
      console.error('Error fetching rides:', error);
    });
}
