const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Vehicle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    registrationNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Truck', 'Van', 'Bus', 'Car', 'Motorcycle'),
      allowNull: false
    },
    maxLoadCapacity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    odometer: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: { min: 0 }
    },
    acquisitionCost: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    status: {
      type: DataTypes.ENUM('Available', 'On Trip', 'In Shop', 'Retired'),
      defaultValue: 'Available'
    },
    region: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    currentDriverId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true
  });
};