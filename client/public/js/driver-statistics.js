// Global variable for the chart
let myChart; 

// Function to update the real-time clock
function updateRealTime() {
    const realTimeElement = document.getElementById('real-time');
    const now = luxon.DateTime.local(); // Get the current date and time using Luxon
    realTimeElement.textContent = now.toFormat('LLLL dd, yyyy hh:mm:ss a'); // Format the date and time
}

updateRealTime()

// Update the clock every second
setInterval(updateRealTime, 1000); // Updates every second

//========================================================

// Fetch data for the chart
fetch('..//php/get_passenger_statistics.php')
    .then(response => response.json())
    .then(data => {
        // Process the data
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const timeSlots = [...new Set(data.map(item => item.time_slot))]; // Get unique time slots
        const chartData = {};

        // Initialize chart data for each day
        daysOfWeek.forEach(day => {
            chartData[day] = Array(timeSlots.length).fill(0);
        });

        // Populate the chart data
        data.forEach(item => {
            const timeIndex = timeSlots.indexOf(item.time_slot);
            if (timeIndex !== -1) {
                chartData[item.day_of_week][timeIndex] = item.bookings_count;
            }
        });

        // Prepare datasets for Chart.js
        const datasets = daysOfWeek.map((day, index) => ({
            label: day,
            data: chartData[day],
            borderColor: `hsl(${index * 60}, 70%, 50%)`,
            backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.5)`,
            fill: false,
            tension: 0.3
        }));

        // Destroy the existing chart instance if it exists
        if (myChart) {
            myChart.destroy();
        }

        // Create a new chart instance
        const ctx = document.getElementById('myChart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line', // Or 'bar' if you prefer a bar chart
            data: {
                labels: timeSlots,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'white' // White text for the legend
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        titleColor: 'white', // White text for the tooltip title
                        bodyColor: 'white'  // White text for the tooltip body
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time Slot',
                            color: 'white' // White text for the X-axis title
                        },
                        ticks: {
                            color: 'white' // White text for the X-axis ticks
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Bookings',
                            color: 'white' // White text for the Y-axis title
                        },
                        ticks: {
                            color: 'white' // White text for the Y-axis ticks
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));

// Fetch and display data for the default day (Monday) on initial load
fetch('..//php/get_passenger_statistics.php?day=Monday')
    .then(response => response.json())
    .then(data => {
        const timeSlots = data.map(item => item.time_slot);
        const bookingsCount = data.map(item => item.bookings_count);

        // Create or update the chart with this data
        if (myChart) {
            myChart.data.labels = timeSlots;
            myChart.data.datasets = [{
                label: 'Bookings Count',
                data: bookingsCount,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }];
            myChart.update();
        } else {
            const ctx = document.getElementById('myChart').getContext('2d');
            myChart = new Chart(ctx, {
                type: 'bar', // Bar chart
                data: {
                    labels: timeSlots,
                    datasets: [{
                        label: 'Bookings Count',
                        data: bookingsCount,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'white' // White text for the Y-axis ticks
                            }
                        },
                        x: {
                            ticks: {
                                color: 'white' // White text for the X-axis ticks
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            titleColor: 'white', // White text for the tooltip title
                            bodyColor: 'white'  // White text for the tooltip body
                        }
                    }
                }
            });
        }
    })
    .catch(error => console.log(error));
