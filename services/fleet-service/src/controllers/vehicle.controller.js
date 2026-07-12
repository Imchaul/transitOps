const { Vehicle } = require('../models');
const { Op } = require('sequelize');

exports.createVehicle = async (req, res) => {
  try {
    const { registrationNumber } = req.body;
    
    const existing = await Vehicle.findOne({ where: { registrationNumber } });
    if (existing) {
      return res.status(409).json({ error: 'Vehicle registration number already exists' });
    }

    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const { status, type, region } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (region) where.region = region;

    const vehicles = await Vehicle.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(vehicles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check if trying to update registration number to one that exists
    if (req.body.registrationNumber && req.body.registrationNumber !== vehicle.registrationNumber) {
      const existing = await Vehicle.findOne({ 
        where: { registrationNumber: req.body.registrationNumber } 
      });
      if (existing) {
        return res.status(409).json({ error: 'Registration number already exists' });
      }
    }

    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ error: 'Cannot delete vehicle that is on trip' });
    }

    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: { 
        status: { [Op.in]: ['Available', 'On Trip'] },
        [Op.not]: { status: ['In Shop', 'Retired'] }
      }
    });
    res.json(vehicles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};