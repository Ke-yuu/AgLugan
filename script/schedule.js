document.addEventListener("DOMContentLoaded", function () {
    showAllRides();
  
    const modal = document.getElementById("filter-modal");
    const filterButton = document.getElementById("filter-button");
    const closeButton = document.getElementsByClassName("close-button")[0];
  
    filterButton.onclick = function () {
        modal.style.display = "block";
    };
  
    closeButton.onclick = function () {
        modal.style.display = "none";
    };
  
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
  
    function showAllRides() {
        filterRides();
    }
  
    // Function to close the modal
    function closeModal() {
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
                const ridesList = document.getElementById("rides-list");
  
                // Clear previous results
                ridesList.innerHTML = "";
  
                if (data.error) {
                    const errorElement = `<li>${data.error}</li>`;
                    ridesList.innerHTML = errorElement;
                    return;
                }
  
                data.forEach(ride => {
                    let rideElement = document.createElement('li');
                    rideElement.classList.add('ride-item');
  
                    // Format the waiting time to remove milliseconds
                    let formattedWaitingTime = ride.waiting_time.split(".")[0];
  
                    // Create a div for ride details
                    let rideDetails = document.createElement('div');
                    rideDetails.classList.add('ride-details');
                    rideDetails.innerHTML =
                        `<span class="ride-id">Ride ID: ${ride.ride_id}</span>
                        <span class="driver-id">Driver ID: ${ride.driver_id || 'N/A'}</span>
                        <span class="status">Status: ${ride.status}</span>
                        <span class="waiting-time">Waiting Time: ${formattedWaitingTime}</span>
                        <span class="time_range">Schedule Time: ${ride.time_range || 'N/A'}</span>`;
  
                    // Apply color based on status
                    const statusElement = rideDetails.querySelector('.status');
                    if (ride.status === "Available") {
                        statusElement.style.color = "#28a745";
                    } else if (ride.status === "Inactive") {
                        statusElement.style.color = "red";
                    } else if (ride.status === "Upcoming") {
                        statusElement.style.color = "gold";
                    }
  
                    // Create the payment button
                    let paymentButton = document.createElement('button');
                    paymentButton.innerText = 'Book Ride';
                    paymentButton.classList.add('payment-button');
                    paymentButton.onclick = function () {
                        window.location.href = `../html/paymentPage.html?ride_id=${ride.ride_id}`;
                    };
  
                    // Append the ride details and payment button to the ride item
                    rideElement.appendChild(rideDetails);
                    rideElement.appendChild(paymentButton);
  
                    // Append the ride element to the rides list
                    ridesList.appendChild(rideElement);
                });
  
                // Close the modal after applying filters
                closeModal();
            })
            .catch(error => {
                console.error('Error fetching rides:', error);
            });
    }
  });
  