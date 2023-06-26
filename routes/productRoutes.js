const express = require('express');
const router = express.Router();
// Import the authentication and authorization middleware
const { 
    authenticateUser, 
    authorizePermissions 
} = require('../middleware/authentication')

// Import the product controller methods
const {
    createProduct,
    getAllProducts,
    getSinglProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
} = require('../controllers/productController');

// Define routes for handling product-related operations
router
    .route('/')
    .post([authenticateUser, authorizePermissions('admin')], createProduct)
    // - POST /: Create a new product (requires authentication and admin permission)
    .get(getAllProducts); // - GET /: Retrieve all products

router
    .route('/uploadImage')
    .post([authenticateUser, authorizePermissions('admin')], uploadImage);
    // - POST /uploadImage: Upload an image for a product (requires authentication and admin permission)

router
    .route('/:id')
    .get(getSinglProduct) // - GET /:id: Retrieve a single product by its ID
    .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
    // - PATCH /:id: Update a product by its ID (requires authentication and admin permission)
    .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);
    // - DELETE /:id: Delete a product by its ID (requires authentication and admin permission)

module.exports = router;