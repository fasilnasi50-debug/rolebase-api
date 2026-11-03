
const db = require('../config/db');
const {
    parseProfileUpdates,
    updateProfile
} = require('../utils/profile');

const userFields = 'id, full_name, email, phone, address, created_at';

const parseUserId = (value) => {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const handleUpdateResult = (res, result, entity) => {
    if (result === 'not-found') {
        return res.status(404).json({
            success: false,
            message: `${entity} not found`
        });
    }

    if (result === 'duplicate') {
        return res.status(409).json({
            success: false,
            message: 'Email is already registered'
        });
    }

    return null;
};

// Get Admin Profile
exports.getProfile = async (req, res) => {
    try {
        const [admins] = await db.query(
            `SELECT id, full_name, email, created_at
             FROM admins WHERE id = ?`,
            [req.user.id]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            admin: admins[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve profile'
        });
    }
};

// Update Admin Profile
exports.updateProfile = async (req, res) => {
    const parsed = parseProfileUpdates(req.body);

    if (parsed.error) {
        return res.status(400).json({
            success: false,
            message: parsed.error
        });
    }

    try {
        const result = await updateProfile(
            'admins',
            req.user.id,
            parsed.updates
        );

        const handled = handleUpdateResult(res, result, 'Admin');

        if (handled) return handled;

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

// Get All Users
exports.listUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT ${userFields} FROM users ORDER BY id`
        );

        return res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve users'
        });
    }
};

// Get Single User
exports.getUser = async (req, res) => {
    const id = parseUserId(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID'
        });
    }

    try {
        const [users] = await db.query(
            `SELECT ${userFields} FROM users WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve user'
        });
    }
};

// Update Any User
exports.updateUser = async (req, res) => {
    const id = parseUserId(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID'
        });
    }

    const parsed = parseProfileUpdates(req.body);

    if (parsed.error) {
        return res.status(400).json({
            success: false,
            message: parsed.error
        });
    }

    try {
        const result = await updateProfile(
            'users',
            id,
            parsed.updates
        );

        const handled = handleUpdateResult(res, result, 'User');

        if (handled) return handled;

        return res.status(200).json({
            success: true,
            message: 'User updated successfully'
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
            message: 'User update failed'
        });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    const id = parseUserId(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID'
        });
    }

    try {
        const [result] = await db.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'User deletion failed'
        });
    }
};
