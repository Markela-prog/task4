const express = require('express');
const { getUsers, registerUser, loginUser, updateUserStatusController, deleteUser } = require('../controllers/userController');
const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/user/:id/block', authenticateUser, (req, res, next) => {
    req.body.isActive = false;
    next();
}, updateUserStatusController);

router.put('/user/:id/unblock', authenticateUser, (req, res, next) => {
    req.body.isActive = true;
    next();
}, updateUserStatusController);

router.put('/users/status', authenticateUser, updateUserStatusController);

router.delete('/users', authenticateUser, deleteUser);

router.get('/users', authenticateUser, getUsers);

module.exports = router;
