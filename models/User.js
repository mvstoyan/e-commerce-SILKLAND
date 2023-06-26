const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs');

// Define the User Schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        requires: [true, 'Please provide name'],
        minlenght: 3,
        maxlenght: 50,
    },
    email: {
        type: String,
        unique: true,
        requires: [true, 'Please provide email'],
        validate: {
            validator: validator.isEmail,
            message:'Please provide valid email'
        }
    },
    password: {
        type: String,
        requires: [true, 'Please provide password'],
        minlenght: 6,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
});

// Middleware function executed before saving the user
UserSchema.pre('save', async function () {
    //console.log(this.modifiedPaths());
    //console.log(this.isModified('name'))
    if(!this.isModified('password')) return; // Check if the password field has been modified
    const salt = await bcrypt.genSalt(10); // Generate a salt and hash the password
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare the candidate password with the hashed password
UserSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password);
    return isMatch;
};
// Create and export the User model
module.exports = mongoose.model('User', UserSchema)