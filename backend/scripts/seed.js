const { sequelize, User, Role, Station, Taxpayer, Tank } = require('../models');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Create roles with permissions
    const adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator with full access',
      permissions: {
        user_create: true,
        user_read: true,
        user_update: true,
        user_delete: true,
        role_create: true,
        role_read: true,
        role_update: true,
        role_delete: true,
        taxpayer_create: true,
        taxpayer_read: true,
        taxpayer_update: true,
        taxpayer_delete: true,
        station_create: true,
        station_read: true,
        station_update: true,
        station_delete: true,
        tank_create: true,
        tank_read: true,
        tank_update: true,
        tank_delete: true,
        transaction_create: true,
        transaction_read: true,
        transaction_update: true,
        transaction_delete: true,
        alert_create: true,
        alert_read: true,
        alert_update: true,
        alert_delete: true,
        maintenance_create: true,
        maintenance_read: true,
        maintenance_update: true,
        maintenance_delete: true,
        backup_create: true,
        backup_read: true,
        backup_delete: true,
      },
    });

    const userRole = await Role.create({
      name: 'user',
      description: 'Regular user with limited access',
      permissions: {
        user_read: true,
        tank_create: true,
        tank_read: true,
        tank_update: true,
        tank_delete: true,
        transaction_create: true,
        transaction_read: true,
        transaction_update: true,
        alert_read: true,
        alert_update: true,
        maintenance_read: true,
        maintenance_update: true,
      },
    });

    const managerRole = await Role.create({
      name: 'manager',
      description: 'Station manager with extended permissions',
      permissions: {
        user_read: true,
        user_create: true,
        user_update: true,
        station_read: true,
        station_update: true,
        tank_create: true,
        tank_read: true,
        tank_update: true,
        tank_delete: true,
        transaction_create: true,
        transaction_read: true,
        transaction_update: true,
        transaction_delete: true,
        alert_create: true,
        alert_read: true,
        alert_update: true,
        maintenance_create: true,
        maintenance_read: true,
        maintenance_update: true,
      },
    });

    // Create admin user
    const adminUser = await User.create({
      username: 'Administrator',
      email: 'admin@gasstation.com',
      password: 'admin123',
      role_id: adminRole.id,
    });

    // Create regular user
    const regularUser = await User.create({
      username: 'Regular User',
      email: 'user@gasstation.com',
      password: 'user123',
      role_id: userRole.id,
      created_by: adminUser.id,
    });

    // Create manager user
    const managerUser = await User.create({
      username: 'Station Manager',
      email: 'manager@gasstation.com',
      password: 'manager123',
      role_id: managerRole.id,
      created_by: adminUser.id,
    });

    // Create taxpayer
    const taxpayer = await Taxpayer.create({
      tin: '123456789',
      vrn: 'VRN123456789',
      phone: '+255123456789',
      email: 'taxpayer@example.com',
      licence_trns: 'LIC123456789',
    });

    // Create station
    const station = await Station.create({
      name: 'EAGLESTAR Main Station',
      ward: 'Kinondoni',
      district: 'Kinondoni',
      region: 'Dar es Salaam',
      zone: 'Eastern',
      street: 'Morogoro Road',
      licence: 'STA123456789',
      operator_name: 'John Doe',
      taxpayer_id: taxpayer.id,
    });

    // Create tanks
    const tanks = [
      {
        tank_number: '1',
        name: 'Tank 1',
        fuel_type: 'premium',
        capacity: 10000,
        current_volume: 4677,
        water_level: 0,
        temperature: 26.31,
        station_id: station.id,
      },
      {
        tank_number: '2',
        name: 'Tank 2',
        fuel_type: 'regular',
        capacity: 10000,
        current_volume: 5154,
        water_level: 0,
        temperature: 25.19,
        station_id: station.id,
      },
      {
        tank_number: '3',
        name: 'Tank 3',
        fuel_type: 'premium',
        capacity: 10000,
        current_volume: 0,
        water_level: 0,
        temperature: 0,
        station_id: station.id,
        status: 'inactive',
      },
      {
        tank_number: '4',
        name: 'Tank 4',
        fuel_type: 'diesel',
        capacity: 10000,
        current_volume: 0,
        water_level: 0,
        temperature: 0,
        station_id: station.id,
        status: 'inactive',
      },
    ];

    await Tank.bulkCreate(tanks);

    console.log('Seed data created successfully');
    console.log('Admin credentials: admin@gasstation.com / admin123');
    console.log('User credentials: user@gasstation.com / user123');
    console.log('Manager credentials: manager@gasstation.com / manager123');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await sequelize.close();
  }
};

seedData();