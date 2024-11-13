const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth.Contoller')

// Registration Route
router.post('/register', AuthController.register)

// Login Route
router.post('/login', AuthController.login)

// refresh-token route
router.post('/refresh-token', AuthController.refreshToken);

//logout route
router.delete('/logout', AuthController.logout);


module.exports = router;