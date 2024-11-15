document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded. Initializing payment_amount.js...");

    function fetchAndSetAmount() {
        // Attempt to get the ride status from the hidden input field
        const rideStatusElement = document.getElementById('ride-status');
        let rideStatus = 'scheduled'; // Default value

        if (rideStatusElement) {
            rideStatus = rideStatusElement.value;
        }

        console.log("Ride status being sent:", rideStatus); // Debug log to verify ride status being sent

        // Fetch the correct payment amount based on ride status
        fetch('../php/payment_amount.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `status=${encodeURIComponent(rideStatus)}`
        })
        .then(response => response.json())
        .then(data => {
            console.log("Response from PHP:", data);
            if (data.status === "success") {
                const amount = data.amount;
                console.log("Setting amount to:", amount);

                // Update amount fields
                const cashAmountField = document.getElementById("cash-amount");
                const gcashAmountField = document.getElementById("gcash-amount");
                const mayaAmountField = document.getElementById("maya-amount");

                if (cashAmountField) {
                    cashAmountField.value = amount;
                    console.log("Cash amount set to:", cashAmountField.value);
                }

                if (gcashAmountField) {
                    gcashAmountField.value = amount;
                    console.log("GCash amount set to:", gcashAmountField.value);
                }

                if (mayaAmountField) {
                    mayaAmountField.value = amount;
                    console.log("Maya amount set to:", mayaAmountField.value);
                }

                // Set fields to read-only
                if (cashAmountField) cashAmountField.readOnly = true;
                if (gcashAmountField) gcashAmountField.readOnly = true;
                if (mayaAmountField) mayaAmountField.readOnly = true;
            } else {
                console.error("Error: Unable to fetch payment amount");
                alert("Error: Unable to fetch payment amount. Please try again later.");
            }
        })
        .catch(error => {
            console.error("Error fetching payment amount:", error);
            alert("There was an error retrieving the payment amount. Please try again.");
        });
    }

    // Trigger the fetchAndSetAmount function initially
    fetchAndSetAmount();

    // Ensure that ride status can be dynamically updated (if applicable)
    // For example, if the ride status can be changed via another action, re-fetch the amount
    const rideStatusElement = document.getElementById('ride-status');
    if (rideStatusElement) {
        rideStatusElement.addEventListener('change', function () {
            console.log("Ride status changed. Re-fetching payment amount...");
            fetchAndSetAmount();
        });
    }
});
