document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("filter-modal");
    const filterButton = document.getElementById("filter-button");
    const closeButton = document.getElementsByClassName("close-button")[0];
    const applyFilterButton = document.getElementById("apply-filter-button");
    const showDoneCheckbox = document.getElementById("hideDoneCheckbox");
    const ridesList = document.getElementById("rides-list");    
    
    fetch('/api/check-session', { credentials: 'include' }) // Ensure cookies are sent
    .then((response) => response.json())
    .then((data) => {
        console.log('Session Check:', data);

        if (data.status === 'logged_out') {
            alert('Session expired. Redirecting to login page.');
            window.location.href = '/login'; // Redirect to login
        } else {
            console.log(`Welcome, ${data.type}!`);
            // Load schedule page content here
            filterRides();
        }
    })
    .catch((error) => {
        console.error('Session check failed:', error);
        alert('Unable to verify session. Redirecting to login.');
        window.location.href = '/login';
    });

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
    
        tr.innerHTML = `
          <td>${ride.time_range || 'N/A'}</td>
          <td>${ride.plate_number || 'N/A'}</td>
          <td>
            <span class="status-badge status-${statusClass}">${ride.status}</span>
          </td>
          <td>${ride.waiting_time || 'N/A'}</td>
          <td>
            ${
              ride.status.toLowerCase() === "in queue"
                ? `<button class="booking-button" 
                    data-ride-id="${ride.ride_id}" 
                    data-start="${ride.start_location}" 
                    data-end="${ride.end_location}">
                    Book Ride
                  </button>`
                : `<span class="status-badge status-${statusClass}">${ride.status}</span>`
            }
          </td>
        `;
    
        const bookingButton = tr.querySelector('.booking-button');
        if (bookingButton) {
            bookingButton.addEventListener('click', () => {
                openBookingModal({
                    ride_id: bookingButton.dataset.rideId, 
                    start_location: bookingButton.dataset.start,
                    end_location: bookingButton.dataset.end,
                });
            });
        }
    
        return tr;
    }

    function openBookingModal(ride) {
        console.log('Ride Details:', ride); 
    
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
    
        // Store ride ID for submission
        bookingModal.dataset.rideId = ride.ride_id;
    
        bookingModal.style.display = "block";
    }

    if (continueToBookButton) {
        continueToBookButton.addEventListener('click', () => {
            const bookingModal = document.getElementById('advance-booking-modal');
            const rideId = bookingModal.dataset.rideId;
    
            console.log('Sending Payload:', { ride_id: rideId }); // Debugging
    
            if (!rideId) {
                alert('Error: Ride ID not set. Please reopen the booking modal.');
                return;
            }
    
            // Send POST request with session cookies
            fetch('/api/book-ride', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies
                body: JSON.stringify({ ride_id: rideId }) 
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server Response:', data); 
                if (data.success) {
                    alert('Ride booked successfully!');
                    location.reload();
                } else {
                    alert(`Error: ${data.message}`);
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
    

    function filterRides() {
        console.log("Fetching rides with filters");

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
                        return; // Skip "Done" and "Cancelled" rides
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
                <td colspan="6" style="text-align: center; padding: 20px;">${message}</td>
            </tr>
        `;
    }

    // Show all rides initially
    filterRides();

    // Refresh rides every 10 seconds
    setInterval(filterRides, 10000);
});
