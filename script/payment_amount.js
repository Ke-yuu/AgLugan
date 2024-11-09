document.addEventListener("DOMContentLoaded", function () {
    // Fetch the correct payment amount based on user type
    fetch('../php/payment_amount.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const amount = data.amount;
                const cashAmountField = document.getElementById("cash-amount");
                const gcashAmountField = document.getElementById("gcash-amount");
                const mayaAmountField = document.getElementById("maya-amount");

                // Set the amounts and make them non-editable
                if (cashAmountField) cashAmountField.value = amount;
                if (gcashAmountField) gcashAmountField.value = amount;
                if (mayaAmountField) mayaAmountField.value = amount;

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
});
