const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'transitops_analytics',
  process.env.DB_USER || 'transitops',
  process.env.DB_PASSWORD || 'transitops123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

const MaintenanceLog = require('./maintenance.model')(sequelize);
const FuelLog = require('./fuel.model')(sequelize);
const Expense = require('./expense.model')(sequelize);

module.exports = { sequelize, MaintenanceLog, FuelLog, Expense };