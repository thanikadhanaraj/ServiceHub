const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const providersData = [
  // Painting
  { name: 'Akshaya Kumar', firstName: 'akshaya', category: 'Painting', phone: '9876543210', exp: 5 },
  { name: 'Rajesh Sharma', firstName: 'rajesh', category: 'Painting', phone: '9876543211', exp: 7 },
  { name: 'Suresh Raina', firstName: 'suresh', category: 'Painting', phone: '9876543212', exp: 4 },
  { name: 'Karthik Natarajan', firstName: 'karthik', category: 'Painting', phone: '9876543213', exp: 6 },
  { name: 'Manoj Tiwari', firstName: 'manoj', category: 'Painting', phone: '9876543214', exp: 8 },
  
  // Plumbing
  { name: 'Ramesh Patel', firstName: 'ramesh', category: 'Plumbing', phone: '9876543215', exp: 10 },
  { name: 'Sanjay Dutt', firstName: 'sanjay', category: 'Plumbing', phone: '9876543216', exp: 6 },
  { name: 'Deepak Chahar', firstName: 'deepak', category: 'Plumbing', phone: '9876543217', exp: 3 },
  { name: 'Anand Mahindra', firstName: 'anand', category: 'Plumbing', phone: '9876543218', exp: 12 },
  { name: 'Vijay Shankar', firstName: 'vijay', category: 'Plumbing', phone: '9876543219', exp: 5 },

  // Electrical
  { name: 'Vikram Batra', firstName: 'vikram', category: 'Electrical', phone: '9876543220', exp: 7 },
  { name: 'Amit Mishra', firstName: 'amit', category: 'Electrical', phone: '9876543221', exp: 9 },
  { name: 'Rohan Bopanna', firstName: 'rohan', category: 'Electrical', phone: '9876543222', exp: 4 },
  { name: 'Rahul Dravid', firstName: 'rahul', category: 'Electrical', phone: '9876543223', exp: 15 },
  { name: 'Anil Kumble', firstName: 'anil', category: 'Electrical', phone: '9876543224', exp: 11 },

  // AC Repair
  { name: 'Sameer Verma', firstName: 'sameer', category: 'AC Repair', phone: '9876543225', exp: 6 },
  { name: 'Sunil Gavaskar', firstName: 'sunil', category: 'AC Repair', phone: '9876543226', exp: 8 },
  { name: 'Prakash Padukone', firstName: 'prakash', category: 'AC Repair', phone: '9876543227', exp: 5 },
  { name: 'Arvind Swamy', firstName: 'arvind', category: 'AC Repair', phone: '9876543228', exp: 7 },
  { name: 'Mahesh Babu', firstName: 'mahesh', category: 'AC Repair', phone: '9876543229', exp: 9 },
];

async function seedProviders() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'servicehub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log('Connected to database. Seeding providers...');

  try {
    for (const p of providersData) {
      const email = `${p.firstName}@gmail.com`;
      const rawPassword = `${p.firstName}1122`;
      
      // Check if user already exists
      const [existingUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        console.log(`User ${email} already exists. Skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      // Create profile image (UI avatar style)
      const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff&size=200`;

      // Insert into users table
      const [userResult] = await pool.execute(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        [p.name, email, hashedPassword, 'provider', p.phone]
      );
      
      const userId = userResult.insertId;

      // Insert into providers table
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

seedProviders();
