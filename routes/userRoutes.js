const express = require('express');
const router = express.Router();
// Import the authentication and authorization middleware
const { 
    authenticateUser, 
    authorizePermissions 
} = require('../middleware/authentication')

// Import the user controller methods
const { 
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword, 
} = require('../controllers/userController');

// Define routes for handling user-related operations
router.route('/').get(authenticateUser, authorizePermissions('admin'), getAllUsers);
// - GET /: Retrieve all users (requires authentication and admin permission)

router.route('/showMe').get(authenticateUser, showCurrentUser);
// - GET /showMe: Retrieve the currently authenticated user's information

router.route('/updateUser').patch(authenticateUser, updateUser);
// - PATCH /updateUser: Update the currently authenticated user's information

router.route('/updateUserPasssword').patch(authenticateUser, updateUserPassword);
// - PATCH /updateUserPasssword: Update the currently authenticated user's password

router.route('/:id').get(authenticateUser, getSingleUser);
// - GET /:id: Retrieve a single user's information by their ID (requires authentication)

module.exports = router;