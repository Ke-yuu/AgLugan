// DOM Elements
const driverNameSpan = document.getElementById('driver-name');
const queuedRidesList = document.getElementById('queued-rides-list');
const ongoingQueueList = document.getElementById('ongoing-queue-list');
const totalEarningsSpan = document.getElementById('total-earnings');
const completedRidesList = document.getElementById('completed-rides-list');
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
const addVehicleLink = document.querySelector('li a[href="#addVehicleModal"]');
const addVehicleModal = document.getElementById('addVehicleModal');
const closeAddVehicleModalBtn = document.getElementById('closeAddVehicleModalBtn');

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

// Fetch and Populate Vehicles in Dropdown
async function populateVehicleDropdown() {
    const vehicleSelect = document.getElementById('vehicle-id');
    vehicleSelect.innerHTML = ''; // Clear existing options

    try {
        const response = await fetch('/api/driver-dashboard/getVehicles', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include session cookies
        });
        if (response.ok) {
            const vehicles = await response.json();

            if (vehicles.length === 0) {
                vehicleSelect.innerHTML = '<option value="">No vehicles available</option>';
                return;
            }

            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.vehicle_id;
                option.textContent = vehicle.plate_number;
                vehicleSelect.appendChild(option);
            });
        } else {
            vehicleSelect.innerHTML = '<option value="">Error loading vehicles</option>';
        }
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        vehicleSelect.innerHTML = '<option value="">Error loading vehicles</option>';
    }
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

async function getCurrentUser() {
    try {
        const response = await fetch('/api/driver-dashboard/getCurrent', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include session cookies
        });

        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else {
            console.error('Failed to fetch user data');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Show modal on click of the car icon link
addVehicleLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default anchor behavior
    addVehicleModal.style.display = 'block';
});

// Hide modal on click of the close button
closeAddVehicleModalBtn.addEventListener('click', () => {
    addVehicleModal.style.display = 'none';
});

// Optional: Close the modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === addVehicleModal) {
        addVehicleModal.style.display = 'none';
    }
});

document.querySelector("#addVehicleForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const capacity = document.querySelector("#capacity").value;
    const plateNumber = document.querySelector("#plate-number").value;

    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || !currentUser.user_id) {
            alert('Unable to fetch user data. Please try again.');
            return;
        }

        const payload = {
            capacity: capacity,
            plate_number: plateNumber,
            driver_id: currentUser.user_id, // Dynamically include driver ID
        };

        const response = await fetch('/api/driver-dashboard/vehicles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert('Vehicle added successfully!');
            document.getElementById('addVehicleModal').style.display = 'none';
            // Optionally refresh the vehicle list
        } else {
            const errorText = await response.text();
            alert(`Failed to add vehicle: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});



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
queueRideBtn.addEventListener('click', async () => {
    await populateVehicleDropdown();
    openQueueRideModal();
});
closeQueueRideModalBtn.addEventListener('click', closeQueueRideModal);
queueRideForm.addEventListener('submit', submitQueueRideForm);

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', loadDriverData);
