// driver-dashboard.js

// DOM Elements
const driverNameSpan = document.getElementById('driver-name');
const activeRidesList = document.getElementById('active-rides-list');
const totalEarningsSpan = document.getElementById('total-earnings');
const completedRidesList = document.getElementById('completed-rides-list');
const availabilityToggle = document.getElementById('availability-toggle');

// Mock Data (to be replaced with API or backend calls)
const driverData = {
    name: "John Doe",
    earnings: 1250.50,
    activeRides: [
        {
            id: "RIDE123",
            passenger: "Alice Smith",
            from: "Station A",
            to: "Station B",
            status: "In Progress",
        },
    ],
    completedRides: [
        {
            id: "RIDE121",
            passenger: "Bob Johnson",
            fare: 150.00,
        },
        {
            id: "RIDE122",
            passenger: "Clara Lee",
            fare: 200.00,
        },
    ],
    availability: true,
};

// Utility Functions
function formatCurrency(value) {
    return `₱${value.toFixed(2)}`;
}

// Load Driver Data
function loadDriverData() {
    // Set Driver Name
    driverNameSpan.textContent = driverData.name;

    // Set Availability Toggle
    availabilityToggle.checked = driverData.availability;

    // Load Active Rides
    loadActiveRides();

    // Load Earnings Overview
    loadEarnings();
}

// Load Active Rides
function loadActiveRides() {
    activeRidesList.innerHTML = ""; // Clear the list

    if (driverData.activeRides.length === 0) {
        activeRidesList.innerHTML = "<li>No active rides at the moment.</li>";
        return;
    }

    driverData.activeRides.forEach((ride) => {
        const rideItem = document.createElement('li');
        rideItem.className = 'ride-item';

        rideItem.innerHTML = `
            <h3>Ride ID: ${ride.id}</h3>
            <p><strong>Passenger:</strong> ${ride.passenger}</p>
            <p><strong>From:</strong> ${ride.from}</p>
            <p><strong>To:</strong> ${ride.to}</p>
            <p><strong>Status:</strong> ${ride.status}</p>
            <button class="mark-completed-btn" data-ride-id="${ride.id}">Mark as Completed</button>
        `;

        activeRidesList.appendChild(rideItem);
    });

    // Add Event Listeners for "Mark as Completed" buttons
    document.querySelectorAll('.mark-completed-btn').forEach((button) => {
        button.addEventListener('click', markRideAsCompleted);
    });
}

// Load Earnings
function loadEarnings() {
    // Update Total Earnings
    totalEarningsSpan.textContent = formatCurrency(driverData.earnings);

    // Load Completed Rides
    completedRidesList.innerHTML = ""; // Clear the list

    if (driverData.completedRides.length === 0) {
        completedRidesList.innerHTML = "<li>No completed rides.</li>";
        return;
    }

    driverData.completedRides.forEach((ride) => {
        const rideItem = document.createElement('li');
        rideItem.className = 'completed-ride-item';

        rideItem.innerHTML = `
            <p><strong>Ride ID:</strong> ${ride.id}</p>
            <p><strong>Passenger:</strong> ${ride.passenger}</p>
            <p><strong>Fare:</strong> ${formatCurrency(ride.fare)}</p>
        `;

        completedRidesList.appendChild(rideItem);
    });
}

// Mark Ride as Completed
function markRideAsCompleted(event) {
    const rideId = event.target.getAttribute('data-ride-id');
    const rideIndex = driverData.activeRides.findIndex((ride) => ride.id === rideId);

    if (rideIndex > -1) {
        const completedRide = driverData.activeRides.splice(rideIndex, 1)[0];
        completedRide.fare = 100; // Mocked fare; should come from backend
        driverData.completedRides.push(completedRide);

        // Update Earnings
        driverData.earnings += completedRide.fare;

        // Reload Data
        loadActiveRides();
        loadEarnings();
    }
}

// Toggle Availability
function toggleAvailability() {
    driverData.availability = availabilityToggle.checked;
    alert(`You are now ${driverData.availability ? "available" : "unavailable"} for rides.`);
}

// Event Listeners
availabilityToggle.addEventListener('change', toggleAvailability);

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', loadDriverData);
