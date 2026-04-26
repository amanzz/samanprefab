const path = require('path');
require('dotenv').config({ path: '.env.local' });
console.log(process.env.NEXT_PUBLIC_API_URL);
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
console.log({
  protocol: apiUrl.protocol.replace(':', ''),
  hostname: apiUrl.hostname,
  port: apiUrl.port || '',
});
