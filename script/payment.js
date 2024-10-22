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
  fetch('../php/process_payment.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      // Show success modal
      document.getElementById('success-modal').style.display = 'block';
    } else {
      alert('Error: ' + data.message);
    }
  })
  .catch(error => console.error('Error:', error));
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

// Initialize with Cash payment as default
document.addEventListener("DOMContentLoaded", function () {
  showPaymentForm(); // Show the default form on page load
});
