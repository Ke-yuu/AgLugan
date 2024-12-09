document.addEventListener("DOMContentLoaded", () => {
  const queueBtn = document.getElementById("queue-btn");

  // When the Queue button is clicked, redirect to driver-queued.html
  queueBtn.addEventListener("click", () => {
    window.location.href = "driver-queued-sched.html";
  });

  // Example for dynamically populating the queue table (can be fetched from the database)
  const queueTableBody = document.getElementById("queue-tbody");
  const sampleData = [
    { time: "1:30-2:00", route: "SLU(SAMCIS) Gate 2 - Igorot Garden", status: "Loading" },
    { time: "2:00-2:30", route: "SLU(SAMCIS) Gate 2 - Igorot Garden", status: "In Queue" },
    { time: "2:30-3:00", route: "SLU(SAMCIS) Gate 2 - Igorot Garden", status: "In Queue" },
    { time: "3:00-3:30", route: "SLU(SAMCIS) Gate 2 - Igorot Garden", status: "Waiting" },
  ];

  // Populate the table with data
  sampleData.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.time}</td>
      <td>${entry.route}</td>
      <td>${entry.status}</td>
    `;
    queueTableBody.appendChild(row);
  });
});
