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

    // Add close button handler
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeUserModal);
    }

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

    const styles = `
.refresh-btn {
    background-color: #4CAF50;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.3s;
}

.refresh-btn:hover {
    background-color: #45a049;
}

.refresh-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.refresh-btn i {
    font-size: 14px;
}
`;
    // Initialize everything
    setupSearch();
    fetchRides();
    fetchUsers();
    setupLogout();
    setupRefreshButton();

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

    if (!username || !name || !password || !driverId || !plateNumber || !vehicleCapacity) {
        alert('All fields are required.');
        return;
    }

    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }
    const plateNumberRegex = /^[A-Z]{3} \d{3,4}$/;
    if (!plateNumberRegex.test(plateNumber)) {
        alert('Plate number must be in the format "ABC 123" or "ABC 1234".');
        return;
    }

    try {
        const response = await fetch('/api/add-driver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, name, password, driverId, plateNumber, vehicleCapacity }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || 'Driver and vehicle added successfully.');
            fetchUsers();
            addDriverForm.reset();
        } else {
            alert(data.message || 'Failed to add driver.');
        }
    } catch (error) {
        console.error('Error adding driver:', error);
        alert('An unexpected error occurred while adding the driver.');
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
            addIdForm.reset();
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

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeUserModal();
    }
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
            console.log('Frontend - Full received data:', data);
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
                userElement.style.cursor = 'pointer';
                
                // Log individual user data before showing modal
                userElement.addEventListener('click', () => {
                    console.log('Clicked user data:', user);
                    showUserModal(user);
                });
                
                usersList.appendChild(userElement);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            const usersList = document.getElementById('users-list');
            if (usersList) {
                usersList.innerHTML = '<li class="error-message">Error loading users. Please try again later.</li>';
            }
        });
}
function showUserModal(user) {
    const modal = document.getElementById('user-modal');
    if (!modal) return;

    console.log('User data in modal:', user); // Debug log

    // Update modal content with null checks and proper property access
    document.getElementById('modal-username').textContent = user.username || 'N/A';
    document.getElementById('modal-name').textContent = user.name || 'N/A';
    document.getElementById('modal-email').textContent = user.email || 'N/A';
    document.getElementById('modal-number').textContent = 
        user.phone_number !== null && user.phone_number !== undefined ? user.phone_number : 'N/A';
    document.getElementById('modal-id-number').textContent = 
        user.id_number !== null && user.id_number !== undefined ? user.id_number : 'N/A';

    // Set up ban button
    const banButton = document.getElementById('banUserButton');
    if (banButton) {
        banButton.onclick = () => banUser(user.user_id);
    }

    // Show modal
    modal.style.display = 'flex';
    document.addEventListener('keydown', handleEscapeKey);

    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);

    // Set up click outside to close
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeUserModal();
        }
    };
}

// Utility function to format phone numbers
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    // Remove non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format as XXX-XXX-XXXX
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}

function closeUserModal() {
    const modal = document.getElementById('user-modal');
    if (modal) {
        modal.style.display = 'none';
        // Clean up event listener
        document.removeEventListener('keydown', handleEscapeKey);
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

function setupRefreshButton() {
    const ridesSection = document.querySelector('.full-width-section');
    if (!ridesSection) return;

    // Get the existing h2 element
    const existingHeader = ridesSection.querySelector('h2');
    if (!existingHeader) return;

    // Create header container
    const headerContainer = document.createElement('div');
    headerContainer.className = 'rides-header';
    headerContainer.style.display = 'flex';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.justifyContent = 'space-between';
    headerContainer.style.marginBottom = '1rem';

    // Move the existing h2 into the container
    existingHeader.parentNode.replaceChild(headerContainer, existingHeader);
    headerContainer.appendChild(existingHeader);

    // Create refresh button
    const refreshButton = document.createElement('button');
    refreshButton.id = 'refreshRidesButton';
    refreshButton.className = 'refresh-btn';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Status';
    
    // Add styles
    refreshButton.style.backgroundColor = '#4CAF50';
    refreshButton.style.color = 'white';
    refreshButton.style.padding = '8px 16px';
    refreshButton.style.border = 'none';
    refreshButton.style.borderRadius = '4px';
    refreshButton.style.cursor = 'pointer';
    refreshButton.style.display = 'inline-flex';
    refreshButton.style.alignItems = 'center';
    refreshButton.style.gap = '8px';

    // Add hover effect
    refreshButton.addEventListener('mouseover', () => {
        refreshButton.style.backgroundColor = '#45a049';
    });
    refreshButton.addEventListener('mouseout', () => {
        refreshButton.style.backgroundColor = '#4CAF50';
    });

    
    refreshButton.addEventListener('click', refreshRideStatus);

    
    headerContainer.appendChild(refreshButton);
}

async function refreshRideStatus() {
    console.log('Refresh status function called'); 
    
    const refreshButton = document.getElementById('refreshRidesButton');
    if (!refreshButton) {
        console.error('Refresh button not found');
        return;
    }

    try {
        refreshButton.disabled = true;
        refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        
        console.log('Making fetch request to update-ride-status'); 
        const response = await fetch('/api/update-ride-status', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include' 
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data); 

        await fetchRides();

        refreshButton.disabled = false;
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Status';

    } catch (error) {
        console.error('Detailed error:', error); 
        alert('Failed to refresh ride status. Please try again.');
        
        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Status';
        }
    }
}
