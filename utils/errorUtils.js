const handleError = (res, errorMessage, statusCode = 500) => {
    res.status(statusCode).json({ error: errorMessage });
};

module.exports = { handleError };