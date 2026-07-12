require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    timestamp: new Date().toISOString()
  });
});

// Service configurations
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    path: '/api/auth'
  },
  fleet: {
    url: process.env.FLEET_SERVICE_URL || 'http://localhost:3002',
    path: '/api/fleet'
  },
  trip: {
    url: process.env.TRIP_SERVICE_URL || 'http://localhost:3003',
    path: '/api/trip'
  },
  analytics: {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004',
    path: '/api/analytics'
  }
};

// Setup proxies for each service
Object.entries(services).forEach(([name, config]) => {
  app.use(config.path, createProxyMiddleware({
    target: config.url,
    changeOrigin: true,
    pathRewrite: {
      [`^${config.path}`]: ''
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${name}-service`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${name}-service:`, err);
      res.status(503).json({
        error: 'Service unavailable',
        service: name
      });
    }
  }));
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'TransitOps API Gateway',
    version: '1.0.0',
    services: Object.keys(services),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      fleet: '/api/fleet',
      trip: '/api/trip',
      analytics: '/api/analytics'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.url
  });
});

app.listen(PORT, () => {
  logger.info(`Gateway running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});