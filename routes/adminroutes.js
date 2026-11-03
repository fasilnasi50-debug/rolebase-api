const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    listUsers,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/admincontroller');
const authMiddleware = require('../middleware/authmiddleware');
const roleMiddleware = require('../middleware/rolemiddleware');

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
