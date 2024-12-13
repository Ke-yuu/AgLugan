document.addEventListener('DOMContentLoaded', function () {
    
    window.onload = function () {
        if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
            window.location.reload();
        }
    };

    function setupSearch() {
        // Create search container for users
        const userSearchContainer = document.createElement('div');
        userSearchContainer.className = 'search-container';
        
        // Create user search input
        const userSearchInput = document.createElement('input');
        userSearchInput.type = 'text';
        userSearchInput.id = 'user-search';
        userSearchInput.className = 'search-input';
        userSearchInput.placeholder = 'Search users by name, email, or type...';
        
        // Create search container for rides
        const rideSearchContainer = document.createElement('div');
        rideSearchContainer.className = 'search-container';
        
        // Create ride search input
        const rideSearchInput = document.createElement('input');
        rideSearchInput.type = 'text';
        rideSearchInput.id = 'ride-search';
        rideSearchInput.className = 'search-input';
        rideSearchInput.placeholder = 'Search rides by location, status...';
        
        // Add inputs to their containers
        userSearchContainer.appendChild(userSearchInput);
        rideSearchContainer.appendChild(rideSearchInput);
    
        // Insert search components
        const usersList = document.getElementById('users-list');
        usersList.parentNode.insertBefore(userSearchContainer, usersList);
    
        const ridesTable = document.getElementById('rides-table');
        ridesTable.parentNode.insertBefore(rideSearchContainer, ridesTable);
    
        
        userSearchInput.addEventListener('input', debounce(function(e) {
            fetchUsers(e.target.value.trim());
        }, 300));
    
        rideSearchInput.addEventListener('input', debounce(function(e) {
            fetchRides(e.target.value.trim());
        }, 300));
    }
    // Initialize search inputs
    setupSearch();
    
    // Immediately fetch rides and users when the page loads
    fetchRides();
    fetchUsers();
    setupLogout();

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
            fetchUsers(); // Refresh the user list after adding a driver
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

// Setup Search Function
function setupSearch() {
    // Create search container for users
    const userSearchContainer = document.createElement('div');
    userSearchContainer.className = 'search-container';
    const userSearchInput = document.createElement('input');
    userSearchInput.type = 'text';
    userSearchInput.id = 'user-search';
    userSearchInput.className = 'search-input';
    userSearchInput.placeholder = 'Search users by name, email, or type...';
    userSearchContainer.appendChild(userSearchInput);

    // Create search container for rides
    const rideSearchContainer = document.createElement('div');
    rideSearchContainer.className = 'search-container';
    const rideSearchInput = document.createElement('input');
    rideSearchInput.type = 'text';
    rideSearchInput.id = 'ride-search';
    rideSearchInput.className = 'search-input';
    rideSearchInput.placeholder = 'Search rides by location, status...';
    rideSearchContainer.appendChild(rideSearchInput);

    // Insert search inputs
    const usersList = document.getElementById('users-list');
    usersList.parentNode.insertBefore(userSearchContainer, usersList);

    const ridesTable = document.getElementById('rides-table');
    ridesTable.parentNode.insertBefore(rideSearchContainer, ridesTable);

    // Add event listeners with debouncing
    userSearchInput.addEventListener('input', debounce(function(e) {
        fetchUsers(e.target.value);
    }, 300));

    rideSearchInput.addEventListener('input', debounce(function(e) {
        fetchRides(e.target.value);
    }, 300));
}

// Debounce function
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
            ridesList.innerHTML = ''; 

            if (!data || data.length === 0) {
                ridesList.innerHTML = `
                    <tr>
                        <td colspan="8" class="no-rides">No rides found</td>
                    </tr>`;
                return;
            }

            // Filter rides 
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
            ridesList.innerHTML = `
                <tr>
                    <td colspan="8" class="error-message">
                        Error loading rides. Please try again later.
                    </td>
                </tr>
            `;
        });
}


document.addEventListener('DOMContentLoaded', () => {
    // Get the ride search input and add the event listener
    const rideSearchInput = document.getElementById('ride-search');
    if (rideSearchInput) {
        rideSearchInput.addEventListener('input', (e) => {
            const searchValue = e.target.value.trim();
            fetchRides(searchValue);
        });
    }
    
    // Initial fetch of all rides
    fetchRides();
});

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
            usersList.innerHTML = ''; 

            if (data.length === 0) {
                usersList.innerHTML = '<li class="no-users">No users found</li>';
                return;
            }

            // Filter users 
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
                
                // Add click event for modal
                userElement.onclick = () => {
                    showUserModal(user);
                };
                
                usersList.appendChild(userElement);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            const usersList = document.getElementById('users-list');
            usersList.innerHTML = '<div class="error-message">Error loading users. Please try again later.</div>';
        });
}


document.addEventListener('DOMContentLoaded', () => {
    // Get the search input and add the event listener
    const userSearchInput = document.getElementById('user-search');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', (e) => {
            const searchValue = e.target.value.trim();
            fetchUsers(searchValue);
        });
    }
    
    // Initial fetch of all users
    fetchUsers();
});

// Update your setupSearch function to ensure proper event handling
function setupSearch() {
    const userSearchInput = document.getElementById('user-search');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', (e) => {
            fetchUsers(e.target.value.trim());
        });
    }
}

// Your existing functions remain the same
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