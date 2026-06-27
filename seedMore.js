const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const newServices = [
  { name: 'Home Cleaning', description: 'Deep cleaning for your entire home.', category: 'Cleaning', base_price: 2500 },
  { name: 'Carpentry & Woodwork', description: 'Custom furniture, repairs, and woodwork.', category: 'Carpenter', base_price: 3000 }
];

const newProviders = [
  // Cleaning
  { name: 'Priya Sharma', firstName: 'priya', category: 'Cleaning', phone: '9876543310', exp: 4 },
  { name: 'Anita Desai', firstName: 'anita', category: 'Cleaning', phone: '9876543311', exp: 6 },
  { name: 'Kavita Reddy', firstName: 'kavita', category: 'Cleaning', phone: '9876543312', exp: 3 },
  { name: 'Sunita Menon', firstName: 'sunita', category: 'Cleaning', phone: '9876543313', exp: 8 },
  { name: 'Meera Iyer', firstName: 'meera', category: 'Cleaning', phone: '9876543314', exp: 5 },
  
  // Carpenter
  { name: 'Raju Mistri', firstName: 'raju', category: 'Carpenter', phone: '9876543315', exp: 15 },
  { name: 'Ashok Kumar', firstName: 'ashok', category: 'Carpenter', phone: '9876543316', exp: 12 },
  { name: 'Babu Ram', firstName: 'babu', category: 'Carpenter', phone: '9876543317', exp: 8 },
  { name: 'Gopal Krishnan', firstName: 'gopal', category: 'Carpenter', phone: '9876543318', exp: 10 },
  { name: 'Mohan Das', firstName: 'mohan', category: 'Carpenter', phone: '9876543319', exp: 7 },
];

async function seedMore() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'servicehub',
  });

  console.log('Connected to database. Seeding missing services and providers...');

  try {
    // 1. Insert Services
    for (const s of newServices) {
      await pool.execute(
        'INSERT IGNORE INTO services (name, description, category, base_price) VALUES (?, ?, ?, ?)',
        [s.name, s.description, s.category, s.base_price]
      );
      console.log(`Inserted service: ${s.name}`);
    }

    // 2. Insert Providers
    for (const p of newProviders) {
      const email = `${p.firstName}@gmail.com`;
      const rawPassword = `${p.firstName}1122`;
      
      const [existingUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        console.log(`User ${email} already exists. Skipping...`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);
      const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff&size=200`;

      const [userResult] = await pool.execute(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        [p.name, email, hashedPassword, 'provider', p.phone]
      );
      
      const userId = userResult.insertId;

      await pool.execute(
        'INSERT INTO providers (user_id, name, email, password, phone, skills, experience_years, profile_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, p.name, email, hashedPassword, p.phone, p.category, p.exp, profileImage, 'approved']
      );

      console.log(`Seeded provider: ${p.name} (${email}) - Category: ${p.category}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

seedMore();
