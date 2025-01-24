const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/tokenUtils');
const { handleError } = require('../utils/errorUtils');
const { generateResponse } = require('../utils/responseUtils');

const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    last_login: user.last_login,
    created_at: user.created_at,
});

const handleUserAction = async (req, res, action, successMessage) => {
    const { userIds } = req.body;
    try {
        const ids = Array.isArray(userIds) ? userIds : [req.params.id];
        await action(ids);
        handleError(res, successMessage, 200);
    } catch (error) {
        handleError(res, `Failed to ${successMessage.toLowerCase()}`);
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        const sanitizedUsers = users.map(sanitizeUser);
        res.status(200).json(sanitizedUsers);
    } catch (error) {
        handleError(res, 'Failed to retrieve users.');
    }
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.createUser(name, email, hashedPassword);
        const token = generateToken(newUser.id);
        generateResponse(res, token, newUser, 'User registered successfully', 201);
    } catch (error) {
        const message = error.code === '23505' ? 
            'Email already exists. Please use a different email.' : 
            'Failed to register user.';
        handleError(res, message, error.code === '23505' ? 400 : 500);
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) return handleError(res, 'Email does not exist. Please check your input.', 404);
        if (user.status === 'blocked') return handleError(res, 'Your account is blocked. Please contact support.', 403);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return handleError(res, 'Incorrect password. Please try again.', 401);

        await userModel.updateLastLogin(user.id);
        const token = generateToken(user.id);
        generateResponse(res, token, user, 'Login successful');
    } catch (error) {
        handleError(res, 'Failed to process login request. Please try again later.', 500);
    }
};

const updateUserStatusController = async (req, res) => {
    const { isActive } = req.body;
    await handleUserAction(
        req,
        res,
        (ids) => userModel.updateUserStatus(ids, isActive),
        `User(s) updated successfully to ${isActive ? 'active' : 'blocked'}.`
    );
};

const deleteUser = async (req, res) => {
    await handleUserAction(req, res, userModel.deleteUsers, 'User(s) deleted successfully.');
};

module.exports = { registerUser, loginUser, getUsers, deleteUser, updateUserStatusController };