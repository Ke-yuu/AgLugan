document.addEventListener("DOMContentLoaded", function () {
    // Show all rides initially
    function showAllRides() {
        filterRides(); 
    }

    const modal = document.getElementById("filter-modal");
    const filterButton = document.getElementById("filter-button");
    const closeButton = document.getElementsByClassName("close-button")[0];
    const applyFilterButton = document.getElementById('apply-filter-button');
    const showInactiveCheckbox = document.getElementById('hideInactiveCheckbox');
    const advanceBookingModal = document.createElement('div');
    advanceBookingModal.id = 'advance-booking-modal';
    advanceBookingModal.classList.add('modal');
    advanceBookingModal.innerHTML = `
        <div class="modal-content">
            <span class="close-button" id="close-advance-booking">&times;</span>
            <h2>Book a Ride in Advance</h2>
            <p>Booking a ride in advance will add 5 pesos to the fare.</p>
            <button id="continue-to-book" class="view-button">Continue to Book</button>
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

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        if (event.target == advanceBookingModal) {
            advanceBookingModal.style.display = "none";
        }
    };

    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', function() {
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

        // Check if the checkbox is available and if it is checked
        const showInactive = showInactiveCheckbox && showInactiveCheckbox.checked ? 'true' : 'false';
        var route = document.getElementById("route-filter").value;
        var status = document.getElementById("status-filter").value;
        var time = document.getElementById("time-filter").value;

        // Get current time of user's PC
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();

        // Make a GET request to fetch filtered rides with `show_inactive` parameter
        fetch(`../php/getRides.php?route=${encodeURIComponent(route)}&status=${encodeURIComponent(status)}&time=${encodeURIComponent(time)}&show_inactive=${showInactive}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Expecting JSON response
        })
        .then(data => {
            const ridesList = document.getElementById("rides-list");
            ridesList.innerHTML = "";

            if (data.error) {
                ridesList.innerHTML = `<li>${data.error}</li>`;
                return;
            }

            if (data.length === 0) {
                const noResultsElement = `<li>No rides found for the selected filters.</li>`;
                ridesList.innerHTML = noResultsElement;
                return;
            }

            data.forEach(ride => {
                console.log("Ride data: ", ride);
                let rideElement = document.createElement('li');
                rideElement.classList.add('ride-item');

                let formattedWaitingTime = ride.waiting_time ? ride.waiting_time.split(".")[0] : "N/A";

                let rideDetails = document.createElement('div');
                rideDetails.classList.add('ride-details');
                rideDetails.innerHTML =
                    `<span class="plate-number">Plate Number: ${ride.plate_number || 'N/A'}</span>
                     <span class="status">Status: ${ride.status}</span>
                     <span class="waiting-time">Waiting Time: ${formattedWaitingTime}</span>
                     <span class="time_range">Schedule Time: ${ride.time_range || 'N/A'}</span>`;

                const statusElement = rideDetails.querySelector('.status');

                // Automatically update ride status based on user's PC time
                let rideTimeRange = ride.time_range ? ride.time_range.split('-') : null;
                if (rideTimeRange && rideTimeRange.length === 2) {
                    let [startHour, startMinute] = rideTimeRange[0].split(':').map(Number);
                    let [endHour, endMinute] = rideTimeRange[1].split(':').map(Number);

                    if ((currentHours > startHour || (currentHours === startHour && currentMinutes >= startMinute)) &&
                        (currentHours < endHour || (currentHours === endHour && currentMinutes <= endMinute))) {
                        ride.status = "loading";
                    } else if (currentHours > endHour || (currentHours === endHour && currentMinutes > endMinute)) {
                        ride.status = "inactive";
                    } else {
                        ride.status = "scheduled";
                    }
                }

                // Update ride status in the database only if it has changed
                if (ride.status !== rideDetails.querySelector('.status').innerText.split(': ')[1]) {
                    updateRideStatus(ride.ride_id, ride.status);
                }

                if (ride.status.toLowerCase() === "loading") {
                    statusElement.style.color = "#28a745";
                } else if (ride.status.toLowerCase() === "inactive") {
                    statusElement.style.color = "red";
                } else if (ride.status.toLowerCase() === "scheduled") {
                    statusElement.style.color = "gold";
                }

                statusElement.innerText = `Status: ${ride.status}`;
                rideElement.appendChild(rideDetails);

                // Hide inactive rides if the checkbox is not checked
                if (ride.status.toLowerCase() === "inactive" && showInactive === 'false') {
                    return;
                }

                if (ride.status.toLowerCase() !== "inactive") {
                    let bookingButton = document.createElement('button');
                    bookingButton.innerText = 'Book Ride';
                    bookingButton.classList.add('booking-button');

                    bookingButton.onclick = function () {
                        if (ride.status.toLowerCase() === "scheduled") {
                            advanceBookingModal.style.display = "block";
                            continueToBookButton.onclick = function () {
                                advanceBookingModal.style.display = "none";
                                window.location.href = `../html/paymentPage.html?ride_id=${ride.ride_id}&additional_fare=5`;
                            };
                        } else {
                            window.location.href = `../html/paymentPage.html?ride_id=${ride.ride_id}`;
                        }
                    };

                    rideElement.appendChild(bookingButton);
                }
                ridesList.appendChild(rideElement);
            });
        })
        .catch(error => {
            console.error('Error fetching rides:', error);
            const ridesList = document.getElementById("rides-list");
            ridesList.innerHTML = `<li>Error fetching rides. Please try again later.</li>`;
        });
    }

    // Function to update ride status
    async function updateRideStatus(rideId, newStatus) {
        try {
            console.log("Updating ride status:", { rideId, newStatus });
            let response = await fetch('../php/updateRideStatus.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ride_id: rideId, status: newStatus })
            });
            let data = await response.json();
            if (data.success) {
                console.log('Ride status updated successfully in the database');
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

    setInterval(() => {
        filterRides();
    }, 5000);
});
