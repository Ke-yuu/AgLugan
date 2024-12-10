document.addEventListener('DOMContentLoaded', function () {
  // Disable browser cache for back button
  window.onload = function () {
    if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
      window.location.reload();
    }
  };

  // Check session status on page load
  checkSessionStatus();

  // Fetch passenger dashboard data
  fetchPassengerDashboardData();

  // Setup Logout Functionality
  setupLogout();

  // Handle profile modal interactions
  setupProfileModal();

  // Handle form submission for updating profile
  handleProfileUpdate();

  // Handle form submission for changing password
  handleChangePassword();

  // Start polling for ride status updates
  startRideStatusPolling();
});

function checkSessionStatus() {
  fetch('/api/check-session')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'logged_out') {
        window.location.href = '/login';
      }
    })
    .catch(error => {
      console.error('Error checking session:', error);
    });
}

function fetchPassengerDashboardData() {
  fetch('/api/passenger-dashboard')
    .then((response) => response.json())
    .then((data) => {
      console.log('Passenger Dashboard Data:', data);

      if (data.status === 'success') {
        displayPassengerInfo(data);
      } else {
        console.error('Error fetching passenger data:', data.message);
      }
    })
    .catch((error) => {
      console.error('Error fetching passenger dashboard data:', error);
    });
}

// Function to display passenger information
function displayPassengerInfo(data) {
  const passengerNameElement = document.getElementById('passenger-name');
  const currentProfilePicture = document.getElementById('current-profile-picture');

  if (passengerNameElement && data.user) {
      passengerNameElement.innerText = data.user.name || 'Unknown';
  } else {
      console.error('Passenger name or user data is missing.');
  }

  if (currentProfilePicture && data.user.profile_picture_url) {
      currentProfilePicture.src = data.user.profile_picture_url;
  } else {
      console.error('Profile picture element or URL is missing.');
  }
}

// Function to setup Profile Modal interactions
function setupProfileModal() {
  const profileModal = document.getElementById('profileModal');
  const profileBtn = document.getElementById('profileBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      if (profileModal) {
        profileModal.style.display = 'block';
      }
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (profileModal) {
        profileModal.style.display = 'none';
      }
    });
  }

  // Close the modal when clicking outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target === profileModal) {
      profileModal.style.display = 'none';
    }
  });
}

// Function to handle profile update submission
function handleProfileUpdate() {
  const profileForm = document.getElementById('profileForm');
  const profilePictureInput = document.getElementById('profile-picture-input');
  const currentProfilePicture = document.getElementById('current-profile-picture');

  profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('passenger-name-input').value.trim();
      const email = document.getElementById('passenger-email-input').value.trim();
      const profilePictureFile = profilePictureInput.files[0];

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (profilePictureFile) {
          formData.append('profile_picture', profilePictureFile);
      }

      try {
          const response = await fetch('/api/update-profile', {
              method: 'POST',
              body: formData,
          });

          const data = await response.json();

          if (data.status === 'success') {
              alert('Profile updated successfully.');

              // Update profile picture if a new one is uploaded
              if (data.profile_picture_url && currentProfilePicture) {
                  currentProfilePicture.src = data.profile_picture_url + '?t=' + new Date().getTime();
              } else {
                  console.warn('Profile picture element not found.');
              }

              // Close the modal
              document.getElementById('profileModal').style.display = 'none';
          } else {
              alert(data.message || 'Failed to update profile.');
          }
      } catch (error) {
          console.error('Error updating profile:', error);
          alert('An error occurred. Please try again.');
      }
  });
}

// Function to handle password change submission
function handleChangePassword() {
  const passwordForm = document.getElementById('changePasswordForm');

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert('Password changed successfully.');
        passwordForm.reset();
      } else {
        alert(data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred. Please try again.');
    }
  });
}

// Function to setup Logout Functionality
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      fetch('/api/logout', { 
        method: 'POST', 
      })
        .then(response => {
          if (response.ok) {
            alert('You have been logged out.');
            window.location.href = '/login'; 
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
