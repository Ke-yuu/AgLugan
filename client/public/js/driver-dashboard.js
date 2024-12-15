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
        loadScheduledRides(driverData.scheduledRides);
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

function calculateFare(startLocation, endLocation) {
    if (
        startLocation === "Igorot Garden" &&
        ["Barangay Hall", "Holy Family Parish Church"].includes(endLocation)
    ) {
        return 12;
    }
    if (
        startLocation === "Igorot Garden" &&
        ["SLU Mary Heights", "Phase 1", "Phase 2"].includes(endLocation)
    ) {
        return 13;
    }
    if (startLocation === "Igorot Garden" && endLocation === "Phase 3") {
        return 14;
    }

    if (
        startLocation === "Barangay Hall" &&
        ["Igorot Garden", "SM Baguio", "Burnham Park"].includes(endLocation)
    ) {
        return 12;
    }

    if (startLocation === "SLU Mary Heights" && endLocation === "Barangay Hall") {
        return 10;
    }
    if (
        startLocation === "SLU Mary Heights" &&
        ["SM Baguio", "Burnham Park", "Igorot Garden"].includes(endLocation)
    ) {
        return 13;
    }

    if (startLocation === "Phase 3" && ["SLU Mary Heights", "Barangay Hall"].includes(endLocation)) {
        return 10;
    }
    if (
        startLocation === "Phase 3" &&
        ["SM Baguio", "Burnham Park", "Igorot Garden"].includes(endLocation)
    ) {
        return 14;
    }

    // Default fare if no match
    return 0;
}

function setupDateTimePicker() {
    const scheduleTimeInput = document.getElementById('schedule-time');
    const now = new Date();

    // Round up to the nearest future 15-minute interval
    now.setSeconds(0, 0);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);

    // Set the minimum time (now) and step attribute (15 minutes)
    scheduleTimeInput.min = formatLocalDateTime(now);
    scheduleTimeInput.step = 900; // 15 minutes in seconds

    // Automatically adjust invalid inputs
    scheduleTimeInput.addEventListener('input', () => {
        const selectedTime = new Date(scheduleTimeInput.value);
        const roundedTime = roundToNearest15Minutes(selectedTime);

        // Update input field with rounded time
        scheduleTimeInput.value = formatLocalDateTime(roundedTime);
    });
}

// Helper function to round to the nearest 15 minutes
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

// Call this when the page loads
document.addEventListener('DOMContentLoaded', setupDateTimePicker);


async function submitQueueRideForm(event) {
    event.preventDefault();
    const currentUser = await getCurrentUser();
    if (!currentUser?.user_id) {
        alert("Unable to fetch user data. Please try again.");
        return;
    }

    const formData = new FormData(queueRideForm);
    const startLocation = formData.get("start-location");
    const endLocation = formData.get("end-location");
    const fare = calculateFare(startLocation, endLocation);
    const scheduleTimeInput = document.getElementById('schedule-time');
    const selectedTime = new Date(scheduleTimeInput.value);
    const now = new Date();

    if (fare === 0) {
        alert("Invalid start or end location. Please try again.");
        return;
    }

    const payload = {
        driver_id: currentUser.user_id,
        vehicle_id: formData.get("vehicle-id"),
        start_location: startLocation,
        end_location: endLocation,
        fare: fare, // Add fare to payload
        type: formData.get("ride-type"),
    };

        // Check if selected time is in the past
        if (selectedTime < now) {
            alert('Selected time is in the past. Please pick a valid time.');
            return;
        }
    
        // Additional logic for checking 15-minute intervals
        if (selectedTime.getMinutes() % 15 !== 0) {
            alert('Please select a time that aligns with 15-minute intervals (e.g., 10:00, 10:15).');
            return;
        }

    if (payload.type === "scheduled") {
        const scheduleTime = formData.get("schedule-time");
        if (!scheduleTime) {
            alert("Please provide a valid schedule time for the ride.");
            return;
        }
        payload.schedule_time = scheduleTime;
    }

    try {
        const response = await fetch("/api/driver-dashboard/queue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
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

function loadQueuedRides(rides) {
    const queuedRidesList = document.getElementById('queued-rides-list');
    queuedRidesList.innerHTML = '';

    if (rides.length > 0) {
        rides.forEach(ride => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${ride.plate_number || 'N/A'}</td>
                <td>${ride.start_location || 'N/A'}</td>
                <td>${ride.end_location || 'N/A'}</td>
                <td>${ride.status || 'N/A'}</td>
                <td>${ride.time_range || 'N/A'}</td>
            `;

            queuedRidesList.appendChild(row);
        });
    } else {
        queuedRidesList.innerHTML = '<tr><td colspan="5">No queued rides available</td></tr>';
    }
}

function loadOngoingQueue(rides) {
    const queuedRidesList = document.getElementById('ongoing-queue-list');
    queuedRidesList.innerHTML = '';

    if (rides.length > 0) {
        rides.forEach(ride => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${ride.plate_number || 'N/A'}</td>
                <td>${ride.start_location || 'N/A'}</td>
                <td>${ride.end_location || 'N/A'}</td>
                <td>${ride.status || 'N/A'}</td>
                <td>${ride.time_range || 'N/A'}</td>
            `;

            queuedRidesList.appendChild(row);
        });
    } else {
        queuedRidesList.innerHTML = '<tr><td colspan="5">No queued rides available</td></tr>';
    }
}

function loadScheduledRides(rides) {
    const queuedRidesList = document.getElementById('scheduled-queue-list');
    queuedRidesList.innerHTML = '';

    if (rides.length > 0) {
        rides.forEach(ride => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${ride.plate_number || 'N/A'}</td>
                <td>${ride.start_location || 'N/A'}</td>
                <td>${ride.end_location || 'N/A'}</td>
                <td>${ride.status || 'N/A'}</td>
                <td>${ride.time_range || 'N/A'}</td>
            `;

            queuedRidesList.appendChild(row);
        });
    } else {
        queuedRidesList.innerHTML = '<tr><td colspan="5">No queued rides available</td></tr>';
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

    // Show or hide the date-time picker based on the selected ride type
    if (event.target.value === 'scheduled') {
        scheduleContainer.style.display = 'block'; // Show the date-time picker
    } else {
        scheduleContainer.style.display = 'none'; // Hide the date-time picker
    }
});

function disableSameLocation() {
    const startLocationSelect = document.getElementById('start-location');
    const endLocationSelect = document.getElementById('end-location');

    // Event listener for Start Location change
    startLocationSelect.addEventListener('change', () => {
        const selectedStart = startLocationSelect.value;

        // Loop through End Location options
        for (let option of endLocationSelect.options) {
            if (option.value === selectedStart) {
                option.disabled = true; // Disable the same location
                option.style.color = 'gray'; // Visually gray it out
            } else {
                option.disabled = false; // Re-enable other options
                option.style.color = ''; // Reset color
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    loadDriverData(); // Existing function
    disableSameLocation(); // New feature
});


