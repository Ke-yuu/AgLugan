document.addEventListener("DOMContentLoaded", function () {
  showAllRides(); 

  const modal = document.getElementById("filter-modal");
  const filterButton = document.getElementById("filter-button");
  const closeButton = document.getElementsByClassName("close-button")[0];

  filterButton.onclick = function () {
      modal.style.display = "block";
  }

  closeButton.onclick = function () {
      modal.style.display = "none";
  }

  window.onclick = function (event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
});

function showAllRides() {
  filterRides(); 
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById("filter-modal");
  modal.style.display = "none";
}

function filterRides() {
  console.log("Fetching rides with filters");

  var route = document.getElementById("route-filter").value;
  var status = document.getElementById("status-filter").value;
  var time = document.getElementById("time-filter").value;

  // Make a GET request to the PHP script
  fetch(`../php/getRides.php?route=${route}&status=${status}&time=${time}`)
      .then(response => response.json())
      .then(data => {
          const upcomingRidesList = document.getElementById("upcoming-rides-list");
          const availableRidesList = document.getElementById("available-rides-list");

          // Clear previous results
          upcomingRidesList.innerHTML = "";
          availableRidesList.innerHTML = "";

          if (data.error) {
              const errorElement = `<li>${data.error}</li>`;
              upcomingRidesList.innerHTML = errorElement;
              availableRidesList.innerHTML = errorElement;
              return;
          }

          data.forEach(ride => {
              let rideElement = document.createElement('li');
              rideElement.classList.add('ride-item'); 

              // Create a div for ride details
              let rideDetails = document.createElement('div');
              rideDetails.classList.add('ride-details');
              rideDetails.innerHTML =
                  `<span class="ride-id">Ride ID: ${ride.ride_id}</span>
                  <span class="driver-id">Driver ID: ${ride.driver_id || 'N/A'}</span>
                  <span class="status">Status: ${ride.status}</span>
                  <span class="waiting-time">Waiting Time: ${ride.waiting_time}</span>`;

              // Create the payment button
              let paymentButton = document.createElement('button');
              paymentButton.innerText = 'Go to Payment';
              paymentButton.classList.add('payment-button');
              paymentButton.onclick = function () {
                  window.location.href = `../html/paymentPage.html?ride_id=${ride.ride_id}`; 
              };

              // Append the ride details and payment button to the ride item
              rideElement.appendChild(rideDetails);
              rideElement.appendChild(paymentButton);

              // Append the ride element to the appropriate list based on ride status
              if (ride.status === 'upcoming') {
                  upcomingRidesList.appendChild(rideElement);
              } else if (ride.status === 'available') {
                  availableRidesList.appendChild(rideElement);
              }
          });

          // Close the modal after applying filters
          closeModal();
      })
      .catch(error => {
          console.error('Error fetching rides:', error);
      });
}
