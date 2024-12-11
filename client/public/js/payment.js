document.addEventListener("DOMContentLoaded", function () {
  console.log("Payment JS loaded");

  // Extract ride_id from URL and set in hidden fields
  const urlParams = new URLSearchParams(window.location.search);
  const rideId = urlParams.get('ride_id');
  console.log("Ride ID from URL:", rideId);

  if (rideId) {
      document.getElementById('gcash-ride_id').value = rideId;
      document.getElementById('maya-ride_id').value = rideId;
      document.getElementById('cash-ride_id').value = rideId;
  }

  // Initialize payment amount
  initializePaymentAmount();

  // Add event listeners to each form
  ['cash', 'gcash', 'maya'].forEach(method => {
      const form = document.getElementById(`${method}-form`);
      if (form) {
          console.log(`Adding submit listener to ${method} form`);
          form.addEventListener('submit', function(e) {
              e.preventDefault();
              console.log(`${method} form submitted`);
              handleFormSubmission(method);
          });
      }

      // Setup terms checkbox handlers
      const termsCheckbox = document.getElementById(`${method}-terms`);
      const submitButton = document.getElementById(`${method}-submit`);
      if (termsCheckbox && submitButton) {
          termsCheckbox.addEventListener('change', function() {
              submitButton.disabled = !this.checked;
              console.log(`${method} submit button ${this.checked ? 'enabled' : 'disabled'}`);
          });
          submitButton.disabled = !termsCheckbox.checked;
      }
  });

  // Payment method change handler
  const paymentMethodSelect = document.getElementById('payment-method');
  if (paymentMethodSelect) {
      paymentMethodSelect.addEventListener('change', showPaymentForm);
      showPaymentForm(); // Show initial form
  }

  // Setup terms modal handlers
  setupTermsHandlers();
});

function handleFormSubmission(paymentMethod) {
  console.log(`Handling ${paymentMethod} form submission`);

  const form = document.getElementById(`${paymentMethod}-form`);
  if (!form) {
      console.error(`Form not found for ${paymentMethod}`);
      return;
  }

  if (!validateForm(paymentMethod)) {
      console.log('Form validation failed');
      return;
  }

  const formData = new FormData(form);
  formData.append('payment_method', paymentMethod);
  
  // Add ride status
  const rideStatus = document.getElementById('ride-status')?.value || 'scheduled';
  formData.append('status', rideStatus);

  submitPayment(formData);
}

function initializePaymentAmount() {
  const rideStatus = document.getElementById('ride-status')?.value || 'scheduled';
  console.log("Initializing payment amount with status:", rideStatus);

  fetch('/api/payment-amount', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: rideStatus })
  })
  .then(response => {
      console.log("Payment amount response status:", response.status);
      return response.json();
  })
  .then(data => {
      console.log("Payment amount data:", data);
      if (data.status === 'success') {
          updatePaymentFields(data.amount);
      } else {
          throw new Error(data.message || 'Failed to get payment amount');
      }
  })
  .catch(error => {
      console.error("Error fetching payment amount:", error);
      alert('Error getting payment amount. Please try again.');
  });
}

function validateForm(paymentMethod) {
  // Check terms agreement
  const termsCheckbox = document.getElementById(`${paymentMethod}-terms`);
  if (!termsCheckbox?.checked) {
      alert('Please agree to the terms and conditions');
      return false;
  }

  // Validate phone number for digital payments
  if (paymentMethod !== 'cash') {
      const phoneNumber = document.getElementById(`${paymentMethod}-number`).value;
      if (!validateMobileNumber(phoneNumber)) {
          return false;
      }
  }

  // Check required fields
  const form = document.getElementById(`${paymentMethod}-form`);
  const requiredFields = form.querySelectorAll('[required]');
  for (let field of requiredFields) {
      if (!field.value) {
          alert(`Please fill in all required fields`);
          field.focus();
          return false;
      }
  }

  return true;
}

function submitPayment(formData) {
  console.log('Submitting payment...');
  
  // Convert FormData to a regular object
  const paymentData = {};
  for (let [key, value] of formData.entries()) {
      paymentData[key] = value;
      console.log(`${key}: ${value}`);
  }

  paymentData.amount = parseFloat(paymentData.amount) || 0;
  
  paymentData.payment_method = paymentData.payment_method.toLowerCase();
  
  paymentData.user_id = document.querySelector('meta[name="user_id"]')?.content || '';

  fetch('/api/payment-process', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
  })
  .then(response => {
      console.log('Response status:', response.status);
      return response.json().then(data => {
          if (!response.ok) {
              throw new Error(data.message || 'Payment processing failed');
          }
          return data;
      });
  })
  .then(data => {
      console.log('Payment response:', data);
      if (data.status === 'success') {
          showSuccessModal();
      } else {
          throw new Error(data.message || 'Payment processing failed');
      }
  })
  .catch(error => {
      console.error('Payment error:', error);
      alert(error.message || 'Error processing payment. Please try again.');
  });
}

function updatePaymentFields(amount) {
  console.log("Updating payment fields with amount:", amount);
  ['cash', 'gcash', 'maya'].forEach(method => {
      const field = document.getElementById(`${method}-amount`);
      if (field) {
          field.value = amount;
          field.readOnly = true;
          console.log(`Updated ${method} amount to ${amount}`);
      }
  });
}

function validateMobileNumber(number) {
  const mobilePattern = /^09\d{9}$/;
  if (!mobilePattern.test(number)) {
      alert('Please enter a valid mobile number starting with 09 followed by 9 digits');
      return false;
  }
  return true;
}

function showPaymentForm() {
  const selectedMethod = document.getElementById('payment-method').value;
  console.log('Showing payment form:', selectedMethod);

  ['cash', 'gcash', 'maya'].forEach(method => {
      const section = document.getElementById(`${method}-section`);
      if (section) {
          section.classList.remove('active');
      }
  });

  const selectedSection = document.getElementById(`${selectedMethod}-section`);
  if (selectedSection) {
      selectedSection.classList.add('active');
      if (selectedMethod !== 'cash') {
          populateDate(`${selectedMethod}-date`);
      }
  }
}

function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  modal.style.display = 'block';
  
  const closeBtn = document.getElementById('close-success-modal');
  if (closeBtn) {
      closeBtn.onclick = function() {
          modal.style.display = 'none';
          window.location.href = '/passengerDashboard';
      };
  }
}

function populateDate(fieldId) {
  const dateField = document.getElementById(fieldId);
  if (dateField) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      dateField.value = formattedDate;
  }
}

function setupTermsHandlers() {
  const termsModal = document.getElementById('terms-modal');
  const termsLinks = document.querySelectorAll('.open-modal');
  const closeBtn = document.querySelector('.close');

  termsLinks.forEach(link => {
      link.onclick = function(e) {
          e.preventDefault();
          termsModal.style.display = 'block';
      };
  });

  if (closeBtn) {
      closeBtn.onclick = function() {
          termsModal.style.display = 'none';
      };
  }

  window.onclick = function(event) {
      if (event.target === termsModal) {
          termsModal.style.display = 'none';
      }
  };
}