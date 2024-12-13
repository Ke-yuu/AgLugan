document.addEventListener('DOMContentLoaded', function () {
    // Check session status on page load
    fetch('/api/check-session', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'logged_in' || data.type !== 'admin') {
                // If not logged in, redirect to the login page
                alert('Your session has expired. Please log in again.');
                window.location.href = '/adminlogin';
            }
        })
        .catch(() => {
            alert('Error verifying session. Redirecting to login.');
            window.location.href = '/adminlogin';
        });

        window.onload = function () {
            if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward') {
                window.location.reload();
            }
        };    

    function setupSearch() {
        // Get existing search inputs
        const userSearchInput = document.getElementById('user-search');
        const rideSearchInput = document.getElementById('ride-search');
        
        // Add event listeners with debouncing
        if (userSearchInput) {
            userSearchInput.addEventListener('input', debounce(function(e) {
                fetchUsers(e.target.value.trim());
            }, 300));
        }

        if (rideSearchInput) {
            rideSearchInput.addEventListener('input', debounce(function(e) {
                fetchRides(e.target.value.trim());
            }, 300));
        }
    }

    // Initialize everything
    setupSearch();
    fetchRides();
    fetchUsers();
    setupLogout();

    // Form handlers setup
    const addDriverForm = document.getElementById('add-driver-form');
    const addIdForm = document.getElementById('add-id-form');

    // Add Driver form handler
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
            fetchUsers();
        } catch (error) {
            console.error('Error adding driver:', error);
            alert('Failed to add driver.');
        }
    });

    // Add ID Number form handler
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

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Data Fetching Functions
function fetchRides(searchQuery = '') {
    const url = searchQuery 
        ? `/api/rides?search=${encodeURIComponent(searchQuery)}`
        : '/api/rides';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Received rides data:', data);
            const ridesList = document.getElementById('rides-list');
            if (!ridesList) return;
            
            ridesList.innerHTML = ''; 

            if (!data || data.length === 0) {
                ridesList.innerHTML = `
                    <tr>
                        <td colspan="8" class="no-rides">No rides found</td>
                    </tr>`;
                return;
            }

            const filteredRides = searchQuery 
                ? data.filter(ride => 
                    ride.ride_id.toString().includes(searchQuery) ||
                    ride.start_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ride.end_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ride.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (ride.plate_number && ride.plate_number.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                : data;

            if (filteredRides.length === 0) {
                ridesList.innerHTML = `
                    <tr>
                        <td colspan="8" class="no-rides">No matching rides found</td>
                    </tr>`;
                return;
            }

            filteredRides.forEach(ride => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${ride.ride_id}</td>
                    <td>${ride.start_location}</td>
                    <td>${ride.end_location}</td>
                    <td style="color: ${ride.status === 'Loading' ? '#00FF00' : '#FFD700'}">${ride.status}</td>
                    <td>${ride.plate_number || 'N/A'}</td>
                    <td>₱${parseFloat(ride.fare).toFixed(2)}</td>
                    <td>${ride.time_range}</td>
                    <td>
                        <button class="remove-ride-btn" onclick="removeRide(${ride.ride_id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                ridesList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching rides:', error);
            const ridesList = document.getElementById('rides-list');
            if (ridesList) {
                ridesList.innerHTML = `
                    <tr>
                        <td colspan="8" class="error-message">
                            Error loading rides. Please try again later.
                        </td>
                    </tr>
                `;
            }
        });
}

function fetchUsers(searchQuery = '') {
    const url = searchQuery 
        ? `/api/vusers?search=${encodeURIComponent(searchQuery)}`
        : '/api/vusers';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Received users data:', data);
            const usersList = document.getElementById('users-list');
            if (!usersList) return;
            
            usersList.innerHTML = ''; 

            if (data.length === 0) {
                usersList.innerHTML = '<li class="no-users">No users found</li>';
                return;
            }

            const filteredUsers = searchQuery 
                ? data.filter(user => 
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.user_type.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : data;

            if (filteredUsers.length === 0) {
                usersList.innerHTML = '<li class="no-users">No matching users found</li>';
                return;
            }

            filteredUsers.forEach(user => {
                const userElement = document.createElement('li');
                userElement.className = 'user-item';
                userElement.textContent = `${user.name} (${user.email}) - ${user.user_type}`;
                userElement.setAttribute('data-user-id', user.user_id);
                userElement.onclick = () => showUserModal(user);
                usersList.appendChild(userElement);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            const usersList = document.getElementById('users-list');
            if (usersList) {
                usersList.innerHTML = '<div class="error-message">Error loading users. Please try again later.</div>';
            }
        });
}

// Modal and User Management Functions
function showUserModal(user) {
    const userModal = document.getElementById('user-modal');
    const modalContent = document.getElementById('user-modal-content');
    if (!userModal || !modalContent) return;

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
    if (userModal) {
        userModal.style.display = 'none';
    }
}

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
            fetchUsers();
            closeUserModal();
        } else {
            alert(data.message || 'Failed to ban user.');
        }
    } catch (error) {
        console.error('Error banning user:', error);
        alert('An error occurred while banning the user.');
    }
}

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