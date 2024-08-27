const express = require('express');
const ping = require('ping');
const { collectDefaultMetrics } = require('prom-client');

const Prometheus = require('prom-client');
const registerMetrics = new Prometheus.Registry();

// Enable default metric collection
collectDefaultMetrics({ register: registerMetrics });

// Create a counter metric for requests
const requestsCounter = new Prometheus.Counter({
  name: 'requests_total',
  help: 'Total number of requests',
  labelNames: ['method', 'path']
});
registerMetrics.registerMetric(requestsCounter);

// Create a gauge metric for ping latency
const pingLatencyGauge = new Prometheus.Gauge({
  name: 'ping_latency_seconds',
  help: 'Ping latency in seconds',
  labelNames: ['target_ip']
});
registerMetrics.registerMetric(pingLatencyGauge);

// Create multiple Express apps, each listening on a different port
const appPing = express();
const appHealthz = express();
const appMetrics = express();

// Add routes to each app
appPing.get('/ping', (req, res) => {
  requestsCounter.inc({ method: 'GET', path: '/ping' });
  const targetIp = req.query.ip || '8.8.8.8'; // Default to Google's public DNS
  if (!targetIp) {
    return res.status(400).json({ error: 'Missing required parameter: ip' });
  }

  try {
    const startTime = Date.now();
    ping.promise.probe(targetIp)
      .then((response) => {
        const latency = Date.now() - startTime;
        const responseData = { pong: true, latency: latency };
        pingLatencyGauge.set({ target_ip: targetIp }, latency / 1000); // Convert to seconds
        res.json(responseData);
      })
      .catch((error) => {
        console.error(`Error pinging ${targetIp}:`, error);
        res.status(500).json({ error: `Failed to ping target IP: ${targetIp}` });
      });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

appHealthz.get('/healthz', (req, res) => {
  requestsCounter.inc({ method: 'GET', path: '/healthz' });
  const checks = [];

  // Check if the API is running
  checks.push({ name: 'API Running', status: true });

  // Check the ping functionality
  ping.promise.probe('localhost')
    .then((response) => {
      checks.push({ name: 'Ping Functionality', status: true });
      res.json({ checks });
    })
    .catch((error) => {
      checks.push({ name: 'Ping Functionality', status: false, error: error.message });
      res.status(500).json({ checks });
    });
});

appMetrics.get('/metrics', (req, res) => {
  res.setHeader('Content-Type', registerMetrics.contentType);
  registerMetrics.metrics().then((data) => {
    res.status(200).send(data);
  }).catch((error) => {
    console.error('Error generating metrics:', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  });
});

// Listen on multiple ports
appPing.listen(8080, () => {
  console.log('Ping endpoint listening on port 8080');
});

appHealthz.listen(8081, () => {
  console.log('Healthz endpoint listening on port 8081');
});

appMetrics.listen(8082, () => {
  console.log('Metrics endpoint listening on port 8082');
});