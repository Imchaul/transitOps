require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const vehicleRoutes = require('./routes/vehicle.routes');
const driverRoutes = require('./routes/driver.routes');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

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
    res.json({ status: 'ok', service: 'fleet-service', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', service: 'fleet-service', database: 'disconnected' });
  }
});

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info(`Fleet service running on port ${PORT}`);
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
});