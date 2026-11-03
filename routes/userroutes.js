
const express = require('express');
const router = express.Router();

const {
    getProfile,
    updateProfile
} = require('../controllers/usercontroller');

const authMiddleware = require('../middleware/authmiddleware');
const roleMiddleware = require('../middleware/rolemiddleware');

router.get(
    '/profile',
    authMiddleware,
    roleMiddleware('user'),
    getProfile
);

router.put(
    '/profile',
    authMiddleware,
    roleMiddleware('user'),
    updateProfile
);

module.exports = router;
