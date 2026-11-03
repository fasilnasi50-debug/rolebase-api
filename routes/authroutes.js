
const express = require('express');
const router = express.Router();

const {
    register,
    login,
    createAdmin,
    adminLogin
} = require('../controllers/authcontroller');

const authMiddleware = require('../middleware/authmiddleware');
const roleMiddleware = require('../middleware/rolemiddleware');

router.post('/register', register);
router.post('/login', login);

router.post(
    '/admin/create',
    authMiddleware,
    roleMiddleware('admin'),
    createAdmin
);

router.post('/admin/login', adminLogin);

module.exports = router;
