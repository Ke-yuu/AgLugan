document.addEventListener("DOMContentLoaded", function () {
    showAllRides();

    const modal = document.getElementById("filter-modal");
    const filterButton = document.getElementById("filter-button");
    const closeButton = document.getElementsByClassName("close-button")[0];
    const applyFilterButton = document.getElementById('apply-filter-button');

    // Open the modal when filter button is clicked
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

    // Show all rides initially
    function showAllRides() {
        filterRides(); 
    }

    // Function to close the modal
    function closeModal() {
        modal.style.display = "none";
    }

    // Function to filter rides and fetch data from the backend
    function filterRides() {
        console.log("Fetching rides with filters");

        // Get filter values
        var route = document.getElementById("route-filter").value;
        var status = document.getElementById("status-filter").value;
        var time = document.getElementById("time-filter").value;

        // Make a GET request to fetch filtered rides
        fetch(`../php/getRides.php?route=${route}&status=${status}&time=${time}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const ridesList = document.getElementById("rides-list");

                // Clear previous results
                ridesList.innerHTML = "";

                if (data.error) {
                    const errorElement = `<li>${data.error}</li>`;
                    ridesList.innerHTML = errorElement;
                    closeModal();
                    return;
                }

                if (data.length === 0) {
                    const noResultsElement = `<li>No rides found for the selected filters.</li>`;
                    ridesList.innerHTML = noResultsElement;
                    closeModal();
                    return;
                }

                // Iterate through the data and create ride items
                data.forEach(ride => {
                    let rideElement = document.createElement('li');
                    rideElement.classList.add('ride-item');

                    // Format the waiting time to remove milliseconds if present
                    let formattedWaitingTime = ride.waiting_time ? ride.waiting_time.split(".")[0] : "N/A";

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

                    // Create the booking button
                    let bookingButton = document.createElement('button');
                    bookingButton.innerText = 'Book Ride';
                    bookingButton.classList.add('booking-button');

                    // Handle booking logic for different statuses
                    bookingButton.onclick = function () {
                        if (ride.status === "Upcoming") {
                            alert("Sorry, you cannot book this ride yet.");
                        } else {
                            window.location.href = `../html/paymentPage.html?ride_id=${ride.ride_id}`;
                        }
                    };

                    // Append the ride details and booking button to the ride item
                    rideElement.appendChild(rideDetails);
                    rideElement.appendChild(bookingButton);

                    // Append the ride element to the rides list
                    ridesList.appendChild(rideElement);
                });

                // Close the modal after applying filters
                closeModal();
            })
            .catch(error => {
                console.error('Error fetching rides:', error);
                const ridesList = document.getElementById("rides-list");
                ridesList.innerHTML = `<li>Error fetching rides. Please try again later.</li>`;
                closeModal();
            });
    }

    // Attach the filterRides function to the Apply Filter button
    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', filterRides);
    }

    // Handle the Terms and Conditions Modal
    const termsModal = document.getElementById("terms-modal");
    const btnOpenGcash = document.getElementById("open-modal");
    const btnOpenMaya = document.getElementById("open-maya-modal");
    const spanCloseTerms = document.getElementsByClassName("close")[0];

    // Open the modal for GCash and Maya
    if (btnOpenGcash) {
        btnOpenGcash.onclick = function () {
            termsModal.style.display = "block";
        };
    }

    if (btnOpenMaya) {
        btnOpenMaya.onclick = function () {
            termsModal.style.display = "block";
        };
    }

    // Close the Terms Modal
    if (spanCloseTerms) {
        spanCloseTerms.onclick = function () {
            termsModal.style.display = "none";
        };
    }

    window.onclick = function (event) {
        if (event.target == termsModal) {
            termsModal.style.display = "none";
        }
    };
});
