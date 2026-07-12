'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('FuelLogs', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        vehicleId: '11111111-1111-1111-1111-111111111111', // VAN-001
        tripId: '11111111-1111-1111-1111-111111111111', // TRP-2024-001
        date: new Date('2024-01-15'),
        liters: 25,
        cost: 75,
        odometer: 15048,
        fuelType: 'Diesel',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z')
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        vehicleId: '11111111-1111-1111-1111-111111111111', // VAN-001
        tripId: null,
        date: new Date('2024-01-12'),
        liters: 30,
        cost: 90,
        odometer: 14500,
        fuelType: 'Diesel',
        createdAt: new Date('2024-01-12T16:00:00Z'),
        updatedAt: new Date('2024-01-12T16:00:00Z')
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        vehicleId: '22222222-2222-2222-2222-222222222222', // VAN-002
        tripId: null,
        date: new Date('2024-01-14'),
        liters: 35,
        cost: 105,
        odometer: 8000,
        fuelType: 'Diesel',
        createdAt: new Date('2024-01-14T15:00:00Z'),
        updatedAt: new Date('2024-01-14T15:00:00Z')
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        vehicleId: '44444444-4444-4444-4444-444444444444', // BUS-001
        tripId: null,
        date: new Date('2024-01-13'),
        liters: 60,
        cost: 180,
        odometer: 59500,
        fuelType: 'Petrol',
        createdAt: new Date('2024-01-13T14:00:00Z'),
        updatedAt: new Date('2024-01-13T14:00:00Z')
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FuelLogs', null, {});
  }
};