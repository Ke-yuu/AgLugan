document.addEventListener("DOMContentLoaded", function () {
    const gcashForm = document.getElementById("gcash-form");
    const mayaForm = document.getElementById("maya-form");

    // Elements for the terms and conditions modal
    const termsModal = document.getElementById("terms-modal");
    const closeTermsModalButton = document.querySelector(".close");
    const gcashTermsCheckbox = document.getElementById("gcash-terms");
    const mayaTermsCheckbox = document.getElementById("maya-terms");

    // Open modal when terms link is clicked for GCash
    document.getElementById("open-modal").onclick = function (event) {
        event.preventDefault();
        termsModal.style.display = "block"; 
    };

    // Open modal when terms link is clicked for Maya
    document.getElementById("open-maya-modal").onclick = function (event) {
        event.preventDefault();
        termsModal.style.display = "block";
    };

    // Close the modal and enable checkboxes
    closeTermsModalButton.onclick = function () {
        termsModal.style.display = "none"; 
        gcashTermsCheckbox.disabled = false;  
        mayaTermsCheckbox.disabled = false;   
    };

    // Enable submit buttons when terms are accepted
    gcashTermsCheckbox.addEventListener('change', function() {
        document.getElementById('gcash-submit').disabled = !gcashTermsCheckbox.checked;
    });

    mayaTermsCheckbox.addEventListener('change', function() {
        document.getElementById('maya-submit').disabled = !mayaTermsCheckbox.checked;
    });

    // Function to handle form submission via AJAX
    function submitPaymentForm(form) {
        const formData = new FormData(form);
        const xhr = new XMLHttpRequest();

        xhr.open("POST", form.action, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.status === "success") {
                        showSuccessModal(); 
                    } else {
                        alert("Error: " + response.message);
                    }
                } catch (error) {
                    alert("An error occurred while processing the payment.");
                }
            }
        };
        xhr.send(formData);
    }

    // Add event listeners to both forms to handle the submission
    gcashForm.addEventListener("submit", function (event) {
        event.preventDefault();
        submitPaymentForm(gcashForm);
    });

    mayaForm.addEventListener("submit", function (event) {
        event.preventDefault(); 
        submitPaymentForm(mayaForm);
    });

    // Function to show the success modal
    function showSuccessModal() {
        const successModal = document.getElementById("success-modal");
        successModal.style.display = "block";
    }

    // Close success modal functionality
    const closeModalButton = document.getElementById("close-modal-btn");
    closeModalButton.onclick = function () {
        const successModal = document.getElementById("success-modal");
        successModal.style.display = "none";
    };
});

// Function to show the appropriate payment form
function showPaymentForm() {
    const paymentMethod = document.getElementById("payment-method").value;
    const cashSection = document.getElementById("cash-section");
    const gcashSection = document.getElementById("gcash-section");
    const mayaSection = document.getElementById("maya-section");

    // Hide all sections first
    cashSection.style.display = "none";
    gcashSection.style.display = "none";
    mayaSection.style.display = "none";

    // Show the selected section
    if (paymentMethod === "gcash") {
        gcashSection.style.display = "block";
        populateDate("gcash-date"); 
    } else if (paymentMethod === "maya") {
        mayaSection.style.display = "block";
        populateDate("maya-date");
    } else {
        cashSection.style.display = "block";
    }
}

// Function to populate today's date in the specified date field
function populateDate(fieldId) {
    const today = new Date();
    const dateField = document.getElementById(fieldId);
    const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    dateField.value = formattedDate;
}
