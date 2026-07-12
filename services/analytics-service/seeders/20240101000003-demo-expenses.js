'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Expenses', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        vehicleId: '11111111-1111-1111-1111-111111111111', // VAN-001
        tripId: '11111111-1111-1111-1111-111111111111', // TRP-2024-001
        type: 'Toll',
        description: 'Highway toll - Route 1',
        amount: 15,
        date: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z')
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        vehicleId: '11111111-1111-1111-1111-111111111111', // VAN-001
        tripId: '11111111-1111-1111-1111-111111111111', // TRP-2024-001
        type: 'Parking',
        description: 'City Center Mall parking',
        amount: 10,
        date: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z')
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        vehicleId: '33333333-3333-3333-3333-333333333333', // TRK-001
        tripId: null,
        type: 'Repair',
        description: 'Engine diagnostic and repair',
        amount: 500,
        date: new Date('2024-01-12'),
        createdAt: new Date('2024-01-12T09:00:00Z'),
        updatedAt: new Date('2024-01-12T09:00:00Z')
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        vehicleId: '44444444-4444-4444-4444-444444444444', // BUS-001
        tripId: null,
        type: 'Insurance',
        description: 'Annual vehicle insurance renewal',
        amount: 1200,
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z')
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        vehicleId: '22222222-2222-2222-2222-222222222222', // VAN-002
        tripId: null,
        type: 'Cleaning',
        description: 'Vehicle interior and exterior cleaning',
        amount: 50,
        date: new Date('2024-01-10'),
        createdAt: new Date('2024-01-10T11:00:00Z'),
        updatedAt: new Date('2024-01-10T11:00:00Z')
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Expenses', null, {});
  }
};