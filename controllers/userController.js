const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/tokenUtils');
const { handleError } = require('../utils/errorUtils');
const { generateResponse } = require('../utils/responseUtils');

const getUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();

        const sanitizedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            last_login: user.last_login,
            created_at: user.created_at,
        }));

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
        handleError(res, 'Failed to register user.');
    }

};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) return handleError(res, 'User not found.', 404);

        if (user.status === 'blocked'){
            return handleError(res, 'Your account is blocked. Please contact support.', 403);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return handleError(res, 'Invalid credentials.', 401);

        await userModel.updateLastLogin(user.id);

        const token = generateToken(user.id);
        generateResponse(res, token, user, 'Login successful');

    } catch (error) {
        handleError(res, 'Failed to login.')
    }
};

const updateUserStatusController = async (req, res) => {
    const { userIds, isActive } = req.body;

    try {
        const ids = Array.isArray(userIds) ? userIds : [req.params.id];
        await userModel.updateUserStatus(ids, isActive);

        res.status(200).json({
            message: `User(s) updated successfully to ${isActive ? 'active' : 'blocked'}.`,
        });
    } catch (error) {
        handleError(res, `Failed to update user(s) to status: ${isActive ? 'active' : 'blocked'}.`);
    }
};


const deleteUser = async (req, res) => {
    const { userIds } = req.body;
    try {
        const ids = Array.isArray(userIds) ? userIds : [req.params.id];
        await userModel.deleteUsers(ids);

        res.status(200).json({ message: 'User(s) deleted successfully.' });
    } catch (error) {
        handleError(res, 'Failed to delete user(s).');
    }
};


module.exports = { registerUser, loginUser, getUsers, deleteUser, updateUserStatusController };