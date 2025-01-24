const handleError = (res, errorMessage, statusCode = 500) => {
    res.status(statusCode).json({ message: errorMessage });
};

module.exports = { handleError };