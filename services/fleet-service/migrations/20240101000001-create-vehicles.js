'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      registrationNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      model: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Truck', 'Van', 'Bus', 'Car', 'Motorcycle'),
        allowNull: false
      },
      maxLoadCapacity: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      odometer: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        validate: { min: 0 }
      },
      acquisitionCost: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      status: {
        type: Sequelize.ENUM('Available', 'On Trip', 'In Shop', 'Retired'),
        defaultValue: 'Available'
      },
      region: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      currentDriverId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      lastMaintenanceDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      nextMaintenanceDate: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('Vehicles', ['registrationNumber']);
    await queryInterface.addIndex('Vehicles', ['status']);
    await queryInterface.addIndex('Vehicles', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vehicles');
  }
};