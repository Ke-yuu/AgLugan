// Function to show the correct payment form based on the selection
function showPaymentForm() {
  const paymentMethod = document.getElementById("payment-method").value;
  const cashSection = document.getElementById("cash-section");
  const gcashSection = document.getElementById("gcash-section");
  const mayaSection = document.getElementById("maya-section");

  // Hide all sections first
  cashSection.classList.remove('active');
  gcashSection.classList.remove('active');
  mayaSection.classList.remove('active');

  // Show the selected section
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
  const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  dateField.value = formattedDate;
}

// Extract ride_id from the URL and set it in the hidden input field for both forms
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const rideId = urlParams.get('ride_id');
  
  if (rideId) {
    // Set the ride_id in GCash and Maya forms separately
    document.getElementById('gcash-ride_id').value = rideId;
    document.getElementById('maya-ride_id').value = rideId;
  }

  // Initialize the correct payment form on page load
  showPaymentForm(); 
});

// Handle form submission for GCash and Maya
document.getElementById('gcash-form').addEventListener('submit', function (e) {
  e.preventDefault();
  submitPaymentForm(new FormData(this));
});

document.getElementById('maya-form').addEventListener('submit', function (e) {
  e.preventDefault();
  submitPaymentForm(new FormData(this));
});

// Function to submit the payment via AJAX
function submitPaymentForm(formData) {
  // Log all form data to the console
  console.log('Form data before submission:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  fetch('../php/process_payment.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.text())  // Use .text() to capture raw response
  .then(text => {
    try {
      const data = JSON.parse(text);  // Attempt to parse JSON
      if (data.status === 'success') {
        document.getElementById('success-modal').style.display = 'block';
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.error('Response:', text);  // Log raw response for debugging
      alert('There was an error processing your payment. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error submitting the form. Please try again.');
  });
}


// Success modal handling
const successModal = document.getElementById('success-modal');
const closeSuccessModal = document.getElementById('close-success-modal');
closeSuccessModal.onclick = function () {
  successModal.style.display = 'none';
}

// Terms and Conditions Modal Handling
const modal = document.getElementById("terms-modal");
const btnOpenGcash = document.getElementById("open-modal");
const btnOpenMaya = document.getElementById("open-maya-modal");
const spanClose = document.getElementsByClassName("close")[0];
const gcashTerms = document.getElementById("gcash-terms");
const gcashSubmit = document.getElementById("gcash-submit");
const mayaTerms = document.getElementById("maya-terms");
const mayaSubmit = document.getElementById("maya-submit");

btnOpenGcash.onclick = function () {
  modal.style.display = "block";
}

btnOpenMaya.onclick = function () {
  modal.style.display = "block";
}

spanClose.onclick = function () {
  modal.style.display = "none";
  gcashTerms.disabled = false;
  mayaTerms.disabled = false;
}

gcashTerms.addEventListener('change', function () {
  gcashSubmit.disabled = !this.checked;
});

mayaTerms.addEventListener('change', function () {
  mayaSubmit.disabled = !this.checked;
});

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    gcashTerms.disabled = false;
    mayaTerms.disabled = false;
  }
}
