require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const tripRoutes = require('./routes/trip.routes');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', service: 'trip-service', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', service: 'trip-service', database: 'disconnected' });
  }
});

app.use('/api/trips', tripRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info(`Trip service running on port ${PORT}`);
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
});