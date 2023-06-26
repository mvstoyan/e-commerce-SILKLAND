const Review = require('../models/Review');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');


const createReview = async(req, res) => { // Function to create a new review
    const { product: productId } = req.body;
    const isValidProduct = await Product.findOne({ _id: productId }); // Check if the provided product ID is valid
    if (!isValidProduct) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    const alreadySubmitted = await Review.findOne({ // Check if the user has already submitted a review for the product
        product:productId,user:req.user.userId,
    });
    if(alreadySubmitted) {
        throw new CustomError.BadRequestError(
            'Already submitted review for this product'
        );
    }
    req.body.user = req.user.userId;
    const review = await Review.create(req.body); // Create a new review in the database
    // Send a JSON response with the status code 201 Created and the created review
    res.status(StatusCodes.CREATED).json({ review });
};
const getAllReviews = async(req, res) => { // Function to get all reviews
    const reviews = await Review.find({}) // Find all reviews in the database and populate the 'product' field with selected fields
    .populate({
        path: 'product',
        select: 'name company price',
    });
    // Send a JSON response with the status code 200 OK, reviews, and the count of reviews
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async(req, res) => { // Function to get a single review by ID
    const { id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId }); // Find the review in the database based on the provided review ID
    if(!review) { // Throw a NotFoundError if the review is not found
        throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
    }
    res.status(StatusCodes.OK).json({ review }); // Send a JSON response with the status code 200 OK and the review
};
const updateReview = async(req, res) => { // Function to update a review by ID
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const review = await Review.findOne({ _id: reviewId }); // Find the review in the database based on the provided review ID
    if(!review) { // Throw a NotFoundError if the review is not found
        throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
    }
    checkPermissions(req.user, review.user); // Check if the user has permission to update the review
    review.rating = rating;  // Update the review with the new rating, title, and comment
    review.title = title;
    review.comment = comment;
    await review.save();
    // Send a JSON response with the status code 200 OK and the updated review
    res.status(StatusCodes.OK).json({review });
};
const deleteReview = async(req, res) => { // Function to delete a review by ID
    const { id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId }); // Find the review in the database based on the provided review ID
    if(!review) { // Throw a NotFoundError if the review is not found
        throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
    }
    checkPermissions(req.user, review.user); // Check if the user has permission to delete the review
    await review.deleteOne(); // Delete the review from the database
    // Send a JSON response with the status code 200 OK and a success message
    res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' });
};

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
};
