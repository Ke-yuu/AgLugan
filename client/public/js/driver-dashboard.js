// DOM Elements
const driverNameSpan = document.getElementById('driver-name');
const activeRidesList = document.getElementById('active-rides-list');
const totalEarningsSpan = document.getElementById('total-earnings');
const completedRidesList = document.getElementById('completed-rides-list');
const availabilityToggle = document.getElementById('availability-toggle');

// Mock Data (to be replaced with API or backend calls)
const driverData = {
    name: "John Doe",
    completedRides: [
        {
            id: "RIDE121",
            passenger: "Bob Johnson",
            fare: 230.00,
            date: "2024-12-07", // Date in YYYY-MM-DD format
        },
        {
            id: "122",
            fare: 260.00,
            date: "2024-12-06",
        },
    ],
    activeRides: [
        {
            id: "241",
            from: "SLU Mary Heights",
            to: "Igorot Park",
            status: "In Progress",
        },
    ],
    availability: true,
};

// Utility Functions
function formatCurrency(value) {
    return `₱${value.toFixed(2)}`;
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
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

// Load Earnings (Filter today's rides and update the UI)
function loadEarnings() {
    // Get today's date
    const today = getTodayDate();

    // Filter today's completed rides
    const todayRides = driverData.completedRides.filter((ride) => ride.date === today);

    // Calculate today's earnings
    const todayEarnings = todayRides.reduce((total, ride) => total + ride.fare, 0);

    // Update Total Earnings
    totalEarningsSpan.textContent = formatCurrency(todayEarnings);

    // Load Completed Rides for Today
    completedRidesList.innerHTML = ""; // Clear the list

    if (todayRides.length === 0) {
        completedRidesList.innerHTML = "<li>No completed rides for today.</li>";
        return;
    }

    todayRides.forEach((ride) => {
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
        completedRide.date = getTodayDate(); // Set today's date for the ride
        driverData.completedRides.push(completedRide);

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
