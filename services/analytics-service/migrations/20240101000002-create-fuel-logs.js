'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FuelLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      vehicleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      tripId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      liters: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      cost: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      odometer: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      fuelType: {
        type: Sequelize.ENUM('Diesel', 'Petrol', 'CNG', 'Electric'),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('FuelLogs', ['vehicleId']);
    await queryInterface.addIndex('FuelLogs', ['tripId']);
    await queryInterface.addIndex('FuelLogs', ['date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FuelLogs');
  }
};