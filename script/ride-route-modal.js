document.addEventListener('DOMContentLoaded', function () {
    function setupAvailableRidesModal() {
        const availableRidesList = document.getElementById('rides-list');

        if (availableRidesList) {
            availableRidesList.addEventListener('click', function (event) {
                const target = event.target;
                if (target.classList.contains('available-ride-item')) {
                    const rideId = target.dataset.rideId;
                    const startLocation = target.dataset.startLocation;
                    const endLocation = target.dataset.endLocation;

                    openRouteModal(rideId, startLocation, endLocation);
                }
            });
        }
    }

    function openRouteModal(rideId, startLocation, endLocation) {
        const routeModal = document.getElementById('routeModal');
        const routeModalContent = document.getElementById('routeModalContent');

        routeModalContent.innerHTML = `
            <span class="close-btn" id="closeRouteModalBtn">&times;</span>
            <h2>Ride Route - Ride ID: ${rideId}</h2>
            <p>From: ${startLocation} To: ${endLocation}</p>
            <div id="map" style="height: 400px;"></div>
            <button id="bookRideBtn" class="book-ride-btn">Book a Ride</button>
        `;

        routeModal.style.display = "block";

        setTimeout(() => {
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                initMap(startLocation, endLocation, mapContainer);
            }
        }, 300);

        setTimeout(() => {
            const closeRouteModalBtn = document.getElementById('closeRouteModalBtn');
            if (closeRouteModalBtn) {
                closeRouteModalBtn.onclick = function () {
                    routeModal.style.display = "none";
                };
            }

            const bookRideBtn = document.getElementById('bookRideBtn');
            if (bookRideBtn) {
                bookRideBtn.onclick = function () {
                    window.location.href = '../html/schedule.html';
                };
            }
        }, 300);

        window.onclick = function (event) {
            if (event.target === routeModal) {
                routeModal.style.display = "none";
            }
        };
    }

    function initMap(startLocation, endLocation, mapContainer) {
        const bounds = [
            [16.0, 120.5],
            [16.6, 121.2],
        ];

        const mapCenter = [16.4, 120.9];

        const map = L.map(mapContainer).setView(mapCenter, 13);

        map.setMaxBounds(bounds);
        map.on('drag', function () {
            map.panInsideBounds(bounds, { animate: false });
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 16,
            minZoom: 11,
        }).addTo(map);

        const startCoordinates = getCoordinates(startLocation);
        const endCoordinates = getCoordinates(endLocation);

        L.Routing.control({
            waypoints: [
                L.latLng(startCoordinates),
                L.latLng(endCoordinates),
            ],
            routeWhileDragging: true,
            createMarker: function(i, waypoint, n) {
                return L.marker(waypoint.latLng)
                    .bindPopup(i === 0 ? `<b>Start Location:</b> ${startLocation}` : `<b>End Location:</b> ${endLocation}`);
            }
        }).addTo(map);
    }

    function getCoordinates(location) {
        const coordinatesMap = {
            'SLU': [16.385326090154187, 120.59331735437709],
            'CHURCH': [16.390714891349862, 120.59051084451887],
            'TOWN': [16.413124909012243, 120.5946969891941],
        };
        return coordinatesMap[location] || [16.385326090154187, 120.59331735437709];
    }

    setupAvailableRidesModal();
});
