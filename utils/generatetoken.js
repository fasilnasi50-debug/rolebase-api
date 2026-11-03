const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required to issue authentication tokens');
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
};

module.exports = generateToken;
