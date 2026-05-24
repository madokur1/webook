const db = require('../config/database');
const { createTables, seedInitialData } = require('../config/schema');
const bcrypt = require('bcryptjs');

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    await createTables();
    console.log('✓ Tables created successfully');
    
    await seedInitialData();
    console.log('✓ Initial data seeded');

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dreds.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, row) => {
      if (!row) {
        db.run(
          'INSERT INTO users (email, password, full_name, user_type) VALUES (?, ?, ?, ?)',
          [adminEmail, hashedPassword, 'Administrator', 'admin'],
          (err) => {
            if (err) {
              console.error('Error creating admin user:', err.message);
            } else {
              console.log('✓ Default admin user created');
              console.log(`  Email: ${adminEmail}`);
              console.log(`  Password: ${adminPassword} (Change this!)`);
            }
            process.exit(0);
          }
        );
      } else {
        console.log('✓ Admin user already exists');
        process.exit(0);
      }
    });
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
};

setupDatabase();
