const { StatusCodes } = require('http-status-codes');
const errorHandlerMiddleware = (err, req, res, next) => { // Error handler middleware
  let customError = { // Set default values for the custom error response
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
  };
  if (err.name === 'ValidationError') { // Handle validation errors{
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(','); // Concatenate all error messages
    customError.statusCode = 400;
  }
  if (err.code && err.code === 11000) { // Handle duplicate key errors
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = 400;
  }
  if (err.name === 'CastError') { // Handle cast errors (e.g., invalid ObjectId)
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  }
// Return the custom error response
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
