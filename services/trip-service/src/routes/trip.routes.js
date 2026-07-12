const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');

router.post('/', tripController.createTrip);
router.get('/', tripController.getAllTrips);
router.get('/active', tripController.getActiveTrips);
router.get('/:id', tripController.getTripById);
router.put('/:id/dispatch', tripController.dispatchTrip);
router.put('/:id/complete', tripController.completeTrip);
router.put('/:id/cancel', tripController.cancelTrip);

module.exports = router;