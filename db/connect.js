const mongoose = require('mongoose');

const connectDB = (url) => { // Function to connect to the MongoDB database
  return mongoose.connect(url); // Use the 'mongoose.connect()' method to establish a connection to the specified URL
};

module.exports = connectDB;