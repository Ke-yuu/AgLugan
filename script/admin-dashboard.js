// admin-dashboard.js

// DOM Elements
const ridesList = document.getElementById('rides-list');
const usersList = document.getElementById('users-list');
const addRideBtn = document.getElementById('addRideBtn');
const rideModal = document.getElementById('rideModal');
const closeRideModalBtn = document.getElementById('closeRideModalBtn');
const rideForm = document.getElementById('rideForm');
const rideModalTitle = document.getElementById('rideModalTitle');
const rideFormSubmit = document.getElementById('rideFormSubmit');

// Mock Data
let rides = [
    { id: 'RIDE123', start: 'Station A', end: 'Station B' },
    { id: 'RIDE124', start: 'Station C', end: 'Station D' },
];

let users = [
    { id: 'USER123', name: 'John Doe', status: 'Active' },
    { id: 'USER124', name: 'Jane Smith', status: 'Active' },
];

// Modal State
let isEditing = false;
let editingRideId = null;

// Functions to Render Lists
function renderRides() {
    ridesList.innerHTML = ''; // Clear the list

    rides.forEach((ride) => {
        const rideItem = document.createElement('li');
        rideItem.className = 'ride-item';

        rideItem.innerHTML = `
            <h3>Ride ID: ${ride.id}</h3>
            <p><strong>From:</strong> ${ride.start}</p>
            <p><strong>To:</strong> ${ride.end}</p>
            <button class="update-ride-btn" data-ride-id="${ride.id}">Update</button>
            <button class="delete-ride-btn" data-ride-id="${ride.id}">Delete</button>
        `;

        ridesList.appendChild(rideItem);
    });

    // Add Event Listeners for Update/Delete
    document.querySelectorAll('.update-ride-btn').forEach((btn) =>
        btn.addEventListener('click', openUpdateRideModal)
    );

    document.querySelectorAll('.delete-ride-btn').forEach((btn) =>
        btn.addEventListener('click', deleteRide)
    );
}

function renderUsers() {
    usersList.innerHTML = ''; // Clear the list

    users.forEach((user) => {
        const userItem = document.createElement('li');
        userItem.className = 'user-item';

        userItem.innerHTML = `
            <h3>User: ${user.name}</h3>
            <p><strong>Status:</strong> ${user.status}</p>
            <button class="block-user-btn" data-user-id="${user.id}">
                ${user.status === 'Active' ? 'Block User' : 'Unblock User'}
            </button>
        `;

        usersList.appendChild(userItem);
    });

    // Add Event Listeners for Block/Unblock
    document.querySelectorAll('.block-user-btn').forEach((btn) =>
        btn.addEventListener('click', toggleUserBlock)
    );
}

// Add Ride
function openAddRideModal() {
    isEditing = false;
    rideModalTitle.textContent = 'Add Ride';
    rideForm.reset();
    rideModal.style.display = 'block';
}

// Update Ride
function openUpdateRideModal(event) {
    isEditing = true;
    rideModalTitle.textContent = 'Update Ride';

    const rideId = event.target.getAttribute('data-ride-id');
    const ride = rides.find((r) => r.id === rideId);

    document.getElementById('ride-id').value = ride.id;
    document.getElementById('start-location').value = ride.start;
    document.getElementById('end-location').value = ride.end;

    editingRideId = rideId;
    rideModal.style.display = 'block';
}

// Delete Ride
function deleteRide(event) {
    const rideId = event.target.getAttribute('data-ride-id');
    rides = rides.filter((ride) => ride.id !== rideId);
    renderRides();
}

// Save Ride (Add/Update)
rideForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const rideId = document.getElementById('ride-id').value;
    const startLocation = document.getElementById('start-location').value;
    const endLocation = document.getElementById('end-location').value;

    if (isEditing) {
        const rideIndex = rides.findIndex((r) => r.id === editingRideId);
        if (rideIndex > -1) {
            rides[rideIndex] = { id: rideId, start: startLocation, end: endLocation };
        }
    } else {
        rides.push({ id: rideId, start: startLocation, end: endLocation });
    }

    rideModal.style.display = 'none';
    renderRides();
});

// Block/Unblock User
function toggleUserBlock(event) {
    const userId = event.target.getAttribute('data-user-id');
    const user = users.find((u) => u.id === userId);

    if (user) {
        user.status = user.status === 'Active' ? 'Blocked' : 'Active';
    }

    renderUsers();
}

// Close Modal
closeRideModalBtn.addEventListener('click', () => {
    rideModal.style.display = 'none';
});

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    renderRides();
    renderUsers();
});

// Add Ride Button
addRideBtn.addEventListener('click', openAddRideModal);
