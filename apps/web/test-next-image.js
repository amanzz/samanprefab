const http = require('http');
http.get('http://localhost:3000/_next/image?url=http%3A%2F%2Flocalhost%3A4000%2Fuploads%2Fmedia%2F2026%2F04%2F3ad89850-a0ea-4917-b78b-66f7299a7a40-800w.webp&w=1080&q=75', (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});
