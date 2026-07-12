#!/bin/bash

echo "📝 Creating migrations for all services..."

# Auth Service Migrations
echo "Creating Auth Service migrations..."

cat > services/auth-service/migrations/20240101000001-create-users.js << 'EOF'
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      lastName: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      refreshToken: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      roleId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Users', ['email']);
    await queryInterface.addIndex('Users', ['username']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
EOF

cat > services/auth-service/migrations/20240101000002-create-roles.js << 'EOF'
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Roles');
  }
};
EOF

cat > services/auth-service/migrations/20240101000003-create-permissions.js << 'EOF'
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      resource: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      action: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Permissions');
  }
};
EOF

# Fleet Service Migrations
echo "Creating Fleet Service migrations..."

cat > services/fleet-service/migrations/20240101000001-create-vehicles.js << 'EOF'
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      registrationNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      model: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Truck', 'Van', 'Bus', 'Car', 'Motorcycle'),
        allowNull: false
      },
      maxLoadCapacity: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      odometer: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      acquisitionCost: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Available', 'On Trip', 'In Shop', 'Retired'),
        defaultValue: 'Available'
      },
      region: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      currentDriverId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      lastMaintenanceDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      nextMaintenanceDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Vehicles', ['registrationNumber']);
    await queryInterface.addIndex('Vehicles', ['status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vehicles');
  }
};
EOF

cat > services/fleet-service/migrations/20240101000002-create-drivers.js << 'EOF'
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Drivers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      licenseNumber: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      licenseCategory: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      licenseExpiryDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      contactNumber: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      safetyScore: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      status: {
        type: Sequelize.ENUM('Available', 'On Trip', 'Off Duty', 'Suspended'),
        defaultValue: 'Available'
      },
      hireDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Drivers', ['licenseNumber']);
    await queryInterface.addIndex('Drivers', ['status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Drivers');
  }
};
EOF

# Trip Service Migrations
echo "Creating Trip Service migrations..."

cat > services/trip-service/migrations/20240101000001-create-trips.js << 'EOF'
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Trips', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tripNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      destination: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      cargoWeight: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      plannedDistance: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      actualDistance: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      vehicleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      driverId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled'),
        defaultValue: 'Draft'
      },
      dispatchedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      startOdometer: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      endOdometer: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      fuelConsumed: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      fuelCost: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Trips', ['tripNumber']);
    await queryInterface.addIndex('Trips', ['vehicleId']);
    await queryInterface.addIndex('Trips', ['driverId']);
    await queryInterface.addIndex('Trips', ['status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Trips');
  }
};
EOF

# Analytics Service Migrations
echo "Creating Analytics Service migrations..."

cat > services/analytics-service/migrations/20240101000001-create-maintenance-logs.js << 'EOF'
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MaintenanceLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      vehicleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Oil Change', 'Tire Change', 'Brake Repair', 'Engine Repair', 'Regular Service', 'Other'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cost: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      odometer: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('Active', 'Completed'),
        defaultValue: 'Active'
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('MaintenanceLogs', ['vehicleId']);
    await queryInterface.addIndex('MaintenanceLogs', ['status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MaintenanceLogs');
  }
};
EOF

cat > services/analytics-service/migrations/20240101000002-create-fuel-logs.js << 'EOF'
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FuelLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      vehicleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      tripId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      liters: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      cost: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      odometer: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      fuelType: {
        type: Sequelize.ENUM('Diesel', 'Petrol', 'CNG', 'Electric'),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('FuelLogs', ['vehicleId']);
    await queryInterface.addIndex('FuelLogs', ['tripId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FuelLogs');
  }
};
EOF

cat > services/analytics-service/migrations/20240101000003-create-expenses.js << 'EOF'
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Expenses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      vehicleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      tripId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('Toll', 'Parking', 'Cleaning', 'Repair', 'Insurance', 'Other'),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Expenses', ['vehicleId']);
    await queryInterface.addIndex('Expenses', ['type']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Expenses');
  }
};
EOF

echo "✅ All migrations created!"
echo ""
echo "📁 Migration files created:"
echo "  Auth Service: 3 migrations"
echo "  Fleet Service: 2 migrations"
echo "  Trip Service: 1 migration"
echo "  Analytics Service: 3 migrations"