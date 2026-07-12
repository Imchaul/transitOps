'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Expenses', {
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
      type: {
        type: Sequelize.ENUM('Toll', 'Parking', 'Cleaning', 'Repair', 'Insurance', 'Other'),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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

    await queryInterface.addIndex('Expenses', ['vehicleId']);
    await queryInterface.addIndex('Expenses', ['tripId']);
    await queryInterface.addIndex('Expenses', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Expenses');
  }
};
