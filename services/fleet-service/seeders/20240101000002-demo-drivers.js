'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    
    const expiredDate = new Date();
    expiredDate.setFullYear(expiredDate.getFullYear() - 1);

    await queryInterface.bulkInsert('Drivers', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'John Smith',
        licenseNumber: 'DL-001',
        licenseCategory: 'B',
        licenseExpiryDate: futureDate,
        contactNumber: '+1234567890',
        email: 'john@transitops.com',
        safetyScore: 95,
        status: 'Available',
        hireDate: new Date('2023-01-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Jane Doe',
        licenseNumber: 'DL-002',
        licenseCategory: 'C',
        licenseExpiryDate: futureDate,
        contactNumber: '+1234567891',
        email: 'jane@transitops.com',
        safetyScore: 98,
        status: 'Available',
        hireDate: new Date('2023-03-20'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Mike Johnson',
        licenseNumber: 'DL-003',
        licenseCategory: 'B',
        licenseExpiryDate: expiredDate,
        contactNumber: '+1234567892',
        email: 'mike@transitops.com',
        safetyScore: 70,
        status: 'Suspended',
        hireDate: new Date('2022-06-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Sarah Wilson',
        licenseNumber: 'DL-004',
        licenseCategory: 'C',
        licenseExpiryDate: futureDate,
        contactNumber: '+1234567893',
        email: 'sarah@transitops.com',
        safetyScore: 92,
        status: 'Off Duty',
        hireDate: new Date('2023-08-01'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'David Brown',
        licenseNumber: 'DL-005',
        licenseCategory: 'B',
        licenseExpiryDate: futureDate,
        contactNumber: '+1234567894',
        email: 'david@transitops.com',
        safetyScore: 85,
        status: 'On Trip',
        hireDate: new Date('2023-10-05'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Drivers', null, {});
  }
};