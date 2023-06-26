const express = require('express');
const router = express.Router();
// Import the authentication and authorization middleware
const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

const { // Import the order controller methods
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
} = require ('../controllers/orderController');

// Define routes for handling order-related operations
router
  .route('/')
  .post(authenticateUser, createOrder) // - POST /: Create a new order (requires authentication)
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);
  // - GET /: Retrieve all orders (requires authentication and admin permission)

router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders);
// - GET /showAllMyOrders: Retrieve all orders for the current user (requires authentication)

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder) // - GET /:id: Retrieve a single order by its ID (requires authentication)
  .patch(authenticateUser, updateOrder); // - PATCH /:id: Update an order by its ID (requires authentication)

module.exports = router;