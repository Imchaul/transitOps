const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error('Error:', err.message);
  logger.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};