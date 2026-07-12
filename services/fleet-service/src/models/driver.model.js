const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Driver', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    licenseNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    licenseCategory: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    licenseExpiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfter: new Date().toISOString().split('T')[0]
      }
    },
    contactNumber: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: { isEmail: true }
    },
    safetyScore: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      validate: { min: 0, max: 100 }
    },
    status: {
      type: DataTypes.ENUM('Available', 'On Trip', 'Off Duty', 'Suspended'),
      defaultValue: 'Available'
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true
  });
};
