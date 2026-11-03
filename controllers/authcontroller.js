const bcrypt = require('bcryptjs');
const db = require('../config/db');
const generateToken = require('../utils/generatetoken');

const validateCredentials = ({ full_name, email, password }) => {
    if (
        typeof full_name !== 'string' ||
        !full_name.trim() ||
        typeof email !== 'string' ||
        !email.trim() ||
        typeof password !== 'string' ||
        !password
    ) {
        return 'Full name, email, and password are required';
    }

    if (password.length < 6) {
        return 'Password must be at least 6 characters';
    }

    return null;
};

const createAccount = async (req, res, table, accountType) => {
    const body = req.body || {};
    const validationError = validateCredentials(body);
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    const fullName = body.full_name.trim();
    const email = body.email.trim().toLowerCase();

    try {
        const [existingAccounts] = await db.query(
            `SELECT id FROM ${table} WHERE email = ?`,
            [email]
        );
        if (existingAccounts.length > 0) {
            return res.status(409).json({
                success: false,
                message: accountType === 'user'
                    ? 'Email already registered'
                    : 'Admin email already exists'
            });
        }

        const passwordHash = await bcrypt.hash(body.password, 10);
        const [result] = await db.query(
            `INSERT INTO ${table} (full_name, email, password) VALUES (?, ?, ?)`,
            [fullName, email, passwordHash]
        );
        const account = { id: result.insertId, full_name: fullName, email };

        return res.status(201).json({
            success: true,
            message: accountType === 'user'
                ? 'User registered successfully'
                : 'Admin created successfully',
            [accountType]: account
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered'
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: accountType === 'user' ? 'Registration failed' : 'Admin creation failed'
        });
    }
};

const loginAccount = async (req, res, table, role) => {
    const { email, password } = req.body || {};
    if (
        typeof email !== 'string' ||
        !email.trim() ||
        typeof password !== 'string' ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    try {
        const [accounts] = await db.query(
            `SELECT id, full_name, email, password FROM ${table} WHERE email = ?`,
            [email.trim().toLowerCase()]
        );
        if (
            accounts.length === 0 ||
            !(await bcrypt.compare(password, accounts[0].password))
        ) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const account = accounts[0];
        const token = generateToken({
            id: account.id,
            email: account.email,
            role
        });

        return res.status(200).json({
            success: true,
            message: role === 'user' ? 'Login successful' : 'Admin login successful',
            token,
            [role]: {
                id: account.id,
                full_name: account.full_name,
                email: account.email,
                role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: role === 'user' ? 'Login failed' : 'Admin login failed'
        });
    }
};

exports.register = (req, res) => createAccount(req, res, 'users', 'user');
exports.createAdmin = (req, res) => createAccount(req, res, 'admins', 'admin');
exports.login = (req, res) => loginAccount(req, res, 'users', 'user');
exports.adminLogin = (req, res) => loginAccount(req, res, 'admins', 'admin');
