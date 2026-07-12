'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('Admin1234', 10);
    
    await queryInterface.bulkInsert('Users', [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        username: 'admin',
        email: 'admin@transitops.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        roleId: '11111111-1111-1111-1111-111111111111',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        username: 'fleet_manager',
        email: 'fleet@transitops.com',
        password: hashedPassword,
        firstName: 'Fleet',
        lastName: 'Manager',
        isActive: true,
        roleId: '22222222-2222-2222-2222-222222222222',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        username: 'driver_user',
        email: 'driver@transitops.com',
        password: hashedPassword,
        firstName: 'Driver',
        lastName: 'User',
        isActive: true,
        roleId: '33333333-3333-3333-3333-333333333333',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};