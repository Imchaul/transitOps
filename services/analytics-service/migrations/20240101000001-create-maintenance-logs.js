'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MaintenanceLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      vehicleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Oil Change', 'Tire Change', 'Brake Repair', 'Engine Repair', 'Regular Service', 'Other'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cost: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      odometer: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: { min: 0 }
      },
      status: {
        type: Sequelize.ENUM('Active', 'Completed'),
        defaultValue: 'Active'
      },
      completedAt: {
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

    await queryInterface.addIndex('MaintenanceLogs', ['vehicleId']);
    await queryInterface.addIndex('MaintenanceLogs', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MaintenanceLogs');
  }
};