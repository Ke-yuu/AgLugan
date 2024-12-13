document.addEventListener('DOMContentLoaded', function () {
  // Disable browser cache for back button
  window.onload = function () {
    if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
      window.location.reload();
    }
  };

    // Immediately fetch rides and users when the page loads
    fetchRides();
    fetchUsers();
    setupLogout();

    const addDriverForm = document.getElementById('add-driver-form');
    const addIdForm = document.getElementById('add-id-form');

// Add Driver
addDriverForm?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('driver-username').value.trim();
    const name = document.getElementById('driver-name').value.trim();
    const password = document.getElementById('driver-password').value.trim();
    const driverId = document.getElementById('driver-id').value.trim();
    const plateNumber = document.getElementById('plate-number').value.trim();
    const vehicleCapacity = document.getElementById('vehicle-capacity').value.trim();

    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    try {
        const response = await fetch('/api/add-driver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, name, password, driverId, plateNumber, vehicleCapacity }),
        });

        const data = await response.json();
        alert(data.message || 'Driver added successfully.');
        fetchUsers(); // Refresh the user list after adding a driver
    } catch (error) {
        console.error('Error adding driver:', error);
        alert('Failed to add driver.');
    }
});

    // Add ID Number
    addIdForm?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const idNumber = document.getElementById('id-number').value.trim();
        const idType = document.getElementById('id-type').value;

        try {
            const response = await fetch('/api/add-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idNumber, idType }),
            });

            const data = await response.json();
            alert(data.message || 'ID number added successfully.');
        } catch (error) {
            console.error('Error adding ID number:', error);
            alert('Failed to add ID number.');
        }
    });
});


function fetchRides() {
    fetch('/api/rides')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const ridesList = document.getElementById('rides-list');

            if (data.length === 0) {
                ridesList.innerHTML = `
                    <tr>
                        <td colspan="8" class="no-rides">No rides available</td>
                    </tr>`;
            } else {
                ridesList.innerHTML = ''; // Clear existing content
                data.forEach(ride => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${ride.ride_id}</td>
                        <td>${ride.start_location}</td>
                        <td>${ride.end_location}</td>
                        <td class="status-${ride.status?.toLowerCase()}">${ride.status || 'N/A'}</td>
                        <td>${ride.plate_number || 'N/A'}</td>
                        <td>₱${ride.fare || '0'}</td>
                        <td>${ride.time_range || 'N/A'}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="remove-ride-btn" onclick="removeRide(${ride.ride_id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    ridesList.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching rides:', error);
            const ridesList = document.getElementById('rides-list');
            ridesList.innerHTML = `
                <tr>
                    <td colspan="8" class="error-message">
                        Error loading rides. Please try again later.
                    </td>
                </tr>
            `;
        });
}

function fetchUsers() {
    fetch('/api/vusers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched users with phone and ID:', data); // Log to verify
            const usersList = document.getElementById('users-list');
            usersList.innerHTML = ''; // Clear existing content

            data.forEach(user => {
                const userElement = document.createElement('li');
                userElement.className = 'user-item';
                userElement.textContent = `
                    ${user.name} (${user.email}) - ${user.user_type} 
                `;
                userElement.setAttribute('data-user-id', user.user_id);
                usersList.appendChild(userElement);
            
                // Add click event for modal interaction
                userElement.onclick = () => {
                    showUserModal(user);
                };
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            const usersList = document.getElementById('users-list');
            usersList.innerHTML = `
                <div class="error-message">
                    Error loading users. Please try again later.
                </div>
            `;
        });
}

function showUserModal(user) {
    console.log('User object:', user);
    const userModal = document.getElementById('user-modal');
    const modalContent = document.getElementById('user-modal-content');

    modalContent.innerHTML = `
        <h2>User Details</h2>
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone Number:</strong> ${user.phone_number || 'N/A'}</p>
        <p><strong>ID Number:</strong> ${user.id_number || 'N/A'}</p>
        <button class="ban-user-btn" onclick="banUser(${user.user_id})">Ban User</button>
        <button class="close-user-modal" onclick="closeUserModal()">Close</button>
    `;

    userModal.style.display = 'block';
}

function closeUserModal() {
    const userModal = document.getElementById('user-modal');
    userModal.style.display = 'none';
}

// Remove Ride
function removeRide(rideId) {
    if (confirm('Are you sure you want to delete this ride?')) {
        fetch(`/api/delete-ride/${rideId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Ride deleted successfully.');
                fetchRides();
            })
            .catch(error => console.error('Error deleting ride:', error));
    }
}

async function banUser(userId) {
    try {
        const response = await fetch(`/api/delete-user/${userId}`, { method: 'DELETE' });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        const data = await response.json();
        if (data.status === 'success') {
            alert('User successfully banned.');
            fetchUsers(); // Refresh the user list
            closeUserModal();
        } else {
            alert(data.message || 'Failed to ban user.');
        }
    } catch (error) {
        console.error('Error banning user:', error);
        alert('An error occurred while banning the user.');
    }
}

// Logout setup
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            fetch('/api/logout', { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        alert('You have been logged out.');
                        window.location.href = '/adminLogin';
                    } else {
                        throw new Error('Failed to log out properly.');
                    }
                })
                .catch(error => {
                    console.error('Error during logout:', error);
                    alert('An error occurred while trying to log out. Please try again.');
                });
        });
    }
}

