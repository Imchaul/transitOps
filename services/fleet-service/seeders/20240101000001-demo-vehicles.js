'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Vehicles', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        registrationNumber: 'VAN-001',
        name: 'City Delivery Van',
        model: 'Ford Transit',
        type: 'Van',
        maxLoadCapacity: 500,
        odometer: 15000,
        acquisitionCost: 25000,
        status: 'Available',
        region: 'North',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        registrationNumber: 'VAN-002',
        name: 'Express Cargo Van',
        model: 'Mercedes Sprinter',
        type: 'Van',
        maxLoadCapacity: 800,
        odometer: 8000,
        acquisitionCost: 35000,
        status: 'Available',
        region: 'South',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        registrationNumber: 'TRK-001',
        name: 'Heavy Hauler',
        model: 'Volvo FH',
        type: 'Truck',
        maxLoadCapacity: 2000,
        odometer: 45000,
        acquisitionCost: 75000,
        status: 'In Shop',
        region: 'North',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        registrationNumber: 'BUS-001',
        name: 'City Bus',
        model: 'Scania',
        type: 'Bus',
        maxLoadCapacity: 3000,
        odometer: 60000,
        acquisitionCost: 100000,
        status: 'Available',
        region: 'East',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        registrationNumber: 'CAR-001',
        name: 'Staff Car',
        model: 'Toyota Camry',
        type: 'Car',
        maxLoadCapacity: 100,
        odometer: 25000,
        acquisitionCost: 15000,
        status: 'Retired',
        region: 'West',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Vehicles', null, {});
  }
};