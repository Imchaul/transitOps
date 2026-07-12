'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Trips', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tripNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      destination: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      cargoWeight: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      plannedDistance: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      actualDistance: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: { min: 0 }
      },
      vehicleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      driverId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled'),
        defaultValue: 'Draft'
      },
      dispatchedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      startOdometer: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: { min: 0 }
      },
      endOdometer: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: { min: 0 }
      },
      fuelConsumed: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: { min: 0 }
      },
      fuelCost: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: { min: 0 }
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

    await queryInterface.addIndex('Trips', ['tripNumber']);
    await queryInterface.addIndex('Trips', ['vehicleId']);
    await queryInterface.addIndex('Trips', ['driverId']);
    await queryInterface.addIndex('Trips', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Trips');
  }
};