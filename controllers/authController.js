const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

// Function to handle user registration
const register = async (req,res) => {
    const { email, name, password } = req.body;  // Extract email, name, and password from the request body

    // Check if the email already exists in the User collection
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        // Throw a BadRequestError if the email already exists
        throw new CustomError.BadRequestError('Email already exists');
    }

    // first registered user is an admin
    const isFirstAccount = (await User.countDocuments ({})) === 0; // Determine the role of the user (admin or user)
    const role = isFirstAccount ? 'admin' : 'user';

    // Create a new user document in the User collection
    const user = await User.create({ name, email, password, role });
    const tokenUser = createTokenUser(user); // Generate a token for the user
    attachCookiesToResponse({ res,user:tokenUser }) // Attach the generated token to the response cookies
    
    // Send a JSON response with the status code 201 Created and the user token
    res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req,res) => { // Function to handle user login
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) { // Check if email or password is missing
        // Throw a BadRequestError if email or password is missing
        throw new CustomError.BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({ email }); // Find a user document based on the provided email
    
    if(!user) { // If no user is found, throw an UnauthenticatedError
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    // Compare the provided password with the user's password stored in the database
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect) { // If passwords don't match, throw an UnauthenticatedError
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    const tokenUser = createTokenUser(user); // Generate a token for the user
    attachCookiesToResponse({ res,user:tokenUser }) // Attach the generated token to the response cookies
    
    // Send a JSON response with the status code 201 Created and the user token
    res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const logout = async (req,res) => { // Function to handle user logout
    // Set an HTTP-only cookie named 'token' with the value 'logout' and an expiration time in the past
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    // Send a JSON response with the status code 200 OK and a message indicating successful logout
    res.status(StatusCodes.OK).json({ msg:'user logged out!' });
};

module.exports = { // Export the functions to be used by other modules
    register,
    login,
    logout,
};