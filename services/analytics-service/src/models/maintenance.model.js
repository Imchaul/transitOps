const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('MaintenanceLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Oil Change', 'Tire Change', 'Brake Repair', 'Engine Repair', 'Regular Service', 'Other'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    odometer: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    status: {
      type: DataTypes.ENUM('Active', 'Completed'),
      defaultValue: 'Active'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true
  });
};