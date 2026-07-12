const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FuelLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    liters: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    odometer: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    fuelType: {
      type: DataTypes.ENUM('Diesel', 'Petrol', 'CNG', 'Electric'),
      allowNull: false
    }
  }, {
    timestamps: true
  });
};