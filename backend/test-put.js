const http = require('http');

const data = JSON.stringify({
  isActive: false
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/agents/688c8df93fa673e29bcd7777',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhjOGRmOTNmYTY3M2UyOWJjZDc3NzEiLCJlbWFpbCI6ImFkbWluMUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDA0MjkzMCwiZXhwIjoxNzU0MTI5MzMwfQ.bJ9HkY4f4WpCFejBbkHQYxP6TazYGp3K8FhC-B3I_EU',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', responseBody);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
