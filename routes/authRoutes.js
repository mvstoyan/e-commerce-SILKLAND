const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/authController'); // Import the authentication controller methods
// Define routes for user registration, login, and logout
router.post('/register', register); // Route to handle user registration
router.post('/login', login); // Route to handle user login
router.get('/logout', logout); // Route to handle user logout

module.exports = router;