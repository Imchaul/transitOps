const { Trip } = require('../models');
const axios = require('axios');

// Service URLs
const FLEET_SERVICE_URL = process.env.FLEET_SERVICE_URL || 'http://fleet-service:3002';

class TripController {
  async createTrip(req, res) {
    try {
      const { vehicleId, driverId, cargoWeight } = req.body;

      // Validate vehicle exists and is available
      const vehicle = await this.validateVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      // Business Rule: Retired or In Shop vehicles cannot be assigned
      if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
        return res.status(400).json({ 
          error: 'Vehicle is retired or in shop and cannot be assigned' 
        });
      }

      // Business Rule: Vehicle on trip cannot be assigned
      if (vehicle.status === 'On Trip') {
        return res.status(400).json({ error: 'Vehicle is already on a trip' });
      }

      // Business Rule: Cargo weight must not exceed capacity
      if (cargoWeight > vehicle.maxLoadCapacity) {
        return res.status(400).json({ 
          error: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)` 
        });
      }

      // Validate driver
      const driver = await this.validateDriver(driverId);
      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      // Business Rule: Driver with expired license cannot be assigned
      if (new Date(driver.licenseExpiryDate) < new Date()) {
        return res.status(400).json({ error: 'Driver license has expired' });
      }

      // Business Rule: Suspended driver cannot be assigned
      if (driver.status === 'Suspended') {
        return res.status(400).json({ error: 'Driver is suspended' });
      }

      // Business Rule: Driver on trip cannot be assigned
      if (driver.status === 'On Trip') {
        return res.status(400).json({ error: 'Driver is already on a trip' });
      }

      // Generate trip number
      const tripNumber = `TRP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const trip = await Trip.create({
        ...req.body,
        tripNumber,
        status: 'Draft'
      });

      res.status(201).json(trip);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async dispatchTrip(req, res) {
    try {
      const trip = await Trip.findByPk(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      if (trip.status !== 'Draft') {
        return res.status(400).json({ error: 'Only draft trips can be dispatched' });
      }

      // Update vehicle and driver status to On Trip
      await this.updateVehicleStatus(trip.vehicleId, 'On Trip');
      await this.updateDriverStatus(trip.driverId, 'On Trip');

      await trip.update({
        status: 'Dispatched',
        dispatchedAt: new Date(),
        startOdometer: req.body.startOdometer
      });

      res.json(trip);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async completeTrip(req, res) {
    try {
      const trip = await Trip.findByPk(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      if (trip.status !== 'Dispatched') {
        return res.status(400).json({ error: 'Only dispatched trips can be completed' });
      }

      const { endOdometer, fuelConsumed, fuelCost } = req.body;

      // Business Rule: End odometer must be greater than start odometer
      if (endOdometer <= trip.startOdometer) {
        return res.status(400).json({ 
          error: 'End odometer must be greater than start odometer' 
        });
      }

      // Update vehicle and driver status back to Available
      await this.updateVehicleStatus(trip.vehicleId, 'Available');
      await this.updateDriverStatus(trip.driverId, 'Available');

      await trip.update({
        status: 'Completed',
        completedAt: new Date(),
        endOdometer,
        fuelConsumed,
        fuelCost,
        actualDistance: endOdometer - trip.startOdometer
      });

      res.json(trip);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelTrip(req, res) {
    try {
      const trip = await Trip.findByPk(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      if (trip.status === 'Completed' || trip.status === 'Cancelled') {
        return res.status(400).json({ error: 'Cannot cancel completed or cancelled trip' });
      }

      // If trip was dispatched, restore vehicle and driver to Available
      if (trip.status === 'Dispatched') {
        await this.updateVehicleStatus(trip.vehicleId, 'Available');
        await this.updateDriverStatus(trip.driverId, 'Available');
      }

      await trip.update({ status: 'Cancelled' });
      res.json(trip);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllTrips(req, res) {
    try {
      const { status } = req.query;
      const where = {};
      if (status) where.status = status;

      const trips = await Trip.findAll({ 
        where, 
        order: [['createdAt', 'DESC']] 
      });
      res.json(trips);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTripById(req, res) {
    try {
      const trip = await Trip.findByPk(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      res.json(trip);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getActiveTrips(req, res) {
    try {
      const trips = await Trip.findAll({
        where: { status: 'Dispatched' },
        order: [['dispatchedAt', 'DESC']]
      });
      res.json(trips);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Helper methods
  async validateVehicle(vehicleId) {
    try {
      const response = await axios.get(`${FLEET_SERVICE_URL}/api/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async validateDriver(driverId) {
    try {
      const response = await axios.get(`${FLEET_SERVICE_URL}/api/drivers/${driverId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateVehicleStatus(vehicleId, status) {
    try {
      await axios.put(`${FLEET_SERVICE_URL}/api/vehicles/${vehicleId}`, { status });
    } catch (error) {
      throw new Error(`Failed to update vehicle status: ${error.message}`);
    }
  }

  async updateDriverStatus(driverId, status) {
    try {
      await axios.put(`${FLEET_SERVICE_URL}/api/drivers/${driverId}`, { status });
    } catch (error) {
      throw new Error(`Failed to update driver status: ${error.message}`);
    }
  }
}

module.exports = new TripController();