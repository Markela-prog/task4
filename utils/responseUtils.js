const generateResponse = (res, token, user, message, statusCode = 200) => {
    res.status(statusCode).json({
        message,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            last_login: new Date().toISOString(),
            created_at: user.created_at,
        },
    });
};

module.exports = { generateResponse };
