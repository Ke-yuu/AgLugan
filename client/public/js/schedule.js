document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("filter-modal");
    const filterButton = document.getElementById("filter-button");
    const closeButton = document.getElementsByClassName("close-button")[0];
    const applyFilterButton = document.getElementById("apply-filter-button");
    const showDoneCheckbox = document.getElementById("hideDoneCheckbox");
    const ridesList = document.getElementById("rides-list");    

    // Advanced booking modal setup
    const advanceBookingModal = document.createElement('div');
    advanceBookingModal.id = 'advance-booking-modal';
    advanceBookingModal.classList.add('modal');
    advanceBookingModal.innerHTML = `
        <div class="modal-content new-modal">
            <button class="close-button" id="close-advance-booking">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-header">
                <h2>Confirm Your Booking</h2>
                <p class="sub-text">Secure your seat now with a small additional fee.</p>
            </div>
            <div class="modal-body">
                <p id="booking-details" class="booking-details-text"></p>
                <div class="booking-summary">
                    <div class="icon-box">
                        <i class="fas fa-map-marker-alt"></i>
                        <span id="start-location" class="booking-location">Start Location</span>
                    </div>
                    <div class="icon-box">
                        <i class="fas fa-flag-checkered"></i>
                        <span id="end-location" class="booking-location">End Location</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="continue-to-book" class="primary-button">
                    Proceed to Payment
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(advanceBookingModal);

    const closeAdvanceBookingButton = document.getElementById('close-advance-booking');
    const continueToBookButton = document.getElementById('continue-to-book');

    // Event Listeners
    filterButton.onclick = () => modal.style.display = "block";
    if (closeButton) closeButton.onclick = () => modal.style.display = "none";
    if (applyFilterButton) applyFilterButton.addEventListener('click', () => {
        filterRides();
        modal.style.display = "none";
    });

    if (closeAdvanceBookingButton) {
        closeAdvanceBookingButton.onclick = () => {
            advanceBookingModal.style.display = "none";
        };
    }

    if (showDoneCheckbox) {
        showDoneCheckbox.addEventListener('change', filterRides);
    }

    function createRideRow(ride) {
        const tr = document.createElement('tr');
        const statusClass = ride.status.toLowerCase().replace(' ', '');
        const isBooked = ride.booking_status === 'BOOKED';
    
        // Create table data elements
        const tdTime = document.createElement('td');
        tdTime.textContent = ride.time_range || 'N/A';
    
        const tdPlate = document.createElement('td');
        tdPlate.textContent = ride.plate_number || 'N/A';
    
        const tdStatus = document.createElement('td');
        tdStatus.innerHTML = `<span class="status-badge status-${statusClass}">${ride.status}</span>`;
    
        const tdWaiting = document.createElement('td');
        tdWaiting.textContent = ride.waiting_time || 'N/A';
    
        const tdActions = document.createElement('td');
        
        if (isBooked) {
            tdActions.innerHTML = `
                <div class="booking-status">
                    <span class="status-badge">BOOKED</span>
                    <button class="payment-button" 
                        onclick="window.location.href='/payment?ride_id=${ride.ride_id}'">
                        Proceed to Payment
                    </button>
                </div>
            `;
        } else if (ride.status.toLowerCase() === "in queue") {
            tdActions.innerHTML = `
                <button class="booking-button" 
                    data-ride-id="${ride.ride_id}"
                    data-start="${ride.start_location}"
                    data-end="${ride.end_location}">
                    Book Ride
                </button>
            `;
        } else {
            tdActions.innerHTML = `
                <button class="booking-button" disabled>
                    Book Ride
                </button>
            `;
        }
    
        // Append table data to the row
        tr.appendChild(tdTime);
        tr.appendChild(tdPlate);
        tr.appendChild(tdStatus);
        tr.appendChild(tdWaiting);
        tr.appendChild(tdActions);
    
        // Add Event Listener to the "Book Ride" button
        const bookingButton = tdActions.querySelector('.booking-button:not([disabled])');
        if (bookingButton) {
            bookingButton.addEventListener('click', () => {
                openBookingModal({
                    ride_id: bookingButton.dataset.rideId,
                    start_location: bookingButton.dataset.start,
                    end_location: bookingButton.dataset.end
                });
            });
        }
    
        return tr;
    }

    function openBookingModal(ride) {
        if (!ride || !ride.ride_id || !ride.start_location || !ride.end_location) {
            alert('Error: Booking details not found. Please try again.');
            return;
        }
    
        const bookingModal = document.getElementById('advance-booking-modal');
        const bookingDetails = document.getElementById('booking-details');
        const startLocation = document.getElementById('start-location');
        const endLocation = document.getElementById('end-location');
    
        bookingDetails.textContent = `Booking a ride from ${ride.start_location} to ${ride.end_location} will add ₱5 to the fare.`;
        startLocation.textContent = ride.start_location;
        endLocation.textContent = ride.end_location;
    
        // Store ride ID for booking
        bookingModal.dataset.rideId = ride.ride_id;
        
        // Show modal
        bookingModal.style.display = "block";
    }

    function processBooking(rideId) {
        const bookingModal = document.getElementById('advance-booking-modal');
        
        return fetch('/direct-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ride_id: rideId })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Booking failed');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                bookingModal.style.display = 'none';
                // Redirect to payment page with booking ID
                window.location.href = `/payment?ride_id=${rideId}&booking_id=${data.booking_id}`;
            } else {
                throw new Error(data.message || 'Booking failed');
            }
        })
        .catch(error => {
            console.error('Booking error:', error);
            alert(error.message || 'An error occurred while processing your booking. Please try again.');
            return false;
        });
    }

    if (continueToBookButton) {
        continueToBookButton.addEventListener('click', () => {
            const bookingModal = document.getElementById('advance-booking-modal');
            const rideId = bookingModal.dataset.rideId;
    
            if (!rideId) {
                alert('Error: Ride ID not found. Please try again.');
                return;
            }
    
            // Disable the button while processing
            continueToBookButton.disabled = true;
            continueToBookButton.textContent = 'Processing...';
    
            processBooking(rideId)
                .finally(() => {
                    // Re-enable the button
                    continueToBookButton.disabled = false;
                    continueToBookButton.textContent = 'Proceed to Payment';
                });
        });
    }

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
        if (event.target === advanceBookingModal) {
            advanceBookingModal.style.display = "none";
        }
    };

    function filterRides() {
        const showDone = showDoneCheckbox.checked;
        const route = document.getElementById("route-filter").value.trim();
        const status = document.getElementById("status-filter").value.trim();
        const time = document.getElementById("time-filter").value.trim();

        fetch(`/api/rides?route=${encodeURIComponent(route)}&status=${encodeURIComponent(status)}&time=${encodeURIComponent(time)}`)
            .then(response => response.json())
            .then(data => {
                ridesList.innerHTML = "";

                if (!Array.isArray(data) || data.length === 0) {
                    displayError("No rides found for the selected filters.");
                    return;
                }

                data.forEach(ride => {
                    let currentStatus = ride.status;

                    if (!showDone && (currentStatus === "Done" || currentStatus === "Cancelled")) {
                        return;
                    }

                    const rideRow = createRideRow(ride);
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
                <td colspan="5" style="text-align: center; padding: 20px;">${message}</td>
            </tr>
        `;
    }

    // Initial load and refresh interval
    filterRides();
    setInterval(filterRides, 10000);
});