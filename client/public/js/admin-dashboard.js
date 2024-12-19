document.addEventListener('DOMContentLoaded', function () {

    // Check session status on page load
    fetch('/api/check-session', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'logged_in' || data.type !== 'admin') {
                showModal('Your session has expired. Please log in again.', () => {
                    window.location.href = '/adminlogin';
                });
            }
        })
        .catch(() => {
            showModal('Error verifying session. Redirecting to login.', () => {
                window.location.href = '/adminlogin';
            });
        });

    window.onload = function () {
        if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward') {
            window.location.reload();
        }
    };

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showModal('You have been logged out.', () => {
                window.location.href = '/adminLogin';
            });
        });
    }

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
            showModal(data.message || 'Driver and vehicle added successfully.');
            fetchUsers();
            addDriverForm.reset();
        } else {
            showModal(data.message || 'Failed to add driver.');
        }
    } catch (error) {
        console.error('Error adding driver:', error);
        showModal('An unexpected error occurred while adding the driver.');
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
            showModal(data.message || 'ID number added successfully.');
            addIdForm.reset();
        } catch (error) {
            console.error('Error adding ID number:', error);
            showModal('Failed to add ID number.');
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
                        <td colspan="9" class="no-rides">No rides found</td>
                    </tr>`;
                return;
            }

            data.forEach(ride => {
                const statusClass = getStatusClass(ride.status);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${ride.ride_id}</td>
                    <td>${ride.start_location}</td>
                    <td>${ride.end_location}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${ride.status}</span>
                    </td>
                    <td>${ride.plate_number || 'N/A'}</td>
                    <td>₱${parseFloat(ride.fare).toFixed(2)}</td>
                    <td>${ride.time_range}</td>
                    <td>${ride.seat_status || '0/23'}</td>
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
                        <td colspan="9" class="error-message">
                            Error loading rides. Please try again later.
                        </td>
                    </tr>
                `;
            }
        });
}

// Utility function to map status to CSS class
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'scheduled': return 'status-scheduled'; // Yellow
        case 'in queue': return 'status-in-queue'; // Orange
        case 'done': return 'status-done'; // Green
        default: return 'status-default'; // Gray
    }
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

    console.log('User data in modal:', user);

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
        // Ensure the event listener is added only once
        banButton.removeEventListener('click', handleBanUserClick); // Avoid multiple event listeners
        banButton.addEventListener('click', handleBanUserClick.bind(null, user.user_id)); // Use bind to pass the userId
    }

    // Show user modal
    modal.style.display = 'flex';
    document.addEventListener('keydown', handleEscapeKey);
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeUserModal();
        }
    };
}

function handleBanUserClick(userId) {
    banUser(userId); // Call the ban function with the userId
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
    // Create the modal container
    const modal2 = document.createElement('div');
    modal2.classList.add('modal');

    // Create the modal content
    const modalContent2 = document.createElement('div');
    modalContent2.classList.add('modal-content');
    modal2.appendChild(modalContent2);

    // Add the message to the modal content
    const confirmationMessage2 = document.createElement('p');
    confirmationMessage2.textContent = 'Are you sure you want to delete this ride?';
    modalContent2.appendChild(confirmationMessage2);

    // Create action buttons (Yes and No)
    const modalActions2 = document.createElement('div');
    modalActions2.classList.add('modal-actions');
    modalContent2.appendChild(modalActions2);

    const confirmButton2 = document.createElement('button');
    confirmButton2.textContent = 'Yes';
    confirmButton2.classList.add('confirm');
    modalActions2.appendChild(confirmButton2);

    const cancelButton2 = document.createElement('button');
    cancelButton2.textContent = 'No';
    cancelButton2.classList.add('cancel');
    modalActions2.appendChild(cancelButton2);

    // Append the modal to the body
    document.body.appendChild(modal2);

    // Show the modal
    modal2.style.display = 'block';

    // Handle "Yes" (Confirm Delete)
    confirmButton2.onclick = function() {
        fetch(`/api/delete-ride/${rideId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                // Show success message (or any response message)
                showModal(data.message || 'Ride deleted successfully.');
                fetchRides();  // Refresh the ride list
            })
            .catch(error => console.error('Error deleting ride:', error));

        // Remove the modal from the DOM after confirmation
        document.body.removeChild(modal2);
    };

    // Handle "No" (Cancel Delete)
    cancelButton2.onclick = function() {
        // Remove the modal from the DOM without doing anything
        document.body.removeChild(modal2);
    };

    // Close modal when clicking outside of the modal content
    window.onclick = function(event) {
        if (event.target === modal2) {
            document.body.removeChild(modal2);
        }
    };
}

// Styles for the modal (injecting styles dynamically)
const style2 = document.createElement('style');
style2.innerHTML = `
     .modal {
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .modal-content {
        background-color: white;
        margin: 15% auto;
        padding: 20px;
        border: 1px solid #ccc;
        width: 80%;
        max-width: 400px;
    }

    .modal-actions {
        display: flex;
        justify-content: center; /* Center the buttons */
        gap: 10px; /* Adds a small gap between buttons */
        margin-top: 10px;
    }

    button {
        padding: 10px;
        border: none;
        cursor: pointer;
        width: 45%; /* Adjust width to make buttons more balanced */
    }

    button.confirm {
        background-color: #4CAF50; /* Green for 'Yes' */
        color: white;
    }

    button.cancel {
        background-color: #f44336; /* Red for 'No' */
        color: white;
    }
`;
document.head.appendChild(style2);

   // Create and append modal container for popups
   const modalContainer = document.createElement('div');
   modalContainer.id = 'popup-modal';
   modalContainer.innerHTML = `
       <div class="modal-content">
           <p id="modal-message"></p>
           <button id="close-modal">Close</button>
       </div>
   `;
   document.body.appendChild(modalContainer);
   console.log('Modal container appended:', modalContainer);
   
   // Modal styles
   const modalStyles = document.createElement('style');
   modalStyles.textContent = `
   #popup-modal {
       display: none;
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: rgba(0, 0, 0, 0.6);
       justify-content: center;
       align-items: center;
       z-index: 1000;
   }
   .modal-content {
       background: #1b1b1b;
       color: #f8f8f8;
       padding: 20px;
       border-radius: 10px;
       box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
       text-align: center;
       width: 50%;
       max-width: 400px;
   }
   .modal-content button {
       margin-top: 15px;
       background: #ff0000;
       border: none;
       padding: 10px 20px;
       color: #fff;
       border-radius: 5px;
       cursor: pointer;
       transition: background 0.3s;
   }
   .modal-content button:hover {
       background: #cc0000;
   }
   `;
   document.head.appendChild(modalStyles);
   
   const showModal = (message, callback = null) => {
       const modal = document.getElementById('popup-modal');
       const messageContainer = document.getElementById('modal-message');
       const closeButton = document.getElementById('close-modal');
   
       messageContainer.textContent = message;
       modal.style.display = 'flex';
       console.log('Modal is now visible:', modal.style.display);  // Debugging
       closeButton.onclick = () => {
           modal.style.display = 'none';
           if (callback) callback(); // Execute callback if provided
       };
   };
async function banUser(userId) {
    try {
        const response = await fetch(`/api/delete-user/${userId}`, { method: 'DELETE' });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        const data = await response.json();

        if (data.status === 'success') {
            console.log('User banned successfully');
            // Show modal with success message
            showModal('User successfully banned.', () => {
                fetchUsers(); // Fetch updated user list after banning user
                closeUserModal(); // Close the user modal
            });
        } else {
            // Show modal with error message if banning fails
            showModal(data.message || 'Failed to ban user.');
        }
    } catch (error) {
        console.error('Error banning user:', error);
        showModal('An error occurred while banning the user.');
    }
}



function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            fetch('/api/logout', { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        showModal('You have been logged out.');
                        window.location.href = '/adminLogin';
                    } else {
                        throw new Error('Failed to log out properly.');
                    }
                })
                .catch(error => {
                    console.error('Error during logout:', error);
                    showModal('An error occurred while trying to log out. Please try again.');
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

    // Replace the existing h2 element and move it into the container
    existingHeader.parentNode.replaceChild(headerContainer, existingHeader);
    headerContainer.appendChild(existingHeader);

    // Create the refresh button
    const refreshButton = document.createElement('button');
    refreshButton.id = 'refreshRidesButton';
    refreshButton.className = 'refresh-btn';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Status';

    // Add button styles dynamically
    Object.assign(refreshButton.style, {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '1rem',
        transition: 'background-color 0.3s ease'
    });

    // Hover effects
    refreshButton.addEventListener('mouseover', () => {
        refreshButton.style.backgroundColor = '#45a049';
    });
    refreshButton.addEventListener('mouseout', () => {
        refreshButton.style.backgroundColor = '#4CAF50';
    });

    // Button click behavior: Fetch updated ride data
    refreshButton.addEventListener('click', async () => {
        try {
            refreshButton.disabled = true;
            refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

            console.log('Fetching updated ride statuses...');
            await fetchRides(); // Refresh the ride list on the frontend

            refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Status';
        } catch (error) {
            console.error('Error refreshing ride statuses:', error);
            alert('Failed to refresh ride statuses. Please try again.');
        } finally {
            refreshButton.disabled = false;
        }
    });

    // Append the refresh button to the header container
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

        await fetchRides(); // Fetch updated rides and refresh table

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
