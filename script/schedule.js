const rides = {
  "bakakeng-to-city": [
    { time: "7:00 AM", seats: 5, waitTime: "10 mins", jeepneyNumber: "JPN-001" },
    { time: "8:30 AM", seats: 3, waitTime: "15 mins", jeepneyNumber: "JPN-002" },
    { time: "10:00 AM", seats: 0, waitTime: "30 mins", jeepneyNumber: "JPN-003" },
    { time: "12:00 PM", seats: 8, waitTime: "5 mins", jeepneyNumber: "JPN-004" },
  ],
  "city-to-bakakeng": [
    { time: "7:30 AM", seats: 4, waitTime: "8 mins", jeepneyNumber: "JPN-005" },
    { time: "9:00 AM", seats: 1, waitTime: "20 mins", jeepneyNumber: "JPN-006" },
    { time: "11:00 AM", seats: 0, waitTime: "35 mins", jeepneyNumber: "JPN-007" },
    { time: "1:00 PM", seats: 6, waitTime: "7 mins", jeepneyNumber: "JPN-008" },
  ],
};

function showRides() {
  const route = document.getElementById("route").value;
  const ridesList = document.getElementById("rides-list");
  ridesList.innerHTML = "";

  const availableRides = rides[route];

  if (availableRides.length === 0) {
    ridesList.innerHTML = "<li>No available rides.</li>";
    return;
  }

  availableRides.forEach((ride) => {
    const rideItem = document.createElement("li");
    rideItem.classList.add("ride-item");

    const banner = document.createElement("div");
    banner.classList.add("ride-banner");

    if (ride.seats === 0) {
      banner.classList.add("banner-full");
      banner.innerText = "Full";
    } else if (ride.seats <= 3) {
      banner.classList.add("banner-few");
      banner.innerText = "Few Seats Left";
    } else {
      banner.classList.add("banner-available");
      banner.innerText = "Available";
    }

    rideItem.innerHTML = `
      <div class="ride-details">
        <div class="ride-info"><span class="label">Jeepney Number:</span> ${ride.jeepneyNumber}</div>
        <div class="ride-info"><span class="label">Time:</span> ${ride.time}</div>
        <div class="ride-info"><span class="label">Seats Available:</span> ${ride.seats}</div>
        <div class="ride-info"><span class="label">Wait Time:</span> ${ride.waitTime}</div>
      </div>
      <button class="book-button" ${ride.seats === 0 ? 'disabled' : ''}>
        ${ride.seats > 0 ? 'Book Now' : 'Full'}
      </button>
    `;

    rideItem.appendChild(banner);
    ridesList.appendChild(rideItem);
  });
}
