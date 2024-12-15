// DOM Elements
const driverNameSpan = document.getElementById('driver-name');
const queuedRidesList = document.getElementById('queued-rides-list');
const ongoingQueueList = document.getElementById('ongoing-queue-list');
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
        
        driverNameSpan.textContent = driverData.name;
        loadQueuedRides(driverData.queuedRides);
        loadOngoingQueue(driverData.ongoingQueue);
        loadPerformanceOverview(driverData.performance);
    } catch (error) {
        console.error('Error loading driver data:', error);
    }
}

// Open/Close Queue Ride Modal
function openQueueRideModal() {
    queueRideModal.style.display = "block";
}

function closeQueueRideModal() {
    queueRideModal.style.display = "none";
}

// Populate Vehicles Dropdown
async function populateVehicleDropdown() {
    const vehicleSelect = document.getElementById('vehicle-id');
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

// Submit Queue Ride Form
async function submitQueueRideForm(event) {
    event.preventDefault();
    const currentUser = await getCurrentUser();
    if (!currentUser?.user_id) {
        alert('Unable to fetch user data. Please try again.');
        return;
    }

    const formData = new FormData(queueRideForm);
    const rideType = formData.get('ride-type');
    const payload = {
        driver_id: currentUser.user_id,
        vehicle_id: formData.get('vehicle-id'),
        start_location: formData.get('start-location'),
        end_location: formData.get('end-location'),
        type: rideType,
    };

    if (rideType === 'scheduled') {
        const scheduleTimes = [];
        document.querySelectorAll('.schedule-time-input').forEach(input => {
            if (input.value) scheduleTimes.push(input.value);
        });
        if (scheduleTimes.length === 0) {
            alert('Please provide at least one schedule time for scheduled rides.');
            return;
        }
        payload.schedule_times = scheduleTimes;
    }

    try {
        const response = await fetch('/api/driver-dashboard/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert('Ride queued successfully!');
            loadDriverData();
            closeQueueRideModal();
        } else {
            alert(`Failed to queue ride: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error submitting queue ride form:', error);
    }
}

// Add Schedule Time Input
function addScheduleTimeInput() {
    const scheduleContainer = document.getElementById('schedule-time-container');
    if (!scheduleContainer) {
        console.error("schedule-time-container not found in the DOM.");
        return;
    }

    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.name = 'schedule-time';
    input.classList.add('schedule-time-input');
    scheduleContainer.appendChild(input);
}


// Remove All Schedule Time Inputs
function clearScheduleTimeInputs() {
    const scheduleContainer = document.getElementById('schedule-times-container');
    scheduleContainer.innerHTML = '';
}

// Get Current User
async function getCurrentUser() {
    try {
        const response = await fetch('/api/driver-dashboard/getCurrent', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        if (response.ok) return await response.json();
        console.error('Failed to fetch user data');
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    return null;
}

// Add Vehicle
async function submitAddVehicleForm(event) {
    event.preventDefault();
    const capacity = document.querySelector("#capacity").value;
    const plateNumber = document.querySelector("#plate-number").value;

    try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.user_id) {
            alert('Unable to fetch user data. Please try again.');
            return;
        }

        const payload = {
            capacity,
            plate_number: plateNumber,
            driver_id: currentUser.user_id,
        };

        const response = await fetch('/api/driver-dashboard/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert('Vehicle added successfully!');
            addVehicleModal.style.display = 'none';
        } else {
            alert(`Failed to add vehicle: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error adding vehicle:', error);
    }
}

// Logout Function
async function handleLogout() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) {
            alert('You have been logged out.');
            window.location.href = '/login';
        } else {
            alert(`Logout failed: ${(await response.json()).message}`);
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
addVehicleLink.addEventListener('click', (event) => {
    event.preventDefault();
    addVehicleModal.style.display = 'block';
});
closeAddVehicleModalBtn.addEventListener('click', () => {
    addVehicleModal.style.display = 'none';
});
document.querySelector("#addVehicleForm").addEventListener("submit", submitAddVehicleForm);

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', loadDriverData);

// Ride Type Change Listener
document.getElementById('ride-type').addEventListener('change', (event) => {
    const scheduleContainer = document.getElementById('schedule-time-container');
    if (!scheduleContainer) {
        console.error("schedule-time-container not found.");
        return;
    }

    if (event.target.value === 'scheduled') {
        scheduleContainer.style.display = 'block';
    } else {
        scheduleContainer.style.display = 'none';
        scheduleContainer.innerHTML = ''; // Clear inputs if switching back to "Now"
    }
});

