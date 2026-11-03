
const express = require('express');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authroutes');
const authMiddleware = require('./middleware/authmiddleware');
const roleMiddleware = require('./middleware/rolemiddleware');
const userRoutes = require('./routes/userroutes');
const adminRoutes = require('./routes/adminroutes');



const app = express();

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Role API server is running!'
    });
});

app.get('/db-test', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS result');

        res.status(200).json({
            success: true,
            message: 'MySQL database connected successfully!',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});



app.get('/api/protected', authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'You accessed a protected API',
        user: req.user
    });
});
app.get(
    '/api/user-only',
    authMiddleware,
    roleMiddleware('user'),
    (req, res) => {
        res.json({
            success: true,
            message: 'Welcome User!'
        });
    }
);

app.get(
    '/api/admin-only',
    authMiddleware,
    roleMiddleware('admin'),
    (req, res) => {
        res.json({
            success: true,
            message: 'Welcome Admin!'
        });
    }
);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Role API server running on port ${PORT}`);
});
