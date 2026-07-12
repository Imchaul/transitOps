const { MaintenanceLog, FuelLog, Expense } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

const FLEET_SERVICE_URL = process.env.FLEET_SERVICE_URL || 'http://fleet-service:3002';
const TRIP_SERVICE_URL = process.env.TRIP_SERVICE_URL || 'http://trip-service:3003';

class AnalyticsController {
  // Dashboard KPIs
  async getDashboardKPIs(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      // Get fleet data
      const vehicles = await this.getVehicles();
      const drivers = await this.getDrivers();
      const trips = await this.getTrips(startDate, endDate);

      // Calculate KPIs
      const activeVehicles = vehicles.filter(v => v.status === 'Available' || v.status === 'On Trip').length;
      const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
      const inMaintenance = vehicles.filter(v => v.status === 'In Shop').length;
      const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
      const pendingTrips = trips.filter(t => t.status === 'Draft').length;
      const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length;
      
      const fleetUtilization = vehicles.length > 0 
        ? ((activeVehicles - inMaintenance) / vehicles.length * 100).toFixed(2)
        : 0;

      res.json({
        activeVehicles,
        availableVehicles,
        inMaintenance,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilization: parseFloat(fleetUtilization)
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Fuel Efficiency Report
  async getFuelEfficiency(req, res) {
    try {
      const { vehicleId, startDate, endDate } = req.query;
      
      const where = {};
      if (vehicleId) where.vehicleId = vehicleId;
      if (startDate && endDate) {
        where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      const fuelLogs = await FuelLog.findAll({ where });
      const trips = await this.getTrips(startDate, endDate);

      const efficiency = fuelLogs.map(log => {
        const trip = trips.find(t => t.id === log.tripId);
        if (trip && trip.actualDistance) {
          return {
            vehicleId: log.vehicleId,
            fuelEfficiency: trip.actualDistance / log.liters,
            totalDistance: trip.actualDistance,
            totalFuel: log.liters,
            date: log.date
          };
        }
        return null;
      }).filter(Boolean);

      res.json(efficiency);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Operational Cost Report
  async getOperationalCost(req, res) {
    try {
      const { vehicleId, startDate, endDate } = req.query;
      
      const where = {};
      if (vehicleId) where.vehicleId = vehicleId;
      if (startDate && endDate) {
        where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      const fuelLogs = await FuelLog.findAll({ where });
      const maintenanceLogs = await MaintenanceLog.findAll({ where });
      const expenses = await Expense.findAll({ where });

      const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
      const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
      const totalExpenseCost = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      res.json({
        totalFuelCost,
        totalMaintenanceCost,
        totalExpenseCost,
        totalOperationalCost: totalFuelCost + totalMaintenanceCost + totalExpenseCost,
        fuelLogsCount: fuelLogs.length,
        maintenanceLogsCount: maintenanceLogs.length,
        expensesCount: expenses.length
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Vehicle ROI Report
  async getVehicleROI(req, res) {
    try {
      const vehicles = await this.getVehicles();
      
      const roiData = await Promise.all(vehicles.map(async (vehicle) => {
        const costs = await this.getVehicleCosts(vehicle.id);
        const trips = await this.getTripsByVehicle(vehicle.id);
        
        const revenue = trips.reduce((sum, t) => sum + (t.fuelCost || 0) * 2, 0); // Example: revenue = 2x fuel cost
        const totalCost = costs.totalFuelCost + costs.totalMaintenanceCost;
        const roi = vehicle.acquisitionCost > 0 
          ? ((revenue - totalCost) / vehicle.acquisitionCost * 100).toFixed(2)
          : 0;

        return {
          vehicleId: vehicle.id,
          registrationNumber: vehicle.registrationNumber,
          revenue,
          totalCost,
          acquisitionCost: vehicle.acquisitionCost,
          roi: parseFloat(roi),
          tripsCompleted: trips.length
        };
      }));

      res.json(roiData);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Maintenance Logs
  async createMaintenanceLog(req, res) {
    try {
      const { vehicleId, type, description, cost, odometer } = req.body;

      // Update vehicle status to 'In Shop'
      await this.updateVehicleStatus(vehicleId, 'In Shop');

      const log = await MaintenanceLog.create({
        vehicleId,
        type,
        description,
        cost,
        odometer,
        date: new Date(),
        status: 'Active'
      });

      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async completeMaintenance(req, res) {
    try {
      const log = await MaintenanceLog.findByPk(req.params.id);
      if (!log) {
        return res.status(404).json({ error: 'Maintenance log not found' });
      }

      if (log.status === 'Completed') {
        return res.status(400).json({ error: 'Maintenance already completed' });
      }

      // Restore vehicle to Available
      await this.updateVehicleStatus(log.vehicleId, 'Available');

      await log.update({
        status: 'Completed',
        completedAt: new Date()
      });

      res.json(log);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Fuel Logs
  async createFuelLog(req, res) {
    try {
      const log = await FuelLog.create(req.body);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Expenses
  async createExpense(req, res) {
    try {
      const expense = await Expense.create(req.body);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Helper methods
  async getVehicles() {
    const response = await axios.get(`${FLEET_SERVICE_URL}/api/vehicles`);
    return response.data;
  }

  async getDrivers() {
    const response = await axios.get(`${FLEET_SERVICE_URL}/api/drivers`);
    return response.data;
  }

  async getTrips(startDate, endDate) {
    const response = await axios.get(`${TRIP_SERVICE_URL}/api/trips`);
    let trips = response.data;
    if (startDate && endDate) {
      trips = trips.filter(t => 
        new Date(t.createdAt) >= new Date(startDate) && 
        new Date(t.createdAt) <= new Date(endDate)
      );
    }
    return trips;
  }

  async getTripsByVehicle(vehicleId) {
    const response = await axios.get(`${TRIP_SERVICE_URL}/api/trips`);
    return response.data.filter(t => t.vehicleId === vehicleId && t.status === 'Completed');
  }

  async getVehicleCosts(vehicleId) {
    const fuelLogs = await FuelLog.findAll({ where: { vehicleId } });
    const maintenanceLogs = await MaintenanceLog.findAll({ where: { vehicleId } });
    
    return {
      totalFuelCost: fuelLogs.reduce((sum, l) => sum + l.cost, 0),
      totalMaintenanceCost: maintenanceLogs.reduce((sum, l) => sum + l.cost, 0)
    };
  }

  async updateVehicleStatus(vehicleId, status) {
    try {
      await axios.put(`${FLEET_SERVICE_URL}/api/vehicles/${vehicleId}`, { status });
    } catch (error) {
      throw new Error(`Failed to update vehicle status: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsController();