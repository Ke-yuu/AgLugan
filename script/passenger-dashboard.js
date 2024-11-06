document.addEventListener('DOMContentLoaded', function () {
  // Fetch user and available rides data from the server
  fetch('../php/passenger-dashboard.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 'error') {
        alert(data.message);
        return;
      }

      // Display Passenger Info
      const passengerNameElement = document.getElementById('passenger-name');
      if (passengerNameElement && data.user) {
        passengerNameElement.innerText = data.user.name;
      }

      // Display Booked Rides with Schedule
      const bookedRidesList = document.getElementById('ride-booked');
      if (bookedRidesList) {
        bookedRidesList.innerHTML = ''; // Clear any existing content
        if (data.rides && data.rides.length > 0) {
          data.rides.forEach(ride => {
            console.log("Ride Data:", ride);
            const listItem = document.createElement('li');
            listItem.classList.add('booked-ride-item');
            listItem.innerHTML = `Ride ID: ${ride.ride_id} | From: ${ride.start_location} | To: ${ride.end_location}`;
            bookedRidesList.appendChild(listItem);
          });
        } else {
          console.log("No rides found for the user.");
          bookedRidesList.innerHTML = '<li>No booked rides found.</li>';
        }
      }
      
      // Display Payment History
      const paymentHistory = document.getElementById('ride-history');
      if (paymentHistory) {
        paymentHistory.innerHTML = ''; // Clear existing content

        // Loop through the payment history and display it, including the ride_id
        data.payments.forEach(payment => {
          const listItem = document.createElement('li');
          listItem.classList.add('ride-history-item');
          listItem.innerHTML = `
            Ride ID: ${payment.ride_id} - Amount: ₱${payment.amount} - Payment Method: ${payment.payment_method} - Status: ${payment.status}
          `;
          paymentHistory.appendChild(listItem);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please try again later.');
    });


  // Logout Functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      alert('You have been logged out.');
      window.location.href = '../index.html'; // Redirect to login page
    });
  }

  // JavaScript to handle modal behavior and profile update
  const profileBtn = document.getElementById('profileBtn');
  const profileModal = document.getElementById('profileModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (profileBtn && profileModal && closeModalBtn) {
    profileBtn.addEventListener('click', () => {
      profileModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
      profileModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target == profileModal) {
        profileModal.style.display = 'none';
      }
    });
  }

  // Handle profile update form submission
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent the form from submitting normally

      const name = document.getElementById("passenger-name-input").value;
      const email = document.getElementById("passenger-email-input").value;

      // AJAX request to send data to PHP
      fetch('../php/profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, email: email })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Profile updated successfully!");
          const passengerNameElement = document.getElementById('passenger-name');
          if (passengerNameElement) {
            passengerNameElement.textContent = name; // Update the displayed name
          }
          if (closeModalBtn) {
            closeModalBtn.click(); // Close the modal
          }
        } else {
          alert("Failed to update profile. " + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while updating the profile.");
      });
    });
  }
   // Handle change password form submission
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', function (e) {
          e.preventDefault(); 

          const currentPassword = document.getElementById('current-password').value.trim();
          const newPassword = document.getElementById('new-password').value.trim();
          const confirmPassword = document.getElementById('confirm-password').value.trim();

          // Check if any fields are empty and alert the user
          if (!currentPassword) {
              alert("Please enter your current password.");
              return;
          }
          if (!newPassword) {
              alert("Please enter a new password.");
              return;
          }
          if (!confirmPassword) {
              alert("Please confirm your new password.");
              return;
          }

          // Validate password strength
          const passwordRegex = /^(?=.*[0-9]).{8,}$/;
          if (!passwordRegex.test(newPassword)) {
              alert('Password must be at least 8 characters long and contain at least one number.');
              return;
          }

          // Check if new password matches confirm password
          if (newPassword !== confirmPassword) {
              alert("New passwords do not match.");
              return;
          }

          fetch('../php/change_password.php', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert("Password changed successfully!");
                  changePasswordForm.reset();

                  // Close the modal upon successful password change
                  const profileModal = document.getElementById('profileModal');
                  if (profileModal) {
                      profileModal.style.display = 'none';
                  }
              } else {
                  alert("Failed to change password. " + data.message);
              }
          })
          .catch(error => {
              console.error('Error:', error);
              alert("An error occurred while changing the password.");
          });
      });
    }
});


