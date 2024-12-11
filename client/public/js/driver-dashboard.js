// DOM Elements
const driverNameSpan = document.getElementById('driver-name');
const queuedRidesList = document.getElementById('queued-rides-list');
const ongoingQueueList = document.getElementById('ongoing-queue-list');
const totalEarningsSpan = document.getElementById('total-earnings');
const completedRidesList = document.getElementById('completed-rides-list');
const availabilityToggle = document.getElementById('availability-toggle');
const totalRidesSpan = document.getElementById('total-rides');
const completedRidesSpan = document.getElementById('completed-rides');
const cancelledRidesSpan = document.getElementById('cancelled-rides');
const earningsOverviewSpan = document.getElementById('earnings-overview');
const averageRatingSpan = document.getElementById('average-rating');
const queueRideModal = document.getElementById('queueRideModal');
const queueRideBtn = document.getElementById('queueRideBtn');
const closeQueueRideModalBtn = document.getElementById('closeQueueRideModalBtn');
const queueRideForm = document.getElementById('queueRideForm');
const logoutBtn = document.getElementById('logoutBtn');

// Utility Functions
function formatCurrency(value) {
    return `₱${value.toFixed(2)}`;
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

// Fetch Data from API
async function fetchData(route) {
    try {
        const response = await fetch(route);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Load Driver Data
async function loadDriverData() {
    try {
        const driverData = await fetchData('/api/driver-dashboard');

        if (!driverData) {
            throw new Error('Driver data is undefined');
        }
        
        // Set Driver Name
        driverNameSpan.textContent = driverData.name;

        // Set Availability Toggle
        availabilityToggle.checked = driverData.availability;

        // Load Sections
        loadQueuedRides(driverData.queuedRides);
        loadOngoingQueue(driverData.ongoingQueue);
        loadEarnings(driverData.completedRides);
        loadPerformanceOverview(driverData.performance);
    } catch (error) {
        console.error('Error loading driver data:', error);
    }
}

// Load Queued Rides
function loadQueuedRides(queuedRides) {
    queuedRidesList.innerHTML = ""; // Clear the list

    if (!queuedRides || queuedRides.length === 0) {
        queuedRidesList.innerHTML = "<li>No queued rides at the moment.</li>";
        return;
    }

    queuedRides.forEach((ride) => {
        const rideItem = document.createElement('li');
        rideItem.className = 'queued-ride-item';

        rideItem.innerHTML = `
            <p><strong>Ride ID:</strong> ${ride.queue_id}</p>
            <p><strong>From:</strong> ${ride.start_location}</p>
            <p><strong>To:</strong> ${ride.end_location}</p>
            <p><strong>Status:</strong> ${ride.status}</p>
            <button class="cancel-ride-btn" data-ride-id="${ride.queue_id}">Cancel Ride</button>
        `;

        queuedRidesList.appendChild(rideItem);
    });

    // Add Event Listeners for "Cancel Ride" buttons
    document.querySelectorAll('.cancel-ride-btn').forEach((button) => {
        button.addEventListener('click', cancelRide);
    });
}

// Load Ongoing Queue
function loadOngoingQueue(ongoingQueue) {
    ongoingQueueList.innerHTML = ""; // Clear the list

    if (!ongoingQueue || ongoingQueue.length === 0) {
        ongoingQueueList.innerHTML = "<li>No ongoing rides at the moment.</li>";
        return;
    }

    ongoingQueue.forEach((ride) => {
        const rideItem = document.createElement('li');
        rideItem.className = 'ongoing-ride-item';

        rideItem.innerHTML = `
            <p><strong>Ride ID:</strong> ${ride.queue_id}</p>
            <p><strong>From:</strong> ${ride.start_location}</p>
            <p><strong>To:</strong> ${ride.end_location}</p>
            <p><strong>Status:</strong> ${ride.status}</p>
        `;

        ongoingQueueList.appendChild(rideItem);
    });
}

// Load Earnings
function loadEarnings(completedRides) {
    if (!completedRides) return;

    const totalEarnings = completedRides.reduce((total, ride) => total + ride.fare, 0);
    totalEarningsSpan.textContent = formatCurrency(totalEarnings);

    completedRidesList.innerHTML = ""; // Clear the list

    if (completedRides.length === 0) {
        completedRidesList.innerHTML = "<li>No completed rides yet.</li>";
        return;
    }

    completedRides.forEach((ride) => {
        const rideItem = document.createElement('li');
        rideItem.className = 'completed-ride-item';

        rideItem.innerHTML = `
            <p><strong>Ride ID:</strong> ${ride.ride_id}</p>
            <p><strong>Fare:</strong> ${formatCurrency(ride.fare)}</p>
        `;

        completedRidesList.appendChild(rideItem);
    });
}

// Load Performance Overview
function loadPerformanceOverview(performance) {
    if (!performance) return;

    totalRidesSpan.textContent = performance.totalRides || 0;
    completedRidesSpan.textContent = performance.completedRides || 0;
    cancelledRidesSpan.textContent = performance.cancelledRides || 0;
    earningsOverviewSpan.textContent = formatCurrency(performance.totalEarnings || 0);
    averageRatingSpan.textContent = performance.averageRating || "N/A";
}

// Open Queue Ride Modal
function openQueueRideModal() {
    queueRideModal.style.display = "block";
}

// Close Queue Ride Modal
function closeQueueRideModal() {
    queueRideModal.style.display = "none";
}

// Submit Queue Ride Form
async function submitQueueRideForm(event) {
    event.preventDefault();

    const formData = new FormData(queueRideForm);
    const payload = {
        driver_id: 1, // Replace with the logged-in driver's ID
        vehicle_id: formData.get('vehicle-id'),
        start_location: formData.get('start-location'),
        end_location: formData.get('end-location'),
    };

    try {
        await fetch('/api/driver-dashboard/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        loadDriverData();
        closeQueueRideModal();
    } catch (error) {
        console.error('Error submitting queue ride form:', error);
    }
}

// Cancel Ride
async function cancelRide(event) {
    const rideId = event.target.getAttribute('data-ride-id');

    try {
        await fetch(`/api/driver-dashboard/cancel/${rideId}`, {
            method: 'PATCH',
        });

        loadDriverData();
    } catch (error) {
        console.error('Error cancelling ride:', error);
    }
}

// Toggle Availability
function toggleAvailability() {
    const availability = availabilityToggle.checked;

    fetch('/api/driver-dashboard/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: 1, availability }), // Replace with the logged-in driver's ID
    })
        .then(() => {
            alert(`You are now ${availability ? "available" : "unavailable"} for rides.`);
        })
        .catch((error) => {
            console.error('Error updating availability:', error);
        });
}

// Logout Function
async function handleLogout() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });

        if (response.ok) {
            alert('You have been logged out.');
            window.location.href = '/login'; // Redirect to the login page
        } else {
            const errorData = await response.json();
            alert(`Logout failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred while logging out. Please try again.');
    }
}

// Event Listeners
logoutBtn.addEventListener('click', handleLogout);
queueRideBtn.addEventListener('click', openQueueRideModal);
closeQueueRideModalBtn.addEventListener('click', closeQueueRideModal);
queueRideForm.addEventListener('submit', submitQueueRideForm);
availabilityToggle.addEventListener('change', toggleAvailability);

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', loadDriverData);
