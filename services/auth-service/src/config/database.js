require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'transitops',
    password: process.env.DB_PASSWORD || 'transitops123',
    database: process.env.DB_NAME || 'transitops_auth',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'SequelizeMeta'
  },
  test: {
    username: process.env.DB_USER || 'transitops',
    password: process.env.DB_PASSWORD || 'transitops123',
    database: process.env.DB_NAME_TEST || 'transitops_auth_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};