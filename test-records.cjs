const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/v1/private/yayasan-darussolah-wal-jinan/admin/records',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test' 
    // wait I don't have a valid auth token to bypass firebase! 
    // The endpoint requires requireAuth. I can't easily fake it unless I disable requireAuth temporarily or write a quick bypass script.
  }
});
req.end();
