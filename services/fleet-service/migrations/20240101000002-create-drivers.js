'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Drivers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      licenseNumber: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      licenseCategory: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      licenseExpiryDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      contactNumber: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        validate: { isEmail: true }
      },
      safetyScore: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
        validate: { min: 0, max: 100 }
      },
      status: {
        type: Sequelize.ENUM('Available', 'On Trip', 'Off Duty', 'Suspended'),
        defaultValue: 'Available'
      },
      hireDate: {
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

    await queryInterface.addIndex('Drivers', ['licenseNumber']);
    await queryInterface.addIndex('Drivers', ['status']);
    await queryInterface.addIndex('Drivers', ['licenseExpiryDate']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Drivers');
  }
};