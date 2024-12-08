const http = require('node:http');
const fs = require('fs');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(function(req, res) {
  // Read the file asynchronously
  fs.readFile('html/admin-dashboard.html', function(error, data) {
    if (error) {
      // Send a 404 response with an error message
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Error: File not found'); // End the response after writing error
    } else {
      // Send a 200 response with the file content
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data); // End the response after writing the file data
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
