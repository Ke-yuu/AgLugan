document.addEventListener("DOMContentLoaded", function () {
  // Set the correct payment amount based on user type
  const userType = "<?php echo $_SESSION['user_type']; ?>"; // Assuming user_type is stored in the session
  const cashAmountField = document.getElementById("cash-amount");
  const gcashAmountField = document.getElementById("gcash-amount");
  const mayaAmountField = document.getElementById("maya-amount");

  let amount = userType === "Faculty/Staff" ? 15 : 13;

  // Set the amounts and make them non-editable
  cashAmountField.value = amount;
  gcashAmountField.value = amount;
  mayaAmountField.value = amount;
  cashAmountField.readOnly = true;
  gcashAmountField.readOnly = true;
  mayaAmountField.readOnly = true;

  // Extract ride_id from the URL and set it in the hidden input field for all forms
  const urlParams = new URLSearchParams(window.location.search);
  const rideId = urlParams.get('ride_id');

  if (rideId) {
    document.getElementById('gcash-ride_id').value = rideId;
    document.getElementById('maya-ride_id').value = rideId;
    document.getElementById('cash-ride_id').value = rideId;
  }

  // Attach event listener to the select dropdown for payment method change
  document.getElementById('payment-method').addEventListener('change', showPaymentForm);

  // Initialize the correct payment form on page load
  showPaymentForm();

  // Handle form submission for GCash, Maya, and Cash
  document.getElementById('gcash-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateTermsAgreement('gcash-terms') && validateMobileNumber('gcash-number')) {
      submitPaymentForm(new FormData(this));
    }
  });

  document.getElementById('maya-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateTermsAgreement('maya-terms') && validateMobileNumber('maya-number')) {
      submitPaymentForm(new FormData(this));
    }
  });

  document.getElementById('cash-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateTermsAgreement('cash-terms')) {
      submitPaymentForm(new FormData(this));
    }
  });

  // Enable or disable GCash, Maya, and Cash submit buttons based on terms acceptance
  const gcashTerms = document.getElementById("gcash-terms");
  const gcashSubmit = document.getElementById("gcash-submit");
  const mayaTerms = document.getElementById("maya-terms");
  const mayaSubmit = document.getElementById("maya-submit");
  const cashTerms = document.getElementById("cash-terms");
  const cashSubmit = document.getElementById("cash-submit");

  if (gcashTerms) {
    gcashTerms.addEventListener('change', function () {
      gcashSubmit.disabled = !this.checked;
    });
  }

  if (mayaTerms) {
    mayaTerms.addEventListener('change', function () {
      mayaSubmit.disabled = !this.checked;
    });
  }

  if (cashTerms) {
    cashTerms.addEventListener('change', function () {
      cashSubmit.disabled = !this.checked;
    });
  }

  // Terms and Conditions Modal Handling
  const termsModal = document.getElementById("terms-modal");
  const termsLinks = document.querySelectorAll(".open-modal");
  const spanCloseTerms = document.querySelector(".close");

  // Attach click event listeners to all Terms and Conditions links
  termsLinks.forEach((link) => {
    link.onclick = function () {
      termsModal.style.display = "block";
    };
  });

  // Close the modal when the close button is clicked
  if (spanCloseTerms) {
    spanCloseTerms.onclick = function () {
      termsModal.style.display = "none";
    };
  }

  // Close the modal when clicking outside of it
  window.onclick = function (event) {
    if (event.target == termsModal) {
      termsModal.style.display = "none";
    }
  };

  // Success modal handling
  const successModal = document.getElementById('success-modal');
  const closeSuccessModal = document.getElementById('close-success-modal');
  if (closeSuccessModal) {
    closeSuccessModal.onclick = function () {
      successModal.style.display = 'none';
      window.location.href = '../html/passenger-dashboard.html';
    };
  }
});

// Function to show the correct payment form based on the selection
function showPaymentForm() {
  const paymentMethod = document.getElementById("payment-method").value;
  const cashSection = document.getElementById("cash-section");
  const gcashSection = document.getElementById("gcash-section");
  const mayaSection = document.getElementById("maya-section");

  cashSection.classList.remove('active');
  gcashSection.classList.remove('active');
  mayaSection.classList.remove('active');

  if (paymentMethod === "gcash") {
    gcashSection.classList.add('active');
    populateDate("gcash-date");
  } else if (paymentMethod === "maya") {
    mayaSection.classList.add('active');
    populateDate("maya-date");
  } else {
    cashSection.classList.add('active');
  }
}

// Populate today's date in the form
function populateDate(fieldId) {
  const today = new Date();
  const dateField = document.getElementById(fieldId);
  dateField.value = today.toISOString().split('T')[0];
}

// Validate mobile number to ensure it starts with "09" and is followed by 9 digits
function validateMobileNumber(fieldId) {
  const numberField = document.getElementById(fieldId);
  const mobileNumber = numberField.value.trim();
  const mobileNumberPattern = /^09\d{9}$/;

  if (!mobileNumberPattern.test(mobileNumber)) {
    alert("Please enter a valid mobile number starting with '09' followed by 9 digits.");
    return false;
  }
  return true;
}

// Function to validate terms and conditions agreement
function validateTermsAgreement(termsFieldId) {
  const termsCheckbox = document.getElementById(termsFieldId);
  if (!termsCheckbox.checked) {
    alert("You have to agree with the terms and conditions to proceed.");
    return false;
  }
  return true;
}

// Function to submit the payment via AJAX
function submitPaymentForm(formData) {
  console.log('Form data before submission:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  fetch('../php/process_payment.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.text())
    .then(text => {
      try {
        const data = JSON.parse(text);
        if (data.status === 'success') {
          console.log("Payment submitted successfully. Showing success modal.");
          document.getElementById('success-modal').style.display = 'block';
        } else {
          console.error('Error: ', data.message);
          alert('Error: ' + data.message);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        console.error('Response:', text);
        if (text.includes('<!DOCTYPE html>')) {
          alert('Your session has expired. Please log in again.');
          window.location.href = '../html/login.html';
        } else {
          alert('There was an error processing your payment. Please try again.');
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('There was an error submitting the form. Please try again.');
    });
}
