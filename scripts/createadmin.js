
require('dotenv').config();

const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error('Admin environment variables are required');
        }

        const [existingAdmin] = await db.query(
            'SELECT id FROM admins WHERE email = ?',
            [ADMIN_EMAIL]
        );

        if (existingAdmin.length > 0) {
            console.log('Admin already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const [result] = await db.query(
            `INSERT INTO admins (full_name, email, password)
             VALUES (?, ?, ?)`,
            [ADMIN_NAME, ADMIN_EMAIL, hashedPassword]
        );

        console.log('Admin created successfully!');
        console.log('Admin ID:', result.insertId);
        console.log('Admin Email:', ADMIN_EMAIL);

    } catch (error) {
        console.error('Admin creation failed:', error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
};

createAdmin();
