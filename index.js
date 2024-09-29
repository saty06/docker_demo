// server.js

const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3030;

// Create a Registry to register metrics
const register = new client.Registry();

// Define a custom counter metric for HTTP requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status'],
});

// Register the metrics
register.registerMetric(httpRequestCounter);

// Collect default metrics
client.collectDefaultMetrics({ register });

// Middleware to count incoming HTTP requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, status: res.statusCode });
  });
  next();
});

// Example endpoint
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Endpoint to expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
