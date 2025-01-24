const jwt = require("jsonwebtoken");
const { generateResponse } = require('../utils/responseUtils');
const { handleError } = require('../utils/errorUtils');

const verifyAuth = (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return handleError(res, "Unauthorized", 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.status === "blocked") {
            return handleError(res, "User is blocked", 403);
        }

        return generateResponse(res, token, decoded, "Authorized");
    } catch (error) {
        return handleError(res, "Invalid token", 401);
    }
};

module.exports = { verifyAuth };