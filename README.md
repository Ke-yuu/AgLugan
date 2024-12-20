FINALS PROJECT - RIDE HAILING WEBAPP
- WEBAPP NAME - AgLugan
- MEMBERS - AZURIN, BUCANG, GALAPON, MARRON, RABINO, VILLANUEVA, WANGET

SETUP FOR THE PROJECT

TO ACCESS THE WEBSITE
1. Check your IP address in your desktop
2. Copy your IP Address and put your IP address in Line 48 in server.js
    eg.     origin: ['http://localhost:3000', 'http://192.168.0.119:3000', 'http://192.168.1.2:3000', 'http://192.168.100.41:3000', 'http://192.168.2.7:3000', 'YOUR IP ADDRESS' ],
3. Add the database to the phpmyadmin, make sure the database name is "aglugan"
4. Go to your terminal in VS code 
5. Type in the terminal "cd server"
6. and type "node server.js"
7. This must be the output in your terminal
        PS C:\wamp64\www\webtek final\AgLugan\server> node server.js
        Environment variables loaded: { EMAIL_USER: 'izanamikuro02@gmail.com', EMAIL_PASS: '***exists***' }
        Loading forgot password route...
        Server is running on port 3000

        Available network access points:
        - Ethernet: http://192.168.1.2:3000
        - Ethernet 7: http://192.168.56.1:3000
        - VMware Network Adapter VMnet1: http://192.168.177.1:3000
        - VMware Network Adapter VMnet8: http://192.168.220.1:3000
8. Click on the Ethernet IP Address and the website will run

FOR ADMIN
1. To access the admin side you must type /adminlogin to hide from vulnerabilities
    eg. http://192.168.1.2:3000/adminlogin
2. To access the admin
    username: admin
    password: admin123
3. When a Student/Faculty wants to register the admin must put a ID Number first before the Student/Faculty.

FOR PASSENGER MODULE
1. Make sure if you want to register Go to admin and add a ID Number FIRST.
2. After logging in you can access the passenger dashboard.
 NOTE: If there are no available rides the driver module must put a queue rides inorder the Student/Faculty book a ride.

FOR DRIVER MODULE
1. An admin will create a account for the driver
2. After admin creating the driver credentials try logging in
    here is a driver credentials to our database
        username: martin
        password: martin123
NOTE: The driver must add first a vehicle before queue a ride


