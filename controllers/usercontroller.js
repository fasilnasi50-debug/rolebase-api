const db = require('../config/db');
const { parseProfileUpdates, updateProfile } = require('../utils/profile');

exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, full_name, email, phone, address, created_at
             FROM users WHERE id = ?`,
            [req.user.id]
        );
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            user: users[0]
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve profile'
        });
    }
};

exports.updateProfile = async (req, res) => {
    const parsed = parseProfileUpdates(req.body);
    if (parsed.error) {
        return res.status(400).json({ success: false, message: parsed.error });
    }

    try {
        const result = await updateProfile('users', req.user.id, parsed.updates);
        if (result === 'not-found') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (result === 'duplicate') {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully'
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
            message: 'Profile update failed'
        });
    }
};
