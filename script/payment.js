// Function to show the appropriate payment form
function showPaymentForm() {
  const paymentMethod = document.getElementById("payment-method").value;
  const cashSection = document.getElementById("cash-section");
  const gcashSection = document.getElementById("gcash-section");

  if (paymentMethod === "gcash") {
    cashSection.style.display = "none";
    gcashSection.style.display = "block";
    populateDate(); // Populate date when GCash is selected
  } else {
    cashSection.style.display = "block";
    gcashSection.style.display = "none";
  }
}

// Function to populate today's date in the GCash form
function populateDate() {
  const today = new Date();
  const dateField = document.getElementById("date");
  const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  dateField.value = formattedDate;
}

// Initialize with Cash payment as default
document.addEventListener("DOMContentLoaded", function () {
  showPaymentForm(); // Show the default form on page load
});