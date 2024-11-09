document.addEventListener("DOMContentLoaded", function () {
    // Show all rides initially
    function showAllRides() {
        filterRides(); 
    }

    const modal = document.getElementById("filter-modal");
    const filterButton = document.getElementById("filter-button");
    const closeButton = document.getElementsByClassName("close-button")[0];
    const applyFilterButton = document.getElementById('apply-filter-button');
    const hideInactiveCheckbox = document.getElementById('hideInactiveCheckbox');

    if (hideInactiveCheckbox) {
        hideInactiveCheckbox.addEventListener('change', filterRides);
    }
    // Call showAllRides to load all the rides initially
    showAllRides();

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

    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', filterRides);
    }

    function closeModal() {
        modal.style.display = "none";
    }

    // Function to filter rides and fetch data from the backend
    function filterRides() {
        console.log("Fetching rides with filters");

        // Check if the checkbox is available and if it is checked
        const hideInactive = hideInactiveCheckbox && hideInactiveCheckbox.checked;
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
                    let updatedStatus = getUpdatedStatus(ride);
                    updateRideStatusInDatabase(ride.ride_id, updatedStatus);

                    // If "Hide Inactive Rides" is checked, skip rendering inactive rides
                    if (hideInactive && updatedStatus === "Inactive") {
                        return;
                    }

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
                        <span class="status">Status: ${updatedStatus}</span>
                        <span class="waiting-time">Waiting Time: ${formattedWaitingTime}</span>
                        <span class="time_range">Schedule Time: ${ride.time_range || 'N/A'}</span>`;

                    // Apply color based on status
                    const statusElement = rideDetails.querySelector('.status');
                    if (updatedStatus === "Available") {
                        statusElement.style.color = "#28a745"; 
                    } else if (updatedStatus === "Inactive") {
                        statusElement.style.color = "red"; 
                    } else if (updatedStatus === "Upcoming") {
                        statusElement.style.color = "gold"; 
                    }

                    // Append the ride details to the ride item
                    rideElement.appendChild(rideDetails);

                    // Create the booking button only if the ride is not inactive
                    if (updatedStatus !== "Inactive") {
                        let bookingButton = document.createElement('button');
                        bookingButton.innerText = 'Book Ride';
                        bookingButton.classList.add('booking-button');

                        // Handle booking logic for different statuses
                        bookingButton.onclick = function () {
                            if (updatedStatus === "Upcoming") {
                                alert("Sorry, you cannot book this ride yet.");
                            } else {
                                window.location.href = `../html/paymentPage.html?ride_id=${ride.ride_id}`;
                            }
                        };

                        // Append the booking button to the ride item
                        rideElement.appendChild(bookingButton);
                    }

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

    // Function to determine the updated status of a ride based on the current time
    function getUpdatedStatus(ride) {
        const currentTime = new Date();
        const [startHour, startMinute] = ride.time_range.split('-')[0].split(':');
        const [endHour, endMinute] = ride.time_range.split('-')[1].split(':');

        const startTime = new Date();
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);

        if (currentTime < startTime) {
            return "Upcoming";
        } else if (currentTime >= startTime && currentTime <= endTime) {
            return "Available";
        } else {
            return "Inactive";
        }
    }

    // Function to update ride status in the database
    function updateRideStatusInDatabase(rideId, updatedStatus) {
        fetch('../php/updateRideStatus.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ride_id: rideId, status: updatedStatus })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log(`Ride ID ${rideId} status updated to ${updatedStatus}`);
            } else {
                console.error(`Failed to update status for ride ID ${rideId}:`, data.message);
            }
        })
        .catch(error => {
            console.error(`Error updating status for ride ID ${rideId}:`, error);
        });
    }
});
