const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const Review = require('../models/Review');

const createProduct = async(req, res) => { // Function to create a new product
    req.body.user = req.user.userId;
    const product = await Product.create(req.body); // Create a new product in the database
    // Send a JSON response with the status code 201 Created and the created product
    res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async(req, res) => { // Function to get all products
    const products = await Product.find({}); // Function to get all products
    // Send a JSON response with the status code 200 OK, products, and the count of products
    res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSinglProduct = async(req, res) => { // Function to get a single product by ID
    const { id: productId } = req.params;
    // Find the product in the database based on the provided product ID
    const product = await Product.findOne({ _id: productId }).populate('reviews');
    if (!product) {  // Throw a NotFoundError if the product is not found
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    res.status(StatusCodes.OK).json({ product }); // Send a JSON response with the status code 200 OK and the product
};

const updateProduct = async(req, res) => { // Function to update a product by ID
    const { id:productId } = req.params;
    // Find the product in the database based on the provided product ID and update it with the new data
    const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
        new: true,
        runValidators: true,
    });
    if (!product) { // Throw a NotFoundError if the product is not found
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    // Send a JSON response with the status code 200 OK and the updated product
    res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => { // Function to delete a product by ID
    const { id: productId } = req.params;
    // Find the product in the database based on the provided product ID
    const product = await Product.findOne({ _id: productId });
    if (!product) { // Throw a NotFoundError if the product is not found
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    await Review.deleteMany({ product: productId }); // Delete all associated reviews of the product
    await Product.deleteOne({ _id: productId }); // Delete the product from the database
    // Send a JSON response with the status code 200 OK and a success message
    res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

const uploadImage = async (req, res) => { // Function to upload an image for a product
    if (!req.files) { // Check if a file is uploaded
        throw new CustomError.BadRequestError('No File Uploaded');
    }
    const productImage = req.files.image;

    if (!productImage.mimetype.startsWith('image')) { // Check if the uploaded file is an image
        throw new CustomError.BadRequestError('Please Upload Image');
    }

    const maxSize = 1024 * 1024;

    if (productImage.size > maxSize) { // Check if the image size exceeds the maximum allowed size
        throw new CustomError.BadRequestError(
        'Please upload image smaller than 1MB'
        );
    }

    const imagePath = path.join( 
        __dirname,
        '../public/uploads/' + `${productImage.name}`
    );
    await productImage.mv(imagePath); // Move the uploaded image to the specified path
    // Send a JSON response with the status code 200 OK and the path to the uploaded image
    res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
    createProduct,
    getAllProducts,
    getSinglProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
}