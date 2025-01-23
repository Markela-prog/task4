const { handleError } = require('../utils/errorUtils');
const { verifyToken } = require('../utils/tokenUtils');
const { fetchUserById } = require('../utils/dbUtils');

const authenticateUser = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return handleError(res, 'Access denied. No token provided.', 401);

    try {
        const decoded = verifyToken(token);
        const user = await fetchUserById(decoded.userId);

        if (!user) return handleError(res, 'User not found.', 404);
        if (user.status === 'blocked' ) return handleError(res, 'Your account is blocked. Please contact support.', 403);

        req.user = user;
        next();
    } catch (error) {
        handleError(res, 'Invalid or expired token.', 401);
    }
};

module.exports = authenticateUser;