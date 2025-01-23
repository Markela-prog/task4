const pool = require('../config/db');

const getAllUsers = async () => {
    const result = await pool.query('SELECT * FROM users ORDER BY last_login DESC');
    return result.rows.map(user => ({
        ...user,
        last_login: user.last_login || 'No login recorded',
    }));
};

const updateLastLogin = async (userId) => {
    const query = `UPDATE users SET last_login = NOW() WHERE id = $1`;
    try {
        await pool.query(query, [userId]);
    } catch (error) {
        throw error;
    }
}

const createUser = async (name, email, password) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, last_login) VALUES ($1, $2, $3, NOW()) RETURNING *`,
        [name, email, password]
    );
    return result.rows[0];
};

const getUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
}

const updateUserStatus = async (ids, isActive) => {
    const status = isActive ? 'active' : 'blocked';
    const placeholders = ids.map((_, index) => `$${index + 2}`).join(',');
    const values = [status, ...ids];

    const query = `UPDATE users SET status = $1 WHERE id IN (${placeholders})`;

    try {
        await pool.query(query, values);
    } catch (error) {
        throw error;
    }
};

const deleteUsers = async (ids) => {
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
    await pool.query(`DELETE FROM users WHERE id IN (${placeholders})`, ids);
};

module.exports = { getAllUsers, createUser, getUserByEmail, updateUserStatus, deleteUsers, updateLastLogin };
