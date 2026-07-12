'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Trips', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        tripNumber: 'TRP-2024-001',
        source: 'Warehouse A, North Zone',
        destination: 'City Center Mall',
        cargoWeight: 300,
        plannedDistance: 50,
        actualDistance: 48,
        vehicleId: '11111111-1111-1111-1111-111111111111', // VAN-001
        driverId: '11111111-1111-1111-1111-111111111111', // John Smith
        status: 'Completed',
        dispatchedAt: new Date('2024-01-15T08:00:00Z'),
        completedAt: new Date('2024-01-15T10:30:00Z'),
        startOdometer: 15000,
        endOdometer: 15048,
        fuelConsumed: 25,
        fuelCost: 75,
        createdAt: new Date('2024-01-14T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z')
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        tripNumber: 'TRP-2024-002',
        source: 'Distribution Center, South Zone',
        destination: 'Tech Park',
        cargoWeight: 600,
        plannedDistance: 75,
        actualDistance: null,
        vehicleId: '22222222-2222-2222-2222-222222222222', // VAN-002
        driverId: '22222222-2222-2222-2222-222222222222', // Jane Doe
        status: 'Dispatched',
        dispatchedAt: new Date('2024-01-16T09:00:00Z'),
        completedAt: null,
        startOdometer: 8000,
        endOdometer: null,
        fuelConsumed: null,
        fuelCost: null,
        createdAt: new Date('2024-01-15T14:00:00Z'),
        updatedAt: new Date('2024-01-16T09:00:00Z')
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        tripNumber: 'TRP-2024-003',
        source: 'Factory, East Zone',
        destination: 'Port',
        cargoWeight: 1800,
        plannedDistance: 120,
        actualDistance: null,
        vehicleId: '33333333-3333-3333-3333-333333333333', // TRK-001 (In Shop)
        driverId: '33333333-3333-3333-3333-333333333333', // Mike Johnson (Suspended)
        status: 'Draft',
        dispatchedAt: null,
        completedAt: null,
        startOdometer: null,
        endOdometer: null,
        fuelConsumed: null,
        fuelCost: null,
        createdAt: new Date('2024-01-16T11:00:00Z'),
        updatedAt: new Date('2024-01-16T11:00:00Z')
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        tripNumber: 'TRP-2024-004',
        source: 'Airport, West Zone',
        destination: 'City Center Hotel',
        cargoWeight: 200,
        plannedDistance: 30,
        actualDistance: null,
        vehicleId: '44444444-4444-4444-4444-444444444444', // BUS-001
        driverId: '44444444-4444-4444-4444-444444444444', // Sarah Wilson (Off Duty)
        status: 'Cancelled',
        dispatchedAt: null,
        completedAt: null,
        startOdometer: null,
        endOdometer: null,
        fuelConsumed: null,
        fuelCost: null,
        createdAt: new Date('2024-01-15T16:00:00Z'),
        updatedAt: new Date('2024-01-15T17:30:00Z')
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        tripNumber: 'TRP-2024-005',
        source: 'Warehouse B, North Zone',
        destination: 'Shopping Mall',
        cargoWeight: 450,
        plannedDistance: 60,
        actualDistance: null,
        vehicleId: '11111111-1111-1111-1111-111111111111', // VAN-001
        driverId: '55555555-5555-5555-5555-555555555555', // David Brown (On Trip)
        status: 'Draft',
        dispatchedAt: null,
        completedAt: null,
        startOdometer: null,
        endOdometer: null,
        fuelConsumed: null,
        fuelCost: null,
        createdAt: new Date('2024-01-16T13:00:00Z'),
        updatedAt: new Date('2024-01-16T13:00:00Z')
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Trips', null, {});
  }
};