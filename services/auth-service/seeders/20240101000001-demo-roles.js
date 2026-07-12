'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'admin',
        description: 'Administrator with full access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'fleet_manager',
        description: 'Fleet Manager with fleet operations access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'driver',
        description: 'Driver with trip management access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'safety_officer',
        description: 'Safety Officer with compliance access',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};