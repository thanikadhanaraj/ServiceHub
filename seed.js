const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log("Seeding database...");

        // 1. Ensure "Painting" and "Plumbing" services exist
        const [services] = await pool.execute('SELECT * FROM services');
        
        const categories = [
            { name: 'House Painting', category: 'Painting', description: 'Professional interior and exterior painting.', base_price: 150 },
            { name: 'Pipe Fixing', category: 'Plumbing', description: 'Fixing leaks, pipes, and drains.', base_price: 80 }
        ];

        for (let cat of categories) {
            const exists = services.find(s => s.name === cat.name);
            if (!exists) {
                await pool.execute(
                    'INSERT INTO services (name, description, category, base_price) VALUES (?, ?, ?, ?)',
                    [cat.name, cat.description, cat.category, cat.base_price]
                );
            }
        }

        // 2. Create Dummy Users and Providers
        const dummyProviders = [
            { name: 'John Painter', email: 'john@painter.com', category: 'Painting', skills: 'Painting, Decorating', exp: 5 },
            { name: 'Alice Colors', email: 'alice@painter.com', category: 'Painting', skills: 'Painting, Art', exp: 3 },
            { name: 'Bob Plumber', email: 'bob@plumber.com', category: 'Plumbing', skills: 'Plumbing, Pipe Fitting', exp: 10 },
            { name: 'Charlie Pipes', email: 'charlie@plumber.com', category: 'Plumbing', skills: 'Plumbing', exp: 2 }
        ];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        for (let dp of dummyProviders) {
            // Check if user exists
            const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [dp.email]);
            if (users.length === 0) {
                const [userRes] = await pool.execute(
                    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
                    [dp.name, dp.email, hashedPassword, 'provider', '1234567890']
                );
                
                await pool.execute(
                    'INSERT INTO providers (user_id, name, email, password, phone, skills, experience_years, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [userRes.insertId, dp.name, dp.email, hashedPassword, '1234567890', dp.skills, dp.exp, 'approved']
                );
            }
        }

        // 3. Create dummy customer and reviews
        const [customerCheck] = await pool.execute('SELECT id FROM users WHERE email = ?', ['dummycust@test.com']);
        let custId;
        if (customerCheck.length === 0) {
            const [custRes] = await pool.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Dummy Customer', 'dummycust@test.com', hashedPassword, 'customer']
            );
            custId = custRes.insertId;
        } else {
            custId = customerCheck[0].id;
        }

        // Find providers
        const [allProviders] = await pool.execute('SELECT id, name FROM providers');
        const [allServices] = await pool.execute('SELECT id, category FROM services');

        for (let prov of allProviders) {
            // Give each provider 2 reviews
            const [existingReviews] = await pool.execute('SELECT id FROM reviews WHERE provider_id = ?', [prov.id]);
            if (existingReviews.length < 2) {
                // We need a dummy booking first
                const service = allServices[0]; // just pick first
                const [bookRes] = await pool.execute(
                    'INSERT INTO bookings (customer_id, provider_id, service_id, scheduled_date, scheduled_time, address, status, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [custId, prov.id, service.id, '2026-06-20', '10:00:00', '123 Test St', 'Completed', 100]
                );

                await pool.execute(
                    'INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
                    [bookRes.insertId, custId, prov.id, 4 + Math.floor(Math.random() * 2), `Great job by ${prov.name}!`]
                );
                
                const [bookRes2] = await pool.execute(
                    'INSERT INTO bookings (customer_id, provider_id, service_id, scheduled_date, scheduled_time, address, status, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [custId, prov.id, service.id, '2026-06-21', '10:00:00', '123 Test St', 'Completed', 100]
                );

                await pool.execute(
                    'INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
                    [bookRes2.insertId, custId, prov.id, 5, `Excellent service.`]
                );
            }
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seed();
