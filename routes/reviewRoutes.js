const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication'); // Import the authentication middleware

const { // Import the review controller methods
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
} = require ('../controllers/reviewController');

// Define routes for handling reviews
router.route('/').post(authenticateUser, createReview).get(getAllReviews);
// - POST /: Create a new review (requires authentication)
// - GET /: Retrieve all reviews

router
    .route('/:id')
    .get(getSingleReview)
    .patch(authenticateUser, updateReview)
    .delete(authenticateUser, deleteReview);
    // - GET /:id: Retrieve a single review by its ID
    // - PATCH /:id: Update a review by its ID (requires authentication)
    // - DELETE /:id: Delete a review by its ID (requires authentication)

module.exports = router;