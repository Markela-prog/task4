const pool = require('../config/db');

const getAllUsers = async () => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY last_login DESC');
        return result.rows.map(user => ({
            ...user,
            last_login: user.last_login || 'No login recorded',
        }));
    } catch (error) {
        throw new Error('Failed to fetch users');
    }
};

const updateLastLogin = async (userId) => {
    try {
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
    } catch (error) {
        throw new Error('Failed to update last login');
    }
};

const createUser = async (name, email, password) => {
    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, last_login) VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [name, email, password]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to create user');
    }
};

const getUserByEmail = async (email) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to fetch user by email');
    }
};

const updateUserStatus = async (ids, isActive) => {
    const status = isActive ? 'active' : 'blocked';
    const placeholders = ids.map((_, index) => `$${index + 2}`).join(',');
    const values = [status, ...ids];

    try {
        await pool.query(`UPDATE users SET status = $1 WHERE id IN (${placeholders})`, values);
    } catch (error) {
        throw new Error('Failed to update user status');
    }
};

const deleteUsers = async (ids) => {
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');

    try {
        await pool.query(`DELETE FROM users WHERE id IN (${placeholders})`, ids);
    } catch (error) {
        throw new Error('Failed to delete users');
    }
};

module.exports = { getAllUsers, createUser, getUserByEmail, updateUserStatus, deleteUsers, updateLastLogin };
