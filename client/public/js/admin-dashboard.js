// Update your admin-dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Immediately fetch rides when page loads
    fetchRides();
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
                ridesList.innerHTML = "<div class='no-available-rides'>No rides available</div>";
            } else {
                ridesList.innerHTML = ''; // Clear existing content
                data.forEach(ride => {
                    const rideElement = document.createElement('div');
                    rideElement.className = 'ride-info';
                    rideElement.innerHTML = `
                        <div class="ride-info-header">Ride ID: ${ride.ride_id}</div>
                        <div class="ride-details">
                            <div><strong>From:</strong> ${ride.start_location}</div>
                            <div><strong>To:</strong> ${ride.end_location}</div>
                            <div><strong>Status:</strong> ${ride.status || 'N/A'}</div>
                            ${ride.plate_number ? `<div><strong>Vehicle:</strong> ${ride.plate_number}</div>` : ''}
                            ${ride.fare ? `<div><strong>Fare:</strong> ₱${ride.fare}</div>` : ''}
                            ${ride.waiting_time ? `<div><strong>Wait Time:</strong> ${ride.waiting_time}</div>` : ''}
                            ${ride.time_range ? `<div><strong>Time Range:</strong> ${ride.time_range}</div>` : ''}
                        </div>
                    `;
                    ridesList.appendChild(rideElement);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching rides:', error);
            const ridesList = document.getElementById('rides-list');
            ridesList.innerHTML = `
                <div class="error-message">
                    Error loading rides. Please try again later.
                </div>
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
            const usersList = document.getElementById('users-list');
            usersList.innerHTML = ''; // Clear existing content

            data.forEach(user => {
                const userElement = document.createElement('li');
                userElement.textContent = `${user.name} (${user.email}) - ${user.user_type}`;
                usersList.appendChild(userElement);
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

// Call fetchUsers when the page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchUsers();
    fetchRides();
});