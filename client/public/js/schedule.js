document.addEventListener("DOMContentLoaded", function () {
    // Show all rides initially
    function showAllRides() {
        filterRides();
    }

    const modal = document.getElementById("filter-modal");
    const filterButton = document.getElementById("filter-button");
    const closeButton = document.getElementsByClassName("close-button")[0];
    const applyFilterButton = document.getElementById("apply-filter-button");
    const showInactiveCheckbox = document.getElementById("hideInactiveCheckbox");
    const ridesList = document.getElementById("rides-list");

    // Advanced booking modal setup
    const advanceBookingModal = document.createElement('div');
    advanceBookingModal.id = 'advance-booking-modal';
    advanceBookingModal.classList.add('modal');
    advanceBookingModal.innerHTML = `
        <div class="modal-content">
            <span class="close-button" id="close-advance-booking">&times;</span>
            <h2>Book a Ride in Advance</h2>
            <p>Booking a ride in advance will add 5 pesos to the fare.</p>
            <button id="continue-to-book" class="view-button">Continue</button>
        </div>
    `;
    document.body.appendChild(advanceBookingModal);

    const closeAdvanceBookingButton = document.getElementById('close-advance-booking');
    const continueToBookButton = document.getElementById('continue-to-book');

    if (showInactiveCheckbox) {
        showInactiveCheckbox.addEventListener('change', filterRides);
    }

    // Call showAllRides to load all the rides initially
    showAllRides();

    // Open the modal when filter button is clicked
    filterButton.onclick = function () {
        modal.style.display = "block";
    };

    if (closeButton) {
        closeButton.onclick = function () {
            modal.style.display = "none";
        };
    }

    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', function () {
            filterRides();
            closeModal();
        });
    }

    if (closeAdvanceBookingButton) {
        closeAdvanceBookingButton.onclick = function () {
            advanceBookingModal.style.display = "none";
        };
    }

    function closeModal() {
        modal.style.display = "none";
    }

    // Function to filter rides and fetch data from the backend
    function filterRides() {
        console.log("Fetching rides with filters");

        // Get the values of the filters
        const showInactive = showInactiveCheckbox && showInactiveCheckbox.checked ? 'true' : 'false';
        const route = document.getElementById("route-filter").value.trim();
        const status = document.getElementById("status-filter").value.trim();
        const time = document.getElementById("time-filter").value.trim();

        // Fetch rides from backend
        fetch(`/api/rides?route=${encodeURIComponent(route)}&status=${encodeURIComponent(status)}&time=${encodeURIComponent(time)}&show_inactive=${showInactive}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                ridesList.innerHTML = "";

                if (!Array.isArray(data)) {
                    console.error('Unexpected response format:', data);
                    ridesList.innerHTML = `<li>Unexpected response from server. Please try again later.</li>`;
                    return;
                }

                if (data.length === 0) {
                    ridesList.innerHTML = `<li>No rides found for the selected filters.</li>`;
                    return;
                }

                const currentTime = new Date();
                const currentHours = currentTime.getHours();
                const currentMinutes = currentTime.getMinutes();

                // Process each ride and display them
                data.forEach(ride => {
                    const rideElement = document.createElement('li');
                    rideElement.classList.add('ride-item');

                    const formattedWaitingTime = ride.waiting_time ? ride.waiting_time.split(".")[0] : "N/A";

                    const rideDetails = document.createElement('div');
                    rideDetails.classList.add('ride-details');
                    rideDetails.innerHTML = `
                        <span class="plate-number">Plate Number: ${ride.plate_number || 'N/A'}</span>
                        <span class="status">Status: ${ride.status}</span>
                        <span class="waiting-time">Waiting Time: ${formattedWaitingTime}</span>
                        <span class="time_range">Schedule Time: ${ride.time_range || 'N/A'}</span>
                    `;

                    const statusElement = rideDetails.querySelector('.status');
                    let currentStatus = ride.status;

                    // Update ride status based on user's PC time
                    const rideTimeRange = ride.time_range ? ride.time_range.split('-') : null;
                    let newStatus = currentStatus;

                    if (rideTimeRange && rideTimeRange.length === 2) {
                        const [startHour, startMinute] = rideTimeRange[0].split(':').map(Number);
                        const [endHour, endMinute] = rideTimeRange[1].split(':').map(Number);

                        // Determine the new status
                        if ((currentHours > startHour || (currentHours === startHour && currentMinutes >= startMinute)) &&
                            (currentHours < endHour || (currentHours === endHour && currentMinutes <= endMinute))) {
                            newStatus = "Loading";
                        } else if (currentHours > endHour || (currentHours === endHour && currentMinutes > endMinute)) {
                            newStatus = "Inactive";
                        } else {
                            newStatus = "Scheduled";
                        }

                        // Update ride status only if it has changed
                        if (newStatus !== currentStatus) {
                            console.log(`Updating ride status for ride ID ${ride.ride_id}: changing from ${currentStatus} to ${newStatus}`);
                            updateRideStatus(ride.ride_id, newStatus);
                            currentStatus = newStatus; // Update the displayed status
                        } else {
                            console.log(`No status change for ride ID ${ride.ride_id}: remains ${currentStatus}`);
                        }
                    }

                    statusElement.innerText = `Status: ${currentStatus}`;
                    statusElement.style.color = getStatusColor(currentStatus);

                    rideElement.appendChild(rideDetails);

                    // Add a booking button for active rides
                    if (currentStatus.toLowerCase() !== "inactive") {
                        const bookingButton = document.createElement('button');
                        bookingButton.innerText = 'Book Ride';
                        bookingButton.classList.add('booking-button');

                        bookingButton.onclick = () => {
                            if (currentStatus.toLowerCase() === "scheduled") {
                                advanceBookingModal.style.display = "block";
                                continueToBookButton.onclick = () => {
                                    advanceBookingModal.style.display = "none";
                                    window.location.href = `/paymentPage.html?ride_id=${ride.ride_id}&additional_fare=5`;
                                };
                            } else {
                                window.location.href = `/paymentPage.html?ride_id=${ride.ride_id}`;
                            }
                        };

                        rideElement.appendChild(bookingButton);
                    }

                    ridesList.appendChild(rideElement);
                });
            })
            .catch(error => {
                console.error('Error fetching rides:', error);
                ridesList.innerHTML = `<li>Error fetching rides. Please try again later.</li>`;
            });
    }

    // Function to update ride status
    async function updateRideStatus(rideId, newStatus) {
        try {
            const response = await fetch('/api/update-ride-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ride_id: rideId, status: newStatus }),
            });
            

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                console.log(data.message || 'Ride status updated successfully in the database');
                return true;
            } else {
                console.error('Error updating ride status:', data.message);
                alert('Error updating ride status: ' + data.message);
                return false;
            }
        } catch (error) {
            console.error('Error updating ride status:', error);
            alert('Error updating ride status. Please try again later.');
            return false;
        }
    }

    function getStatusColor(status) {
        if (status.toLowerCase() === "loading") return "#28a745"; // Green
        if (status.toLowerCase() === "inactive") return "red"; // Red
        if (status.toLowerCase() === "scheduled") return "gold"; // Gold
        return "black"; // Default
    }
});
