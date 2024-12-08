const http = require('node:http');
const fs = require('fs');
const path = require('path'); // Import path module to resolve absolute paths
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(function(req, res) {
  // Resolve the absolute path to the file
  const filePath = path.resolve(__dirname, '..', 'html', 'admin-dashboard.html');
  
  // Read the file asynchronously
  fs.readFile(filePath, function(error, data) {
    if (error) {
      // If file not found, send a 404 error
      console.log('Error reading file:', error);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Error: File not found');
    } else {
      // Send a 200 response with the file content
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
