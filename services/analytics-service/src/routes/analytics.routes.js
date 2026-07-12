const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// Dashboard
router.get('/dashboard', analyticsController.getDashboardKPIs);

// Reports
router.get('/fuel-efficiency', analyticsController.getFuelEfficiency);
router.get('/operational-cost', analyticsController.getOperationalCost);
router.get('/vehicle-roi', analyticsController.getVehicleROI);

// Maintenance
router.post('/maintenance', analyticsController.createMaintenanceLog);
router.put('/maintenance/:id/complete', analyticsController.completeMaintenance);

// Fuel
router.post('/fuel', analyticsController.createFuelLog);

// Expenses
router.post('/expenses', analyticsController.createExpense);

module.exports = router;