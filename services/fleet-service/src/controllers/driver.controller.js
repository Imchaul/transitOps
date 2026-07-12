const { Driver } = require('../models');
const { Op } = require('sequelize');

exports.createDriver = async (req, res) => {
  try {
    const { licenseNumber } = req.body;
    
    const existing = await Driver.findOne({ where: { licenseNumber } });
    if (existing) {
      return res.status(409).json({ error: 'Driver license number already exists' });
    }

    // Check license expiry
    if (new Date(req.body.licenseExpiryDate) < new Date()) {
      return res.status(400).json({ error: 'License expiry date must be in the future' });
    }

    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const drivers = await Driver.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(drivers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    if (req.body.licenseNumber && req.body.licenseNumber !== driver.licenseNumber) {
      const existing = await Driver.findOne({ 
        where: { licenseNumber: req.body.licenseNumber } 
      });
      if (existing) {
        return res.status(409).json({ error: 'License number already exists' });
      }
    }

    await driver.update(req.body);
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    if (driver.status === 'On Trip') {
      return res.status(400).json({ error: 'Cannot delete driver that is on trip' });
    }

    await driver.destroy();
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: { 
        status: 'Available',
        licenseExpiryDate: { [Op.gt]: new Date() }
      }
    });
    res.json(drivers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};