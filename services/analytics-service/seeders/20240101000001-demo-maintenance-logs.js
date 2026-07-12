'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('MaintenanceLogs', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        vehicleId: '11111111-1111-1111-1111-111111111111', // VAN-001
        type: 'Oil Change',
        description: 'Regular oil change and filter replacement',
        cost: 150,
        date: new Date('2024-01-10'),
        odometer: 14500,
        status: 'Completed',
        completedAt: new Date('2024-01-10T14:00:00Z'),
        createdAt: new Date('2024-01-10T10:00:00Z'),
        updatedAt: new Date('2024-01-10T14:00:00Z')
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        vehicleId: '33333333-3333-3333-3333-333333333333', // TRK-001
        type: 'Engine Repair',
        description: 'Major engine overhaul - cylinder replacement',
        cost: 2500,
        date: new Date('2024-01-12'),
        odometer: 45000,
        status: 'Active',
        completedAt: null,
        createdAt: new Date('2024-01-12T09:00:00Z'),
        updatedAt: new Date('2024-01-12T09:00:00Z')
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        vehicleId: '44444444-4444-4444-4444-444444444444', // BUS-001
        type: 'Tire Change',
        description: 'Replaced all 6 tires with new ones',
        cost: 800,
        date: new Date('2024-01-05'),
        odometer: 59000,
        status: 'Completed',
        completedAt: new Date('2024-01-05T16:00:00Z'),
        createdAt: new Date('2024-01-05T11:00:00Z'),
        updatedAt: new Date('2024-01-05T16:00:00Z')
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        vehicleId: '22222222-2222-2222-2222-222222222222', // VAN-002
        type: 'Brake Repair',
        description: 'Brake pad replacement and rotor resurfacing',
        cost: 350,
        date: new Date('2024-01-08'),
        odometer: 7800,
        status: 'Completed',
        completedAt: new Date('2024-01-08T12:30:00Z'),
        createdAt: new Date('2024-01-08T10:00:00Z'),
        updatedAt: new Date('2024-01-08T12:30:00Z')
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('MaintenanceLogs', null, {});
  }
};