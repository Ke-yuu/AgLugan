// DOM Elements
const driverNameSpan = document.getElementById('driver-name');
const queuedRidesList = document.getElementById('queued-rides-list');
const ongoingQueueList = document.getElementById('ongoing-queue-list');
const scheduledQueueList = document.getElementById('scheduled-queue-list');
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
    return `₱${(isNaN(value) || value === null ? 0 : parseFloat(value)).toFixed(2)}`;
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

async function fetchData(route) {
    try {
        const response = await fetch(route);
        if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Load Driver Data
async function loadDriverData() {
    try {
        const driverData = await fetchData('/api/driver-dashboard');
        if (!driverData) throw new Error('Driver data is undefined');
        
        if (driverNameSpan) driverNameSpan.textContent = driverData.name;
        loadQueuedRides(driverData.queuedRides);
        loadOngoingQueue(driverData.ongoingQueue);
        loadScheduledRides(driverData.scheduledRides);
    } catch (error) {
        console.error('Error loading driver data:', error);
    }
}

// Modal Functions
function openQueueRideModal() {
    if (queueRideModal) queueRideModal.style.display = "block";
}

function closeQueueRideModal() {
    if (queueRideModal) queueRideModal.style.display = "none";
}

// Populate Vehicles Dropdown
async function populateVehicleDropdown() {
    const vehicleSelect = document.getElementById('vehicle-id');
    if (!vehicleSelect) return;

    vehicleSelect.innerHTML = '';

    try {
        const vehicles = await fetchData('/api/driver-dashboard/getVehicles');
        if (vehicles?.length) {
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.vehicle_id;
                option.textContent = vehicle.plate_number;
                vehicleSelect.appendChild(option);
            });
        } else {
            vehicleSelect.innerHTML = '<option value="">No vehicles available</option>';
        }
    } catch {
        vehicleSelect.innerHTML = '<option value="">Error loading vehicles</option>';
    }
}

// Fare Calculator
function calculateFare(startLocation, endLocation) {
    const fareMap = {
        'Igorot Garden': {
            'Barangay Hall': 12,
            'Holy Family Parish Church': 12,
            'SLU Mary Heights': 13,
            'Phase 1': 13,
            'Phase 2': 13,
            'Phase 3': 14
        },
        'Barangay Hall': {
            'Igorot Garden': 12,
            'SM Baguio': 12,
            'Burnham Park': 12
        },
        'SLU Mary Heights': {
            'Barangay Hall': 10,
            'SM Baguio': 13,
            'Burnham Park': 13,
            'Igorot Garden': 13
        },
        'Phase 3': {
            'SLU Mary Heights': 10,
            'Barangay Hall': 10,
            'SM Baguio': 14,
            'Burnham Park': 14,
            'Igorot Garden': 14
        }
    };

    return fareMap[startLocation]?.[endLocation] || 0;
}

// DateTime Functions
function setupDateTimePicker() {
    const scheduleTimeInput = document.getElementById('schedule-time');
    if (!scheduleTimeInput) return;

    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);

    scheduleTimeInput.min = formatLocalDateTime(now);
    scheduleTimeInput.step = 900;

    scheduleTimeInput.addEventListener('input', () => {
        const selectedTime = new Date(scheduleTimeInput.value);
        const roundedTime = roundToNearest15Minutes(selectedTime);
        scheduleTimeInput.value = formatLocalDateTime(roundedTime);
    });
}

function roundToNearest15Minutes(date) {
    const rounded = new Date(date);
    rounded.setSeconds(0, 0);
    rounded.setMinutes(Math.round(rounded.getMinutes() / 15) * 15);
    return rounded;
}

// Helper function to format a Date object as local "YYYY-MM-DDTHH:MM"
function formatLocalDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Form Submission Handlers
async function submitQueueRideForm(event) {
    event.preventDefault();
    const currentUser = await getCurrentUser();
    if (!currentUser?.user_id) {
        alert("Unable to fetch user data. Please try again.");
        return;
    }

    const formData = new FormData(event.target);
    const startLocation = formData.get("start-location");
    const endLocation = formData.get("end-location");
    const fare = calculateFare(startLocation, endLocation);

    if (fare === 0) {
        alert("Invalid start or end location. Please try again.");
        return;
    }

    const payload = {
        driver_id: currentUser.user_id,
        vehicle_id: formData.get("vehicle-id"),
        start_location: startLocation,
        end_location: endLocation,
        fare: fare,
        type: formData.get("ride-type")
    };

    if (payload.type === "scheduled") {
        const scheduleTime = formData.get("schedule-time");
        const selectedTime = new Date(scheduleTime);
        const now = new Date();

        if (!scheduleTime) {
            alert("Please provide a valid schedule time for the ride.");
            return;
        }

        if (selectedTime < now) {
            alert('Selected time is in the past. Please pick a valid time.');
            return;
        }

        if (selectedTime.getMinutes() % 15 !== 0) {
            alert('Please select a time that aligns with 15-minute intervals.');
            return;
        }

        payload.schedule_time = scheduleTime;
    }

    try {
        const response = await fetch("/api/driver-dashboard/queue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Ride queued successfully!");
            loadDriverData();
            closeQueueRideModal();
        } else {
            alert(`Failed to queue ride: ${await response.text()}`);
        }
    } catch (error) {
        console.error("Error submitting queue ride form:", error);
    }
}

async function submitAddVehicleForm(event) {
    event.preventDefault();
    const currentUser = await getCurrentUser();
    if (!currentUser?.user_id) {
        alert('Unable to fetch user data. Please try again.');
        return;
    }

    const payload = {
        capacity: document.getElementById('capacity').value,
        plate_number: document.getElementById('plate-number').value,
        driver_id: currentUser.user_id
    };

    try {
        const response = await fetch('/api/driver-dashboard/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Vehicle added successfully!');
            addVehicleModal.style.display = 'none';
            populateVehicleDropdown();
        } else {
            alert(`Failed to add vehicle: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error adding vehicle:', error);
    }
}

// Table Update Functions
function loadQueuedRides(rides) {
    updateRidesTable(queuedRidesList, rides, true);
}

function loadOngoingQueue(rides) {
    updateRidesTable(ongoingQueueList, rides);
}

function loadScheduledRides(rides) {
    updateRidesTable(scheduledQueueList, rides);
}

function updateRidesTable(tableBody, rides, showButtons = false) {
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (rides?.length) {
        rides.forEach(ride => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ride.plate_number || 'N/A'}</td>
                <td>${ride.start_location || 'N/A'}</td>
                <td>${ride.end_location || 'N/A'}</td>
                <td>${ride.status || 'N/A'}</td>
                <td>${ride.time_range || 'N/A'}</td>
                ${
                    showButtons
                        ? `
                    <td>
                        <button class="done-btn" data-ride-id="${ride.ride_id}">Done</button>
                        <button class="cancel-btn" data-ride-id="${ride.ride_id}">Cancel</button>
                    </td>
                `
                        : ''
                }
            `;
            tableBody.appendChild(row);
        });

        // Attach button event listeners if buttons are shown
        if (showButtons) {
            tableBody.querySelectorAll('.done-btn').forEach(button => {
                button.addEventListener('click', handleRideDone);
            });

            tableBody.querySelectorAll('.cancel-btn').forEach(button => {
                button.addEventListener('click', handleRideCancel);
            });
        }
    } else {
        tableBody.innerHTML = '<tr><td colspan="6">No rides available</td></tr>';
    }
}

async function handleRideDone(event) {
    const rideId = event.target.dataset.rideId;

    try {
        const response = await fetch(`/api/driver-dashboard/rides/${rideId}/done`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert('Ride marked as done!');
            loadDriverData(); // Refresh the queue data
        } else {
            alert(`Failed to mark ride as done: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error marking ride as done:', error);
    }
}

async function handleRideCancel(event) {
    const rideId = event.target.dataset.rideId;

    try {
        const response = await fetch(`/api/driver-dashboard/rides/${rideId}/cancel`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert('Ride canceled successfully!');
            loadDriverData(); // Refresh the queue data
        } else {
            alert(`Failed to cancel ride: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error canceling ride:', error);
    }
}


// Auth Functions
async function getCurrentUser() {
    try {
        const response = await fetch('/api/driver-dashboard/getCurrent', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (response.ok) return await response.json();
        console.error('Failed to fetch user data');
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    return null;
}

async function handleLogout() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) {
            window.location.href = '/login';
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred while logging out. Please try again.');
    }
}

// Location Selection Handler
function disableSameLocation() {
    const startLocationSelect = document.getElementById('start-location');
    const endLocationSelect = document.getElementById('end-location');

    if (!startLocationSelect || !endLocationSelect) return;

    startLocationSelect.addEventListener('change', () => {
        const selectedStart = startLocationSelect.value;
        Array.from(endLocationSelect.options).forEach(option => {
            option.disabled = option.value === selectedStart;
            option.style.color = option.disabled ? 'gray' : '';
        });
    });
}

async function pollRideStatusUpdates() {
    try {
        const response = await fetch('/api/driver-dashboard/updateRideStatuses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Updated rides:', data.updatedRides);

            // Refresh the driver data to reflect changes
            await loadDriverData();
        } else {
            console.error('Failed to update ride statuses');
        }
    } catch (error) {
        console.error('Error polling ride status updates:', error);
    }
}



// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupDateTimePicker();
    loadDriverData();
    disableSameLocation();
    setInterval(pollRideStatusUpdates, 60000); // Poll every 60 seconds
    // Add event listeners with null checks
    logoutBtn?.addEventListener('click', handleLogout);
    
    queueRideBtn?.addEventListener('click', async () => {
        await populateVehicleDropdown();
        openQueueRideModal();
    });

    closeQueueRideModalBtn?.addEventListener('click', closeQueueRideModal);
    queueRideForm?.addEventListener('submit', submitQueueRideForm);

    addVehicleLink?.addEventListener('click', (event) => {
        event.preventDefault();
        if (addVehicleModal) addVehicleModal.style.display = 'block';
    });

    closeAddVehicleModalBtn?.addEventListener('click', () => {
        if (addVehicleModal) addVehicleModal.style.display = 'none';
    });

    document.querySelector("#addVehicleForm")?.addEventListener("submit", submitAddVehicleForm);

    const rideTypeSelect = document.getElementById('ride-type');
    const scheduleTimeContainer = document.getElementById('schedule-time-container');
    const scheduleTimeInput = document.getElementById('schedule-time');

    if (rideTypeSelect && scheduleTimeContainer && scheduleTimeInput) {
        rideTypeSelect.addEventListener('change', () => {
            if (rideTypeSelect.value === 'scheduled') {
                scheduleTimeContainer.style.display = 'block'; // Show the schedule time input
                scheduleTimeInput.setAttribute('required', 'true'); // Add `required`
            } else {
                scheduleTimeContainer.style.display = 'none'; // Hide the schedule time input
                scheduleTimeInput.removeAttribute('required'); // Remove `required`
                scheduleTimeInput.value = ''; // Clear any value
            }
        });
    }
});