const db = require('../config/db');

const editableFields = ['full_name', 'email', 'phone', 'address'];

const parseProfileUpdates = (body) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'A JSON object is required' };
    }

    const keys = Object.keys(body);
    if (keys.length === 0 || keys.some((key) => !editableFields.includes(key))) {
        return {
            error: keys.length === 0
                ? 'At least one profile field is required'
                : `Only these fields can be updated: ${editableFields.join(', ')}`
        };
    }

    const updates = {};
    for (const key of keys) {
        const value = body[key];
        if (key === 'phone' || key === 'address') {
            if (value !== null && typeof value !== 'string') {
                return { error: `${key} must be a string or null` };
            }
            updates[key] = typeof value === 'string' ? value.trim() : null;
        } else {
            if (typeof value !== 'string' || !value.trim()) {
                return { error: `${key} must be a non-empty string` };
            }
            updates[key] = key === 'email' ? value.trim().toLowerCase() : value.trim();
        }
    }

    return { updates };
};

const updateProfile = async (table, id, updates) => {
    if (Object.prototype.hasOwnProperty.call(updates, 'email')) {
        const [accounts] = await db.query(
            `SELECT id FROM ${table} WHERE email = ? AND id <> ?`,
            [updates.email, id]
        );
        if (accounts.length > 0) {
            return 'duplicate';
        }
    }

    const fields = Object.keys(updates);
    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => updates[field]);
    const [result] = await db.query(
        `UPDATE ${table} SET ${assignments} WHERE id = ?`,
        [...values, id]
    );

    if (result.affectedRows === 0) {
        const [accounts] = await db.query(`SELECT id FROM ${table} WHERE id = ?`, [id]);
        if (accounts.length === 0) {
            return 'not-found';
        }
    }

    return 'updated';
};

module.exports = { parseProfileUpdates, updateProfile };
