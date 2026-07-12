const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Trip', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tripNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cargoWeight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    plannedDistance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    actualDistance: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled'),
      defaultValue: 'Draft'
    },
    dispatchedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    startOdometer: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    endOdometer: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    fuelConsumed: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    fuelCost: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    }
  }, {
    timestamps: true
  });
};