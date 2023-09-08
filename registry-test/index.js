const http = require('http');
const port = 3000;

const server = http.createServer((req, res) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const clientIP = req.headers['client-ip'] || req.connection.remoteAddress;
    console.log(
      `[${new Date(startTime).toISOString()}] - Method: ${req.method} - URL: ${
        req.url
      } - IP: ${clientIP} - Response Time: ${responseTime}ms`
    );
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(
    `This is container/application is running on: ${process.env.BUILD_ID}`
  );
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down server');
  server.close();
  process.exit();
});
