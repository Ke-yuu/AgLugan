document.addEventListener("DOMContentLoaded", function () {
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

    // Event Listeners
    if (showInactiveCheckbox) {
        showInactiveCheckbox.addEventListener('change', filterRides);
    }

    filterButton.onclick = () => modal.style.display = "block";

    if (closeButton) {
        closeButton.onclick = () => modal.style.display = "none";
    }

    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', () => {
            filterRides();
            closeModal();
        });
    }

    if (closeAdvanceBookingButton) {
        closeAdvanceBookingButton.onclick = () => {
            advanceBookingModal.style.display = "none";
        };
    }

    function closeModal() {
        modal.style.display = "none";
    }

    // Create table row for each ride
    function createRideRow(ride, currentStatus) {
        const tr = document.createElement('tr');

        const formattedWaitingTime = ride.waiting_time ? ride.waiting_time.split(".")[0] : "N/A";

        tr.innerHTML = `
            <td>${ride.time_range || 'N/A'}</td>
            <td>${ride.plate_number || 'N/A'}</td>
            <td><span class="status-badge status-${currentStatus.toLowerCase()}">${currentStatus}</span></td>
            <td>${ride.waiting_time ? `${formattedWaitingTime} minutes` : 'N/A'}</td>
            <td>
                ${currentStatus.toLowerCase() !== "inactive" ? 
                    `<button class="booking-button">Book Ride</button>` : 
                    '<span class="status-badge status-inactive">Not Available</span>'}
            </td>
        `;

        if (currentStatus.toLowerCase() !== "inactive") {
            const bookButton = tr.querySelector('.booking-button');
            bookButton.onclick = () => {
                if (currentStatus.toLowerCase() === "scheduled") {
                    advanceBookingModal.style.display = "block";
                    continueToBookButton.onclick = () => {
                        advanceBookingModal.style.display = "none";
                        window.location.href = `/payment?ride_id=${ride.ride_id}&additional_fare=5`;
                    };
                } else {
                    window.location.href = `/payment?ride_id=${ride.ride_id}`;
                }
            };
        }

        return tr;
    }

    function filterRides() {
        console.log("Fetching rides with filters");

        const showInactive = showInactiveCheckbox && showInactiveCheckbox.checked ? 'true' : 'false';
        const route = document.getElementById("route-filter").value.trim();
        const status = document.getElementById("status-filter").value.trim();
        const time = document.getElementById("time-filter").value.trim();

        fetch(`/api/rides?route=${encodeURIComponent(route)}&status=${encodeURIComponent(status)}&time=${encodeURIComponent(time)}&show_inactive=${showInactive}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                ridesList.innerHTML = "";

                if (!Array.isArray(data)) {
                    console.error('Unexpected response format:', data);
                    displayError("Unexpected response from server. Please try again later.");
                    return;
                }

                if (data.length === 0) {
                    displayError("No rides found for the selected filters.");
                    return;
                }

                const currentTime = new Date();
                const currentHours = currentTime.getHours();
                const currentMinutes = currentTime.getMinutes();

                data.forEach(ride => {
                    let currentStatus = ride.status;

                    const rideTimeRange = ride.time_range ? ride.time_range.split('-') : null;
                    if (rideTimeRange && rideTimeRange.length === 2) {
                        const [startHour, startMinute] = rideTimeRange[0].split(':').map(Number);
                        const [endHour, endMinute] = rideTimeRange[1].split(':').map(Number);

                        if ((currentHours > startHour || (currentHours === startHour && currentMinutes >= startMinute)) &&
                            (currentHours < endHour || (currentHours === endHour && currentMinutes <= endMinute))) {
                            currentStatus = "Loading";
                        } else if (currentHours > endHour || (currentHours === endHour && currentMinutes > endMinute)) {
                            currentStatus = "Inactive";
                        } else {
                            currentStatus = "Scheduled";
                        }

                        if (currentStatus !== ride.status) {
                            updateRideStatus(ride.ride_id, currentStatus);
                        }
                    }

                    const rideRow = createRideRow(ride, currentStatus);
                    ridesList.appendChild(rideRow);
                });
            })
            .catch(error => {
                console.error('Error fetching rides:', error);
                displayError("Error fetching rides. Please try again later.");
            });
    }

    function displayError(message) {
        ridesList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">${message}</td>
            </tr>
        `;
    }

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
            if (!data.success) {
                console.error('Error updating ride status:', data.message);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error updating ride status:', error);
            return false;
        }
    }

    // Show all rides initially
    filterRides();

    // Refresh rides every 10 seconds
    setInterval(filterRides, 10000);
});
